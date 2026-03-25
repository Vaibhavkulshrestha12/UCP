import { Queue } from "bullmq";
import { env } from "@/lib/env";

const connection = {
  url: env.REDIS_URL
};

export function getPlatformSyncQueue() {
  return new Queue("platform-sync", { connection });
}

export function getDailyProblemQueue() {
  return new Queue("daily-problem", { connection });
}

export function getStreakCheckQueue() {
  return new Queue("streak-check", { connection });
}

export function getContestReminderQueue() {
  return new Queue("contest-reminder", { connection });
}

export const queueConnection = connection;
