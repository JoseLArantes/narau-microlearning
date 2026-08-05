import { prisma } from "@narau/database";
import type { ReportInput } from "@narau/validation";
import { track } from "@/server/tracking";

export async function createReport(
  userId: string,
  input: ReportInput,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.create>>> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
  if (!user) throw new Error("User not found.");
  const report = await prisma.inaccuracyReport.create({
    data: {
      tenantId: user.tenantId,
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
