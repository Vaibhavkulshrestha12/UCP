import {
  getContestReminderQueue,
  getDailyProblemQueue,
  getPlatformSyncQueue,
  getStreakCheckQueue
} from "@/lib/queue/queues";

export async function enqueueInitialSync(userId: string) {
  await getPlatformSyncQueue().add(
    "initial-sync",
    { userId, trigger: "initial-sync" },
    {
      jobId: `platform-sync-${userId}`,
      removeOnComplete: true
    }
  );
}

export async function enqueueReminderRefresh(userId: string) {
  await Promise.all([
    getDailyProblemQueue().add(
      "daily-problem",
      { userId },
      {
        jobId: `daily-problem-${userId}`,
        removeOnComplete: true
      }
    ),
    getStreakCheckQueue().add(
      "streak-check",
      { userId },
      {
        jobId: `streak-check-${userId}`,
        removeOnComplete: true
      }
    ),
    getContestReminderQueue().add(
      "contest-reminder",
      { userId },
      {
        jobId: `contest-reminder-${userId}`,
        removeOnComplete: true
      }
    )
  ]);
}
