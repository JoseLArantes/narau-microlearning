export interface QueuedJob {
  name: string;
  data?: { date?: string };
}

export type JobProcessor = (job: QueuedJob) => Promise<unknown>;

export function createJobProcessor(processors: Record<string, JobProcessor>): JobProcessor {
  return async (job) => {
    const processor = processors[job.name];
    if (!processor) throw new Error(`Unknown worker job: ${job.name}`);
    return processor(job);
  };
}
