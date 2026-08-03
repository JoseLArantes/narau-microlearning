import { parseUtcDate } from "../lib/date";
import { logger } from "../lib/logger";
import { JOB_NAMES } from "../lib/queue";
import { prismaSubjectSelectionRepository, selectDailySubjects } from "../services/subject-selection";

export const selectDailySubjectsProcessor = async (job: {
  data?: { date?: string };
}): Promise<ReturnType<typeof selectDailySubjects>> => {
  const date = job.data?.date ? parseUtcDate(job.data.date) : new Date();
  logger.info("job started", { name: JOB_NAMES.SELECT, date: date.toISOString().slice(0, 10) });
  const result = await selectDailySubjects(date, prismaSubjectSelectionRepository);
  logger.info("job finished", { name: JOB_NAMES.SELECT, result });
  return result;
};
