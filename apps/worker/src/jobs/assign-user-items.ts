import { parseUtcDate } from "../lib/date";
import { logger } from "../lib/logger";
import { JOB_NAMES } from "../lib/queue";
import { assignUserItems, prismaUserAssignmentRepository } from "../services/user-assignment";

export const assignUserItemsProcessor = async (job: {
  data?: { date?: string };
}): Promise<ReturnType<typeof assignUserItems>> => {
  const date = job.data?.date ? parseUtcDate(job.data.date) : new Date();
  logger.info("job started", { name: JOB_NAMES.ASSIGN, date: date.toISOString().slice(0, 10) });
  const result = await assignUserItems(date, prismaUserAssignmentRepository);
  logger.info("job finished", { name: JOB_NAMES.ASSIGN, result });
  return result;
};
