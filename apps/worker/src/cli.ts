import "dotenv/config";
import { prisma } from "@narau/database";
import { parseUtcDate } from "./lib/date";
import { logger } from "./lib/logger";
import { ingestAreaCandidates } from "./services/wikipedia-ingestion";
import { prismaSubjectSelectionRepository, selectDailySubjects } from "./services/subject-selection";
import { assignUserItems, prismaUserAssignmentRepository } from "./services/user-assignment";
import { sendDailyReminders } from "./jobs/send-daily-reminders";

const USAGE = `
Usage: bun run job:<name> [--date=YYYY-MM-DD]

Jobs:
  ingest-area-candidates   Ingest Wikipedia candidates for active areas
  select-daily-subjects    Select one subject per active area
  assign-user-daily-items  Assign one item per active user
  send-daily-reminders     Email reminders for unread daily items
`.trim();

interface CliArgs {
  job: string;
  date?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = [...argv];
  const job = args.shift() ?? "";
  const dateArg = args.find((arg) => arg.startsWith("--date="));
  const date = dateArg?.slice("--date=".length);
  return { job, date };
}

async function main(): Promise<void> {
  const { job, date } = parseArgs(process.argv.slice(2));
  const contentDate = date ? parseUtcDate(date) : new Date();
  const dateLabel = contentDate.toISOString().slice(0, 10);
  logger.info("cli job started", { job, date: dateLabel });

  let result: unknown;
  switch (job) {
    case "ingest-area-candidates":
      result = await ingestAreaCandidates(contentDate);
      break;
    case "select-daily-subjects":
      result = await selectDailySubjects(contentDate, prismaSubjectSelectionRepository);
      break;
    case "assign-user-daily-items":
      result = await assignUserItems(contentDate, prismaUserAssignmentRepository);
      break;
    case "send-daily-reminders":
      result = await sendDailyReminders();
      break;
    default:
      logger.error("unknown job", { job });
      console.info(USAGE);
      process.exitCode = 1;
      return;
  }

  logger.info("cli job finished", { job, date: dateLabel, result });
}

await main()
  .catch((error) => {
    logger.error("cli job failed", { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
