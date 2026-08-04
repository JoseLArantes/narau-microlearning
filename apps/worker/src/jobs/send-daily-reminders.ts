import { prisma } from "@narau/database";
import { sendEmail } from "@narau/email";
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
    include: { subject: { select: { title: true } }, user: { select: { email: true, name: true } } },
  });

  const result: ReminderResult = { found: items.length, sent: 0, failed: [] };
  for (const item of items) {
    try {
      const firstName = item.user.name ?? item.user.email;
      await sendEmail({
        to: item.user.email,
        subject: "Your tiny thing for today is ready",
        html: `
          <p>Hello ${firstName},</p>
          <p>Your reading for today is ready: <strong>${item.subject.title}</strong>.</p>
          <p>It takes only a few minutes. Take a quiet look whenever you have a moment.</p>
        `,
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
