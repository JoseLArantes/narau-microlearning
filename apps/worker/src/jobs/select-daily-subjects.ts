import { parseUtcDate } from "../lib/date";
import { logger } from "../lib/logger";
import { JOB_NAMES } from "../lib/queue";
import {
  prismaSubjectSelectionRepository,
  selectDailySubjects,
} from "../services/subject-selection";
import { curateDailySubjectsForDate } from "../services/daily-curation";

export const selectDailySubjectsProcessor = async (job: {
  data?: { date?: string };
}): Promise<unknown> => {
  const date = job.data?.date ? parseUtcDate(job.data.date) : new Date();
  logger.info("job started", { name: JOB_NAMES.SELECT, date: date.toISOString().slice(0, 10) });
  const selection = await selectDailySubjects(date, prismaSubjectSelectionRepository);
  const curation = await curateDailySubjectsForDate(date);
  const result = { selection, curation };
  logger.info("job finished", { name: JOB_NAMES.SELECT, result });
  return result;
};
