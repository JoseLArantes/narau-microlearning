import { prisma, type Prisma } from "@narau/database";

export type UserItemWithRelations = Prisma.UserDailyItemGetPayload<{
  include: { subject: true; area: true; dailyAreaSubject: true };
}>;

export async function findUserItem(
  itemId: string,
  userId: string,
): Promise<UserItemWithRelations | null> {
  return prisma.userDailyItem.findFirst({
    where: { id: itemId, userId },
    include: { subject: true, area: true, dailyAreaSubject: true },
  });
}

export async function findUserItemForDate(
  userId: string,
  contentDate: Date,
): Promise<UserItemWithRelations | null> {
  return prisma.userDailyItem.findUnique({
    where: { userId_contentDate: { userId, contentDate } },
    include: { subject: true, area: true, dailyAreaSubject: true },
  });
}
