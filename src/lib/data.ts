import type { Platform } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getOrCreatePreference(userId: string, timezone = "UTC") {
  return prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      timezone
    },
    update: {}
  });
}

export async function getPreference(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId }
  });
}

export async function getPlatformAccounts(userId: string) {
  return prisma.platformAccount.findMany({
    where: { userId },
    orderBy: { platform: "asc" }
  });
}

export async function getSnapshots(userId: string, platform?: Platform) {
  return prisma.platformSnapshot.findMany({
    where: {
      userId,
      ...(platform ? { platform } : {})
    },
    orderBy: [{ platform: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getContests(platform?: Platform) {
  return prisma.contest.findMany({
    where: platform ? { platform } : undefined,
    orderBy: { startsAtUtc: "asc" },
    take: 6
  });
}

export async function getSubmissions(userId: string, platform: Platform) {
  return prisma.submissionEvent.findMany({
    where: { userId, platform },
    orderBy: { submittedAtUtc: "desc" },
    take: 8
  });
}

export async function getSubmissionHistory(userId: string, platform?: Platform, take = 180) {
  return prisma.submissionEvent.findMany({
    where: {
      userId,
      ...(platform ? { platform } : {})
    },
    orderBy: { submittedAtUtc: "desc" },
    take
  });
}

export async function getDailyChallenge(userId: string) {
  return prisma.dailyChallengeSnapshot.findFirst({
    where: { userId, platform: "LEETCODE" },
    orderBy: { challengeDate: "desc" }
  });
}
