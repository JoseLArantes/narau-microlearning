import { prisma } from "@dailycurio/database";
import type { ReportInput } from "@dailycurio/validation";
import { track } from "@/server/tracking";

export async function createReport(
  userId: string,
  input: ReportInput,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.create>>> {
  const report = await prisma.inaccuracyReport.create({
    data: {
      userId,
      subjectId: input.subjectId,
      userDailyItemId: input.itemId,
      reason: input.reason,
      details: input.details,
    },
  });
  await track(userId, "REPORT_SUBMITTED", { subjectId: input.subjectId, reason: input.reason });
  return report;
}
