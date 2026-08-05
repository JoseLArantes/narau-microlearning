import { prisma, type Prisma } from "@narau/database";

export async function getUserAreas(
  userId: string,
  tenantId: string,
): Promise<Prisma.UserAreaGetPayload<{ include: { area: true } }>[]> {
  return prisma.userArea.findMany({
    where: { userId, tenantId },
    include: { area: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}

export async function setUserAreas(userId: string, tenantId: string, areaIds: string[], assignedBy?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.userArea.deleteMany({ where: { userId, tenantId } });
    if (areaIds.length > 0) {
      await tx.userArea.createMany({
        data: areaIds.map((areaId) => ({ userId, tenantId, areaId, assignedBy })),
      });
    }
  });
}

export async function countUserAreas(userId: string, tenantId: string): Promise<number> {
  return prisma.userArea.count({ where: { userId, tenantId } });
}
