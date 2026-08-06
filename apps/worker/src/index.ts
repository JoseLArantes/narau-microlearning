import "dotenv/config";
import { Worker } from "bullmq";
import { createRedisConnection } from "./lib/redis";
import { QUEUE_NAME, JOB_NAMES, setupRepeatables } from "./lib/queue";
import { logger } from "./lib/logger";
import { ingestAreaCandidatesProcessor } from "./jobs/ingest-area-candidates";
import { selectDailySubjectsProcessor } from "./jobs/select-daily-subjects";
import { assignUserItemsProcessor } from "./jobs/assign-user-items";
import { sendDailyRemindersProcessor } from "./jobs/send-daily-reminders";
import { createJobProcessor, type JobProcessor } from "./job-dispatcher";

export function createWorkers(): Worker[] {
  const connection = createRedisConnection();
  const processors: Record<string, JobProcessor> = {
    [JOB_NAMES.INGEST]: ingestAreaCandidatesProcessor,
    [JOB_NAMES.SELECT]: selectDailySubjectsProcessor,
    [JOB_NAMES.ASSIGN]: assignUserItemsProcessor,
    [JOB_NAMES.REMINDER]: sendDailyRemindersProcessor,
  };

  const workers = [
    new Worker(QUEUE_NAME, createJobProcessor(processors), { connection, concurrency: 1 }),
  ];

  workers.forEach((worker) => {
    worker.on("failed", (job, error) => {
      logger.error("job failed", { job: job?.name, error: error.message });
    });
    worker.on("ready", () => logger.info("worker ready", { queue: QUEUE_NAME }));
  });

  return workers;
}

async function main(): Promise<void> {
  await setupRepeatables();
  const workers = createWorkers();
  logger.info("worker started", { queue: QUEUE_NAME, jobs: Object.values(JOB_NAMES) });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info("shutting down", { signal });
    await Promise.all(workers.map((worker) => worker.close()));
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

void main().catch((error) => {
  logger.error("worker failed to start", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
