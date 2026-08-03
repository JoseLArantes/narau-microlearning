import { prisma, type Prisma } from "@dailycurio/database";

export async function getUserAreas(
  userId: string,
): Promise<Prisma.UserAreaGetPayload<{ include: { area: true } }>[]> {
  return prisma.userArea.findMany({
    where: { userId },
    include: { area: true },
    orderBy: { area: { displayOrder: "asc" } },
  });
}

export async function setUserAreas(userId: string, areaIds: string[], assignedBy?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.userArea.deleteMany({ where: { userId } });
    if (areaIds.length > 0) {
      await tx.userArea.createMany({
        data: areaIds.map((areaId) => ({ userId, areaId, assignedBy })),
      });
    }
  });
}

export async function countUserAreas(userId: string): Promise<number> {
  return prisma.userArea.count({ where: { userId } });
}
