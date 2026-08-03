import { prisma, type Prisma } from "@dailycurio/database";

export type DailySubjectWithRelations = Prisma.DailyAreaSubjectGetPayload<{
  include: { subject: true; area: true };
}>;

export async function findPublishedDailySubjects(
  contentDate: Date,
  areaIds?: string[],
): Promise<DailySubjectWithRelations[]> {
  return prisma.dailyAreaSubject.findMany({
    where: {
      contentDate,
      status: "PUBLISHED",
      subject: { status: "ACTIVE" },
      ...(areaIds ? { areaId: { in: areaIds } } : {}),
    },
    include: { subject: true, area: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}
