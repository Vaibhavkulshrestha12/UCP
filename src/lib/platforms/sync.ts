import { Platform, SyncStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fetchAtCoderSyncData, fetchUpcomingAtCoderContests } from "@/lib/platforms/adapters/atcoder";
import {
  fetchCodeforcesSyncData,
  fetchUpcomingCodeforcesContests
} from "@/lib/platforms/adapters/codeforces";
import { fetchLeetCodeSyncData } from "@/lib/platforms/adapters/leetcode";

function normalizeVerdict(value: string | null | undefined) {
  return (value ?? "UNKNOWN").replace(/\s+/g, "_").toUpperCase();
}

async function upsertContest(contest: {
  id: string;
  platform: Platform;
  externalId: string;
  title: string;
  slug: string | null;
  division: string | null;
  difficultyTag: string | null;
  startsAtUtc: Date;
  durationMins: number;
  registrationUrl: string | null;
  rawJson: unknown;
}) {
  await prisma.contest.upsert({
    where: { id: contest.id },
    create: {
      ...contest,
      rawJson: contest.rawJson as never
    },
    update: {
      title: contest.title,
      slug: contest.slug,
      division: contest.division,
      difficultyTag: contest.difficultyTag,
      startsAtUtc: contest.startsAtUtc,
      durationMins: contest.durationMins,
      registrationUrl: contest.registrationUrl,
      rawJson: contest.rawJson as never
    }
  });
}

async function replaceSnapshots(
  userId: string,
  platform: Platform,
  snapshots: Array<{ snapshotType: string; title: string; payload: unknown }>
) {
  await prisma.platformSnapshot.deleteMany({
    where: { userId, platform }
  });

  await Promise.all(
    snapshots.map((snapshot) =>
      prisma.platformSnapshot.create({
        data: {
          userId,
          platform,
          snapshotType: snapshot.snapshotType,
          title: snapshot.title,
          payload: snapshot.payload as never,
          syncedAtUtc: new Date()
        }
      })
    )
  );
}

async function syncLeetCodeAccount(userId: string, handle: string) {
  const data = await fetchLeetCodeSyncData(handle);
  if (!data) {
    return;
  }

  await prisma.platformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform: "LEETCODE"
      }
    },
    data: {
      verified: true,
      linkedAt: new Date(),
      lastSyncedAt: new Date(),
      rawProfileJson: data.profile as never
    }
  });

  await replaceSnapshots(userId, "LEETCODE", [
    {
      snapshotType: "hero",
      title: "System Performance",
      payload: data.hero
    }
  ]);

  if (data.dailyChallenge) {
    const challengeDate = new Date(`${data.dailyChallenge.date}T00:00:00.000Z`);

    await prisma.dailyChallengeSnapshot.upsert({
      where: {
        userId_challengeDate_platform: {
          userId,
          challengeDate,
          platform: "LEETCODE"
        }
      },
      create: {
        userId,
        challengeDate,
        title: data.dailyChallenge.question.title,
        difficulty: data.dailyChallenge.question.difficulty,
        acceptanceRate:
          data.dailyChallenge.question.acRate !== null &&
          data.dailyChallenge.question.acRate !== undefined
            ? `${data.dailyChallenge.question.acRate.toFixed(1)}%`
            : null,
        url: `https://leetcode.com${data.dailyChallenge.link}`,
        solved: data.dailyChallenge.userStatus === "FINISHED",
        platform: "LEETCODE",
        rawJson: data.dailyChallenge as never
      },
      update: {
        title: data.dailyChallenge.question.title,
        difficulty: data.dailyChallenge.question.difficulty,
        acceptanceRate:
          data.dailyChallenge.question.acRate !== null &&
          data.dailyChallenge.question.acRate !== undefined
            ? `${data.dailyChallenge.question.acRate.toFixed(1)}%`
            : null,
        url: `https://leetcode.com${data.dailyChallenge.link}`,
        solved: data.dailyChallenge.userStatus === "FINISHED",
        rawJson: data.dailyChallenge as never
      }
    });
  }

  await Promise.all(
    data.submissions.map((submission) =>
      prisma.submissionEvent.upsert({
        where: {
          platform_externalId_userId: {
            platform: "LEETCODE",
            externalId: `${submission.titleSlug}:${submission.timestamp}`,
            userId
          }
        },
        create: {
          userId,
          platform: "LEETCODE",
          externalId: `${submission.titleSlug}:${submission.timestamp}`,
          title: submission.title,
          verdict: normalizeVerdict(submission.statusDisplay),
          runtimeLabel: submission.runtime ?? null,
          memoryLabel: submission.memory ?? null,
          languageLabel: submission.lang ?? null,
          submittedAtUtc: new Date(Number(submission.timestamp) * 1000),
          rawJson: submission as never
        },
        update: {
          title: submission.title,
          verdict: normalizeVerdict(submission.statusDisplay),
          runtimeLabel: submission.runtime ?? null,
          memoryLabel: submission.memory ?? null,
          languageLabel: submission.lang ?? null,
          submittedAtUtc: new Date(Number(submission.timestamp) * 1000),
          rawJson: submission as never
        }
      })
    )
  );
}

