import { prisma } from "@narau/database";
import { localDateForTimezone, startOfUtcDay } from "@/lib/date";
import { track } from "@/server/tracking";
import { findPublishedDailySubjects } from "@/server/repositories/daily-subjects";
import { findUserItemForDate } from "@/server/repositories/user-items";

export interface CurrentItemResult {
  item: NonNullable<Awaited<ReturnType<typeof findUserItemForDate>>>;
}

export const TodayService = {
  async getCurrentItem(userId: string) {
    const today = startOfUtcDay();
    const existing = await findUserItemForDate(userId, today);
    if (existing) return existing;
    return this.ensureCurrentItem(userId, today);
  },

  /**
   * Creates a PENDING item for the user for the current UTC date when none
   * exists. Users created after the worker ran still receive a daily item.
   * Idempotent: the unique (userId, contentDate) constraint makes a
   * concurrent duplicate safe to ignore.
   */
  async ensureCurrentItem(userId: string, today: Date = startOfUtcDay()) {
    const existing = await findUserItemForDate(userId, today);
    if (existing) return existing;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const userAreas = await prisma.userArea.findMany({
      where: { userId, area: { status: "ACTIVE", tenantId: user.tenantId } },
      select: { areaId: true },
    });
    if (userAreas.length === 0) return null;

    const dailySubjects = await findPublishedDailySubjects(
      today,
      userAreas.map((userArea) => userArea.areaId),
      user.tenantId,
    );
    if (dailySubjects.length === 0) return null;

    const pick = dailySubjects[Math.floor(Math.random() * dailySubjects.length)];
    if (!pick) return null;

    try {
      return await prisma.userDailyItem.create({
        data: {
          tenantId: user.tenantId,
          userId,
          contentDate: today,
          userLocalDate: localDateForTimezone(today, user.timezone),
          areaId: pick.areaId,
          subjectId: pick.subjectId,
          dailyAreaSubjectId: pick.id,
        },
        include: { subject: true, area: true, dailyAreaSubject: true },
      });
    } catch {
      return findUserItemForDate(userId, today);
    }
  },

  async markViewed(userId: string, itemId: string) {
    const item = await findUserItemForDate(userId, startOfUtcDay());
    if (!item || item.id !== itemId) return null;
    if (item.status !== "PENDING") return item;
    await track(userId, "TODAY_VIEWED", { itemId });
    return prisma.userDailyItem.update({
      where: { id: itemId },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
  },

  async markLearned(userId: string, itemId: string) {
    const item = await findUserItemForDate(userId, startOfUtcDay());
    if (!item || item.id !== itemId) return null;
    if (item.status === "LEARNED") return item;
    const updated = await prisma.userDailyItem.update({
      where: { id: itemId },
      data: { status: "LEARNED", learnedAt: new Date() },
    });
    await track(userId, "ITEM_MARKED_LEARNED", { itemId, subjectId: item.subjectId });
    return updated;
  },

  async markSkipped(userId: string, itemId: string) {
    const item = await findUserItemForDate(userId, startOfUtcDay());
    if (!item || item.id !== itemId) return null;
    if (item.status === "LEARNED" || item.status === "SKIPPED") return item;
    const updated = await prisma.userDailyItem.update({
      where: { id: itemId },
      data: { status: "SKIPPED", viewedAt: item.viewedAt ?? new Date() },
    });
    await track(userId, "ITEM_SKIPPED", { itemId, subjectId: item.subjectId });
    return updated;
  },

  async rate(userId: string, itemId: string, rating: number, comment?: string) {
    const item = await findUserItemForDate(userId, startOfUtcDay());
    if (!item || item.id !== itemId) return null;
    if (item.status !== "LEARNED") return null;
    const updated = await prisma.userDailyItem.update({
      where: { id: itemId },
      data: { rating, ratingComment: comment },
    });
    await track(userId, "RATING_SUBMITTED", { itemId, rating });
    return updated;
  },
};
