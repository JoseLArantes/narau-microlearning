import { prisma, type Prisma } from "@dailycurio/database";
import { track } from "@/server/tracking";

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function adminOverview(): Promise<{ users: number; areas: number; pendingReports: number; pendingItems: number }> {
  const [users, areas, pendingReports, pendingItems] = await Promise.all([
    prisma.user.count(),
    prisma.area.count(),
    prisma.inaccuracyReport.count({ where: { status: "NEW" } }),
    prisma.userDailyItem.count({ where: { status: "PENDING" } }),
  ]);
  return { users, areas, pendingReports, pendingItems };
}

export async function listDailySubjects(
  contentDate: Date,
): Promise<Prisma.DailyAreaSubjectGetPayload<{ include: { area: true; subject: true } }>[]> {
  return prisma.dailyAreaSubject.findMany({
    where: { contentDate },
    include: { area: true, subject: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}

export async function overrideDailySubject(
  input: { contentDate: Date; areaId: string; subjectId: string },
  actorId: string,
): Promise<Awaited<ReturnType<typeof prisma.dailyAreaSubject.upsert>>> {
  const daily = await prisma.dailyAreaSubject.upsert({
    where: { contentDate_areaId: { contentDate: input.contentDate, areaId: input.areaId } },
    update: { subjectId: input.subjectId, selectedBy: `admin:${actorId}`, status: "PUBLISHED" },
    create: {
      contentDate: input.contentDate,
      areaId: input.areaId,
      subjectId: input.subjectId,
      selectedBy: `admin:${actorId}`,
    },
  });
  await audit(actorId, "ADMIN_SUBJECT_OVERRIDDEN", "DailyAreaSubject", daily.id, input);
  await track(actorId, "ADMIN_SUBJECT_OVERRIDDEN", { areaId: input.areaId, subjectId: input.subjectId });
  return daily;
}

export async function listReports(): Promise<
  Prisma.InaccuracyReportGetPayload<{
    include: {
      user: { select: { id: true; email: true; name: true } };
      subject: { select: { id: true; title: true; canonicalUrl: true } };
      userDailyItem: { select: { id: true; contentDate: true } };
    };
  }>[]
> {
  return prisma.inaccuracyReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      subject: { select: { id: true, title: true, canonicalUrl: true } },
      userDailyItem: { select: { id: true, contentDate: true } },
    },
  });
}

export async function resolveReport(
  id: string,
  actorId: string,
  note?: string,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.update>>> {
  const report = await prisma.inaccuracyReport.update({
    where: { id },
    data: { status: "RESOLVED", reviewedBy: actorId, reviewedAt: new Date(), resolutionNote: note },
  });
  await audit(actorId, "REPORT_RESOLVED", "InaccuracyReport", id, { reportId: id });
  await track(actorId, "REPORT_RESOLVED", { reportId: id });
  return report;
}

export async function dismissReport(
  id: string,
  actorId: string,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.update>>> {
  const report = await prisma.inaccuracyReport.update({
    where: { id },
    data: { status: "DISMISSED", reviewedBy: actorId, reviewedAt: new Date() },
  });
  await audit(actorId, "REPORT_DISMISSED", "InaccuracyReport", id);
  return report;
}

export async function hideSubject(
  subjectId: string,
  actorId: string,
): Promise<Awaited<ReturnType<typeof prisma.subject.update>>> {
  const subject = await prisma.subject.update({
    where: { id: subjectId },
    data: { status: "HIDDEN" },
  });
  await audit(actorId, "SUBJECT_HIDDEN", "Subject", subjectId);
  return subject;
}