async function syncCodeforcesAccount(userId: string, handle: string) {
  const data = await fetchCodeforcesSyncData(handle);
  if (!data) {
    return;
  }

  await prisma.platformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform: "CODEFORCES"
      }
    },
    data: {
      verified: true,
      linkedAt: new Date(),
      lastSyncedAt: new Date(),
      rawProfileJson: data.profile as never
    }
  });

  await replaceSnapshots(userId, "CODEFORCES", [
    {
      snapshotType: "hero",
      title: "Global Rating",
      payload: data.hero
    },
    {
      snapshotType: "rating-history",
      title: "Rating History",
      payload: data.history
    }
  ]);

  await Promise.all(
    data.submissions.map((submission) =>
      prisma.submissionEvent.upsert({
        where: {
          platform_externalId_userId: {
            platform: "CODEFORCES",
            externalId: String(submission.id),
            userId
          }
        },
        create: {
          userId,
          platform: "CODEFORCES",
          externalId: String(submission.id),
          title: submission.problem.name,
          verdict: normalizeVerdict(submission.verdict),
          runtimeLabel:
            submission.timeConsumedMillis !== null && submission.timeConsumedMillis !== undefined
              ? `${submission.timeConsumedMillis}ms`
              : null,
          memoryLabel:
            submission.memoryConsumedBytes !== null && submission.memoryConsumedBytes !== undefined
              ? `${Math.round(submission.memoryConsumedBytes / 1024)} KB`
              : null,
          languageLabel: submission.programmingLanguage ?? null,
          submittedAtUtc: new Date(submission.creationTimeSeconds * 1000),
          rawJson: submission as never
        },
        update: {
          title: submission.problem.name,
          verdict: normalizeVerdict(submission.verdict),
          runtimeLabel:
            submission.timeConsumedMillis !== null && submission.timeConsumedMillis !== undefined
              ? `${submission.timeConsumedMillis}ms`
              : null,
          memoryLabel:
            submission.memoryConsumedBytes !== null && submission.memoryConsumedBytes !== undefined
              ? `${Math.round(submission.memoryConsumedBytes / 1024)} KB`
              : null,
          languageLabel: submission.programmingLanguage ?? null,
          submittedAtUtc: new Date(submission.creationTimeSeconds * 1000),
          rawJson: submission as never
        }
      })
    )
  );
}

async function syncAtCoderAccount(userId: string, handle: string) {
  const data = await fetchAtCoderSyncData(handle);
  if (!data) {
    return;
  }

  await prisma.platformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform: "ATCODER"
      }
    },
    data: {
      verified: true,
      linkedAt: new Date(),
      lastSyncedAt: new Date(),
      rawProfileJson: data.profile as never
    }
  });

  await replaceSnapshots(userId, "ATCODER", [
    {
      snapshotType: "hero",
      title: "Performance Index",
      payload: data.hero
    },
    {
      snapshotType: "rank-history",
      title: "Rank History",
      payload: data.history
    }
  ]);

  await Promise.all(
    data.submissions.slice(-50).map((submission) =>
      prisma.submissionEvent.upsert({
        where: {
          platform_externalId_userId: {
            platform: "ATCODER",
            externalId: String(submission.id),
            userId
          }
        },
        create: {
          userId,
          platform: "ATCODER",
          externalId: String(submission.id),
          title: submission.problem_id,
          verdict: normalizeVerdict(submission.result),
          runtimeLabel: null,
          memoryLabel: null,
          languageLabel: submission.language ?? null,
          submittedAtUtc: new Date(submission.epoch_second * 1000),
          rawJson: submission as never
        },
        update: {
          title: submission.problem_id,
          verdict: normalizeVerdict(submission.result),
          languageLabel: submission.language ?? null,
          submittedAtUtc: new Date(submission.epoch_second * 1000),
          rawJson: submission as never
        }
      })
    )
  );
}

async function syncGlobalContests() {
  const [codeforcesContests, atcoderContests] = await Promise.all([
    fetchUpcomingCodeforcesContests(),
    fetchUpcomingAtCoderContests()
  ]);

  await Promise.all(
    [...codeforcesContests, ...atcoderContests].map((contest) => upsertContest(contest))
  );
}

export async function syncUserPlatforms(userId: string, trigger = "manual") {
  const syncRun = await prisma.syncRun.create({
    data: {
      userId,
      status: SyncStatus.RUNNING,
      trigger,
      startedAtUtc: new Date()
    }
  });

  try {
    await syncGlobalContests();

    const accounts = await prisma.platformAccount.findMany({
      where: {
        userId,
        verified: true
      }
    });

    for (const account of accounts) {
      if (account.platform === "LEETCODE") {
        await syncLeetCodeAccount(userId, account.handle);
      }

      if (account.platform === "CODEFORCES") {
        await syncCodeforcesAccount(userId, account.handle);
      }

      if (account.platform === "ATCODER") {
        await syncAtCoderAccount(userId, account.handle);
      }
    }

    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: SyncStatus.SUCCESS,
        finishedAtUtc: new Date()
      }
    });
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: SyncStatus.FAILED,
        finishedAtUtc: new Date(),
        error: error instanceof Error ? error.message : "Unknown sync failure"
      }
    });

    throw error;
  }
}
