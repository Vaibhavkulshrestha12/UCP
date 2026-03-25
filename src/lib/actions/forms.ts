"use server";

import { revalidatePath } from "next/cache";
import type { Platform } from "@prisma/client";
import { ensureUserProfile, requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { normalizePlatformHandle } from "@/lib/platforms/handles";
import { enqueueInitialSync, enqueueReminderRefresh } from "@/lib/queue/jobs";
import { verifyAllHandles } from "@/lib/platforms/verify";
import { onboardingSchema, settingsSchema } from "@/lib/validation/forms";

function parseFormPayload(formData: FormData) {
  return {
    displayName: String(formData.get("displayName") ?? "").trim(),
    leetcodeUsername: normalizePlatformHandle("LEETCODE", String(formData.get("leetcodeUsername") ?? "")),
    codeforcesHandle: normalizePlatformHandle("CODEFORCES", String(formData.get("codeforcesHandle") ?? "")),
    atcoderHandle: normalizePlatformHandle("ATCODER", String(formData.get("atcoderHandle") ?? "")),
    dailyProblemEnabled: formData.get("dailyProblemEnabled") === "on",
    streakReminderEnabled: formData.get("streakReminderEnabled") === "on",
    contestReminderEnabled: formData.get("contestReminderEnabled") === "on",
    liveContestAlertEnabled: formData.get("liveContestAlertEnabled") === "on",
    sidebarShowcasePlatform: String(formData.get("sidebarShowcasePlatform") ?? "LEETCODE"),
    solveTime: String(formData.get("solveTime") ?? "20:00"),
    streakCheckTime: String(formData.get("streakCheckTime") ?? "22:30"),
    timezone: String(formData.get("timezone") ?? "UTC")
  };
}

async function persistPlatformAccount(input: {
  userId: string;
  platform: Platform;
  handle: string;
  verified: boolean;
  rawProfileJson: unknown;
}) {
  return prisma.platformAccount.upsert({
    where: {
      userId_platform: {
        userId: input.userId,
        platform: input.platform
      }
    },
    create: {
      userId: input.userId,
      platform: input.platform,
      handle: input.handle,
      verified: input.verified,
      linkedAt: input.verified ? new Date() : null,
      rawProfileJson: input.rawProfileJson as never
    },
    update: {
      handle: input.handle,
      verified: input.verified,
      linkedAt: input.verified ? new Date() : null,
      rawProfileJson: input.rawProfileJson as never
    }
  });
}

async function persistProfileAndPreferences(profileId: string, input: ReturnType<typeof parseFormPayload>) {
  await prisma.userPreference.upsert({
    where: { userId: profileId },
    create: {
      userId: profileId,
      dailyProblemEnabled: input.dailyProblemEnabled,
      streakReminder: input.streakReminderEnabled,
      contestReminder: input.contestReminderEnabled,
      liveContestAlert: input.liveContestAlertEnabled,
      sidebarShowcasePlatform: input.sidebarShowcasePlatform as Platform,
      solveTime: input.solveTime,
      streakCheckTime: input.streakCheckTime,
      timezone: input.timezone
    },
    update: {
      dailyProblemEnabled: input.dailyProblemEnabled,
      streakReminder: input.streakReminderEnabled,
      contestReminder: input.contestReminderEnabled,
      liveContestAlert: input.liveContestAlertEnabled,
      sidebarShowcasePlatform: input.sidebarShowcasePlatform as Platform,
      solveTime: input.solveTime,
      streakCheckTime: input.streakCheckTime,
      timezone: input.timezone
    }
  });

  const profile = await prisma.userProfile.findUnique({
    where: { id: profileId },
    select: { displayName: true, displayNameEditedAt: true }
  });

  const nextDisplayName =
    input.displayName &&
    profile &&
    input.displayName !== profile.displayName &&
    !profile.displayNameEditedAt
      ? input.displayName
      : undefined;

  await prisma.userProfile.update({
    where: { id: profileId },
    data: {
      timezone: input.timezone,
      onboardingComplete: true,
      ...(nextDisplayName
        ? {
            displayName: nextDisplayName,
            displayNameEditedAt: profile?.displayNameEditedAt ?? new Date()
          }
        : {})
    }
  });
}

async function unlinkPlatform(profileId: string, platform: Platform) {
  await prisma.$transaction([
    prisma.platformAccount.deleteMany({
      where: { userId: profileId, platform }
    }),
    prisma.platformSnapshot.deleteMany({
      where: { userId: profileId, platform }
    }),
    prisma.submissionEvent.deleteMany({
      where: { userId: profileId, platform }
    }),
    prisma.contestReminderState.deleteMany({
      where: {
        userId: profileId,
        contest: {
          platform
        }
      }
    })
  ]);
}

async function persistHandles(profileId: string, verification: Awaited<ReturnType<typeof verifyAllHandles>>, input: ReturnType<typeof parseFormPayload>) {
  const operations: Array<Promise<unknown>> = [
    persistPlatformAccount({
      userId: profileId,
      platform: "LEETCODE",
      handle: input.leetcodeUsername,
      verified: Boolean(verification.leetcode),
      rawProfileJson: verification.leetcode ?? {}
    })
  ];

  if (input.codeforcesHandle) {
    operations.push(
      persistPlatformAccount({
        userId: profileId,
        platform: "CODEFORCES",
        handle: input.codeforcesHandle,
        verified: Boolean(verification.codeforces),
        rawProfileJson: verification.codeforces ?? {}
      })
    );
  } else {
    operations.push(unlinkPlatform(profileId, "CODEFORCES"));
  }

  if (input.atcoderHandle) {
    operations.push(
      persistPlatformAccount({
        userId: profileId,
        platform: "ATCODER",
        handle: input.atcoderHandle,
        verified: Boolean(verification.atcoder),
        rawProfileJson: verification.atcoder ?? {}
      })
    );
  } else {
    operations.push(unlinkPlatform(profileId, "ATCODER"));
  }

  await Promise.all(operations);
}

export async function submitOnboarding(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const parsed = onboardingSchema.parse(parseFormPayload(formData));
  const profile = await ensureUserProfile(currentUser);
  const verification = await verifyAllHandles(parsed);

  await persistProfileAndPreferences(profile.id, parsed);
  await persistHandles(profile.id, verification, parsed);
  await enqueueInitialSync(profile.id);
  await enqueueReminderRefresh(profile.id);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function submitSettings(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const profile = await ensureUserProfile(currentUser);
  const parsed = settingsSchema.parse(parseFormPayload(formData));
  const verification = await verifyAllHandles(parsed);

  await persistProfileAndPreferences(profile.id, parsed);
  await persistHandles(profile.id, verification, parsed);
  await enqueueInitialSync(profile.id);
  await enqueueReminderRefresh(profile.id);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/leetcode");
  revalidatePath("/codeforces");
  revalidatePath("/atcoder");
}
