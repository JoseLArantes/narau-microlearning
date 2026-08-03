import { JOB_NAMES } from "../lib/queue";
import { logger } from "../lib/logger";
import { parseUtcDate } from "../lib/date";
import { ingestAreaCandidates } from "../services/wikipedia-ingestion";

export const ingestAreaCandidatesProcessor = async (job: {
  data?: { date?: string };
}): Promise<ReturnType<typeof ingestAreaCandidates>> => {
  const date = job.data?.date ? parseUtcDate(job.data.date) : new Date();
  logger.info("job started", { name: JOB_NAMES.INGEST, date: date.toISOString().slice(0, 10) });
  const result = await ingestAreaCandidates(date);
  logger.info("job finished", { name: JOB_NAMES.INGEST, result });
  return result;
};
