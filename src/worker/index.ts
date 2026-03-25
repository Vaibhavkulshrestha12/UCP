import { Worker } from "bullmq";
import { queueConnection } from "@/lib/queue/queues";
import {
  processContestReminderJob,
  processDailyProblemJob,
  processPlatformSyncJob,
  processStreakCheckJob
} from "@/lib/queue/processors";

const workers = [
  new Worker(
    "platform-sync",
    async (job) => {
      await processPlatformSyncJob(job.data.userId, job.data.trigger);
    },
    { connection: queueConnection }
  ),
  new Worker(
    "daily-problem",
    async (job) => {
      await processDailyProblemJob(job.data.userId);
    },
    { connection: queueConnection }
  ),
  new Worker(
    "streak-check",
    async (job) => {
      await processStreakCheckJob(job.data.userId);
    },
    { connection: queueConnection }
  ),
  new Worker(
    "contest-reminder",
    async (job) => {
      await processContestReminderJob(job.data.userId);
    },
    { connection: queueConnection }
  )
];

for (const worker of workers) {
  worker.on("failed", (job, error) => {
    console.error(`[worker:${worker.name}] job failed`, job?.id, error);
  });
}

console.log("UCP worker started");
