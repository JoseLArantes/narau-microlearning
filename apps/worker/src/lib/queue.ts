import { Queue } from "bullmq";
import { createRedisConnection } from "./redis";

export const QUEUE_NAME = "narau";

export const JOB_NAMES = {
  INGEST: "ingest.area-candidates",
  SELECT: "daily.select-area-subjects",
  ASSIGN: "daily.assign-user-items",
  REMINDER: "notify.daily-reminder",
} as const;

export function createQueue(): Queue {
  return new Queue(QUEUE_NAME, { connection: createRedisConnection() });
}

export const SCHEDULES: Array<{ id: string; pattern: string; jobName: string }> = [
  { id: "ingest-schedule", pattern: "0 0 * * *", jobName: JOB_NAMES.INGEST },
  { id: "select-schedule", pattern: "20 0 * * *", jobName: JOB_NAMES.SELECT },
  { id: "assign-schedule", pattern: "40 0 * * *", jobName: JOB_NAMES.ASSIGN },
  { id: "reminder-schedule", pattern: "0 8 * * *", jobName: JOB_NAMES.REMINDER },
];

export async function setupRepeatables(): Promise<void> {
  const queue = createQueue();
  for (const schedule of SCHEDULES) {
    await queue.upsertJobScheduler(
      schedule.id,
      { pattern: schedule.pattern },
      { name: schedule.jobName },
    );
  }
  await queue.close();
}
