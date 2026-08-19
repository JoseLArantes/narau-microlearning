import { prisma, type Prisma } from "@narau/database";
import { track } from "@/server/tracking";
import { isAreaEffectivelyActive } from "@/server/services/areas";

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  tenantId?: string,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      tenantId,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function adminOverview(
  tenantId: string,
): Promise<{ users: number; areas: number; pendingReports: number; pendingItems: number }> {
  const [users, areas, pendingReports, pendingItems] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.area.count({ where: { tenantId } }),
    prisma.inaccuracyReport.count({ where: { tenantId, status: "NEW" } }),
    prisma.userDailyItem.count({ where: { tenantId, status: "PENDING" } }),
  ]);
  return { users, areas, pendingReports, pendingItems };
}

export async function listDailySubjects(
  tenantId: string,
  contentDate: Date,
): Promise<
  Prisma.DailyAreaSubjectGetPayload<{
    include: { area: { include: { parent: { include: { parent: true } } } }; subject: true };
  }>[]
> {
  return prisma.dailyAreaSubject.findMany({
    where: { tenantId, contentDate },
    include: { area: { include: { parent: { include: { parent: true } } } }, subject: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}

export async function overrideDailySubject(
  input: { tenantId: string; contentDate: Date; areaId: string; subjectId: string },
  actorId: string,
): Promise<Awaited<ReturnType<typeof prisma.dailyAreaSubject.upsert>>> {
  const area = await prisma.area.findFirst({
    where: { id: input.areaId, tenantId: input.tenantId },
    include: { parent: { include: { parent: true } } },
  });
  if (!area || !isAreaEffectivelyActive(area))
    throw new Error("The selected area or topic is not currently active.");
  const candidate = await prisma.areaSubjectCandidate.findFirst({
    where: {
      tenantId: input.tenantId,
      areaId: input.areaId,
      subjectId: input.subjectId,
      generatedForDate: input.contentDate,
      status: { in: ["CANDIDATE", "SELECTED"] },
      subject: { status: "ACTIVE" },
    },
    select: { subjectId: true },
  });
  if (!candidate) throw new Error("The subject is not an active candidate for this area and date.");
  const daily = await prisma.dailyAreaSubject.upsert({
    where: {
      contentDate_areaId_tenantId: {
        contentDate: input.contentDate,
        areaId: input.areaId,
        tenantId: input.tenantId,
      },
    },
    update: {
      subjectId: input.subjectId,
      selectedBy: `admin:${actorId}`,
      status: "PUBLISHED",
      curationStatus: "PENDING",
      curatedText: null,
      curatedHook: null,
      curationProvider: null,
      curationModel: null,
      curationPromptVersion: null,
      curationSourceRevisionId: null,
      curatedAt: null,
      curationError: null,
    },
    create: {
      contentDate: input.contentDate,
      tenantId: input.tenantId,
      areaId: input.areaId,
      subjectId: input.subjectId,
      selectedBy: `admin:${actorId}`,
      curationStatus: "PENDING",
    },
  });
  await audit(
    actorId,
    "ADMIN_SUBJECT_OVERRIDDEN",
    "DailyAreaSubject",
    daily.id,
    input,
    input.tenantId,
  );
  await track(actorId, "ADMIN_SUBJECT_OVERRIDDEN", {
    areaId: input.areaId,
    subjectId: input.subjectId,
  });
  return daily;
}

export async function listReports(tenantId: string): Promise<
  Prisma.InaccuracyReportGetPayload<{
    include: {
      user: { select: { id: true; email: true; name: true } };
      subject: { select: { id: true; title: true; canonicalUrl: true } };
      userDailyItem: { select: { id: true; contentDate: true } };
    };
  }>[]
> {
  return prisma.inaccuracyReport.findMany({
    where: { tenantId, status: { in: ["NEW", "REVIEWING"] } },
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
  tenantId: string,
  note?: string,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.update>>> {
  const existing = await prisma.inaccuracyReport.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) throw new Error("Report not found in the current tenant.");
  const report = await prisma.inaccuracyReport.update({
    where: { id: existing.id },
    data: { status: "RESOLVED", reviewedBy: actorId, reviewedAt: new Date(), resolutionNote: note },
  });
  await audit(actorId, "REPORT_RESOLVED", "InaccuracyReport", id, { reportId: id }, tenantId);
  await track(actorId, "REPORT_RESOLVED", { reportId: id });
  return report;
}

export async function dismissReport(
  id: string,
  actorId: string,
  tenantId: string,
): Promise<Awaited<ReturnType<typeof prisma.inaccuracyReport.update>>> {
  const existing = await prisma.inaccuracyReport.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) throw new Error("Report not found in the current tenant.");
  const report = await prisma.inaccuracyReport.update({
    where: { id: existing.id },
    data: { status: "DISMISSED", reviewedBy: actorId, reviewedAt: new Date() },
  });
  await audit(actorId, "REPORT_DISMISSED", "InaccuracyReport", id, undefined, tenantId);
  return report;
}

export async function hideSubject(
  subjectId: string,
  actorId: string,
  tenantId: string,
): Promise<Awaited<ReturnType<typeof prisma.subject.update>>> {
  const subject = await prisma.subject.update({
    where: { id_tenantId: { id: subjectId, tenantId } },
    data: { status: "HIDDEN" },
  });
  await audit(actorId, "SUBJECT_HIDDEN", "Subject", subjectId, undefined, tenantId);
  return subject;
}

export async function listCandidates(
  tenantId: string,
  areaId: string,
  contentDate: Date,
): Promise<
  Prisma.AreaSubjectCandidateGetPayload<{
    include: {
      subject: { select: { id: true; title: true; canonicalUrl: true; qualityScore: true } };
    };
  }>[]
> {
  return prisma.areaSubjectCandidate.findMany({
    where: { tenantId, areaId, generatedForDate: contentDate },
    include: {
      subject: {
        select: { id: true, title: true, canonicalUrl: true, qualityScore: true },
      },
    },
    orderBy: { candidateScore: "desc" },
  });
}

export async function rejectCandidate(
  candidateId: string,
  actorId: string,
  tenantId: string,
): Promise<Awaited<ReturnType<typeof prisma.areaSubjectCandidate.update>>> {
  const existing = await prisma.areaSubjectCandidate.findFirst({
    where: { id: candidateId, tenantId },
    select: { id: true },
  });
  if (!existing) throw new Error("Candidate not found in the current tenant.");
  const candidate = await prisma.areaSubjectCandidate.update({
    where: { id: existing.id },
    data: { status: "REJECTED" },
  });
  await audit(
    actorId,
    "CANDIDATE_REJECTED",
    "AreaSubjectCandidate",
    candidateId,
    undefined,
    tenantId,
  );
  return candidate;
}
