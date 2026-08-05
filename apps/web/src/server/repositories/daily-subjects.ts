import { prisma, type Prisma } from "@narau/database";

export type DailySubjectWithRelations = Prisma.DailyAreaSubjectGetPayload<{
  include: { subject: true; area: true };
}>;

export async function findPublishedDailySubjects(
  contentDate: Date,
  areaIds?: string[],
  tenantId?: string,
): Promise<DailySubjectWithRelations[]> {
  return prisma.dailyAreaSubject.findMany({
    where: {
      contentDate,
      status: "PUBLISHED",
      subject: { status: "ACTIVE" },
      ...(areaIds ? { areaId: { in: areaIds } } : {}),
      ...(tenantId ? { tenantId } : {}),
    },
    include: { subject: true, area: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}
