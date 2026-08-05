import { prisma } from "@narau/database";
import { renderDailyLearnEmail, sendEmail } from "@narau/email";
import { JOB_NAMES } from "../lib/queue";
import { logger } from "../lib/logger";

export interface ReminderResult {
  found: number;
  sent: number;
  failed: string[];
}

/**
 * Sends optional reminder emails to users with a PENDING item for the
 * current UTC day. A single failed email never fails the whole job.
 */
export const sendDailyRemindersProcessor = async (): Promise<ReminderResult> => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  logger.info("job started", { name: JOB_NAMES.REMINDER });

  const items = await prisma.userDailyItem.findMany({
    where: { contentDate: { gte: startOfDay, lt: endOfDay }, status: "PENDING" },
    include: {
      subject: { select: { title: true, summary: true } },
      area: { select: { name: true } },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          userAreas: {
            where: { area: { status: "ACTIVE" } },
            select: { area: { select: { name: true } } },
          },
        },
      },
    },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3030";
  const dateStr = startOfDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();

  const result: ReminderResult = { found: items.length, sent: 0, failed: [] };
  for (const item of items) {
    try {
      const userTags = item.user.userAreas.map((ua) => ua.area.name);
      const html = renderDailyLearnEmail({
        userName: item.user.name ?? undefined,
        subjectTitle: item.subject.title,
        subjectSummary: item.subject.summary ?? undefined,
        areaName: item.area.name,
        userTags: userTags.length > 0 ? userTags : [item.area.name],
        readingMinutes: 5,
        itemUrl: `${appUrl}/today`,
        dateStr,
      });

      await sendEmail({
        to: item.user.email,
        subject: `Today's Card: ${item.subject.title} · Narau`,
        html,
      });
      result.sent += 1;
    } catch (error) {
      result.failed.push(
        `user ${item.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  logger.info("job finished", { name: JOB_NAMES.REMINDER, result });
  return result;
};

export const sendDailyReminders = sendDailyRemindersProcessor;
