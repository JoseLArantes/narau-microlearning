import { prisma } from "@narau/database";
import { startOfUtcDay } from "@/lib/date";

export interface AreaHistory {
  area: { id: string; name: string; slug: string; color: string | null };
  learned: Array<{ id: string; title: string; canonicalUrl: string; learnedAt: Date | null; rating: number | null }>;
}

export interface DashboardHistory {
  totalLearned: number;
  currentStreak: number;
  recent: Array<{
    id: string;
    title: string;
    canonicalUrl: string;
    areaName: string;
    learnedAt: Date | null;
  }>;
  byArea: AreaHistory[];
}

function computeStreak(learnedDates: string[], today: Date): number {
  const dates = new Set(learnedDates);
  let cursor = today;
  if (!dates.has(cursor.toISOString().slice(0, 10))) {
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  let streak = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

export async function getHistory(userId: string, tenantId: string): Promise<DashboardHistory> {
  const items = await prisma.userDailyItem.findMany({
    where: { userId, tenantId, status: "LEARNED" },
    include: {
      subject: { select: { title: true, canonicalUrl: true } },
      area: { select: { id: true, name: true, slug: true, color: true } },
    },
    orderBy: { learnedAt: "desc" },
  });

  const byAreaMap = new Map<string, AreaHistory>();
  for (const item of items) {
    const key = item.areaId;
    const entry =
      byAreaMap.get(key) ??
      ({
        area: {
          id: item.area.id,
          name: item.area.name,
          slug: item.area.slug,
          color: item.area.color,
        },
        learned: [],
      } satisfies AreaHistory);
    entry.learned.push({
      id: item.id,
      title: item.subject.title,
      canonicalUrl: item.subject.canonicalUrl,
      learnedAt: item.learnedAt,
      rating: item.rating,
    });
    byAreaMap.set(key, entry);
  }

  const today = startOfUtcDay();
  const streak = computeStreak(
    items.map((item) => item.contentDate.toISOString().slice(0, 10)),
    today,
  );

  return {
    totalLearned: items.length,
    currentStreak: streak,
    recent: items.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.subject.title,
      canonicalUrl: item.subject.canonicalUrl,
      areaName: item.area.name,
      learnedAt: item.learnedAt,
    })),
    byArea: [...byAreaMap.values()],
  };
}
