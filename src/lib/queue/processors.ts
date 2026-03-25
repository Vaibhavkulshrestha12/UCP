import { prisma } from "@/lib/db/prisma";
import { sendUserNotification } from "@/lib/notifications/service";
import { syncUserPlatforms } from "@/lib/platforms/sync";
import { deliveryKey, getLocalDayRange } from "@/lib/utils/time";

function contestPlatformsToLabel(platforms: string[]) {
  return platforms.length ? platforms.join(", ") : "your linked platforms";
}

export async function processPlatformSyncJob(userId: string, trigger = "queue") {
  await syncUserPlatforms(userId, trigger);
}

export async function processDailyProblemJob(userId: string) {
  const [profile, preference, challenge] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.dailyChallengeSnapshot.findFirst({
      where: { userId, platform: "LEETCODE" },
      orderBy: { challengeDate: "desc" }
    })
  ]);

  if (!profile?.email || !preference?.dailyProblemEnabled || !challenge) {
    return;
  }

  await sendUserNotification({
    userId,
    kind: "daily-problem",
    subject: `UCP Daily Problem: ${challenge.title}`,
    deliveryKey: deliveryKey(["daily-problem", userId, challenge.challengeDate.toISOString().slice(0, 10)]),
    html: `
      <p>Your daily problem is ready.</p>
      <p><strong>${challenge.title}</strong> (${challenge.difficulty})</p>
      <p>Acceptance: ${challenge.acceptanceRate ?? "N/A"}</p>
      <p><a href="${challenge.url ?? "#"}">Open problem</a></p>
    `
  });
}

export async function processStreakCheckJob(userId: string) {
  const [profile, preference] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.userPreference.findUnique({ where: { userId } })
  ]);

  if (!profile?.email || !preference?.streakReminder) {
    return;
  }

  const { startUtc, endUtc } = getLocalDayRange(preference.timezone, new Date());

  const solvedToday = await prisma.submissionEvent.count({
    where: {
      userId,
      verdict: { contains: "AC" },
      submittedAtUtc: {
        gte: startUtc,
        lte: endUtc
      }
    }
  });

  if (solvedToday > 0) {
    return;
  }

  await sendUserNotification({
    userId,
    kind: "streak-check",
    subject: "UCP Streak Alert",
    deliveryKey: deliveryKey(["streak-check", userId, startUtc.toISOString().slice(0, 10)]),
    html: `
      <p>No accepted solve has been synced for your local day yet.</p>
      <p>Jump back in before ${preference.streakCheckTime} (${preference.timezone}) to keep the streak intact.</p>
    `
  });
}

export async function processContestReminderJob(userId: string) {
  const [profile, preference, accounts] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.platformAccount.findMany({
      where: { userId, verified: true },
      select: { platform: true }
    })
  ]);

  if (!profile?.email || !preference?.contestReminder || accounts.length === 0) {
    return;
  }

  const now = new Date();
  const within24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const platforms = accounts.map((account) => account.platform);

  const contests = await prisma.contest.findMany({
    where: {
      platform: { in: platforms },
      startsAtUtc: {
        gte: now,
        lte: within24Hours
      }
    },
    orderBy: { startsAtUtc: "asc" }
  });

  if (contests.length > 0) {
    const unseen = await prisma.contestReminderState.findMany({
      where: {
        userId,
        contestId: { in: contests.map((contest) => contest.id) }
      }
    });

    const unseenSet = new Set(
      unseen.filter((state) => !state.t24ReminderSentAt).map((state) => state.contestId)
    );

    const pending = contests.filter(
      (contest) => !unseen.length || unseenSet.has(contest.id) || !unseen.some((state) => state.contestId === contest.id)
    );

    if (pending.length > 0) {
      await sendUserNotification({
        userId,
        kind: "contest-reminder",
        subject: "UCP Contest Reminder",
        deliveryKey: deliveryKey([
          "contest-reminder",
          userId,
          pending.map((contest) => contest.id).join("-")
        ]),
        html: `
          <p>Upcoming contests in the next 24 hours for ${contestPlatformsToLabel(platforms)}.</p>
          <ul>
            ${pending
              .map(
                (contest) =>
                  `<li><strong>${contest.title}</strong> (${contest.platform}) at ${contest.startsAtUtc.toISOString()}</li>`
              )
              .join("")}
          </ul>
        `
      });

      await Promise.all(
        pending.map((contest) =>
          prisma.contestReminderState.upsert({
            where: {
              userId_contestId: {
                userId,
                contestId: contest.id
              }
            },
            create: {
              userId,
              contestId: contest.id,
              t24ReminderSentAt: new Date()
            },
            update: {
              t24ReminderSentAt: new Date()
            }
          })
        )
      );
    }
  }

  if (!preference.liveContestAlert) {
    return;
  }

  const liveWindow = new Date(now.getTime() + 15 * 60 * 1000);
  const liveContests = await prisma.contest.findMany({
    where: {
      platform: { in: platforms },
      startsAtUtc: {
        gte: now,
        lte: liveWindow
      }
    },
    orderBy: { startsAtUtc: "asc" }
  });

  for (const contest of liveContests) {
    const state = await prisma.contestReminderState.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: contest.id
        }
      }
    });

    if (state?.liveReminderSentAt) {
      continue;
    }

    await sendUserNotification({
      userId,
      kind: "contest-live",
      subject: `${contest.title} starts soon`,
      deliveryKey: deliveryKey(["contest-live", userId, contest.id]),
      html: `
        <p><strong>${contest.title}</strong> starts at ${contest.startsAtUtc.toISOString()}.</p>
        <p><a href="${contest.registrationUrl ?? "#"}">Open contest</a></p>
      `
    });

    await prisma.contestReminderState.upsert({
      where: {
        userId_contestId: {
          userId,
          contestId: contest.id
        }
      },
      create: {
        userId,
        contestId: contest.id,
        liveReminderSentAt: new Date()
      },
      update: {
        liveReminderSentAt: new Date()
      }
    });
  }
}
