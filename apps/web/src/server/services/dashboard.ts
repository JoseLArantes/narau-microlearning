import { prisma } from "@narau/database";
import { startOfUtcDay } from "@/lib/date";
import { getAreaBreadcrumb } from "@/server/services/areas";

export interface AreaHistory {
  area: { id: string; name: string; slug: string; color: string | null };
  learned: Array<{ id: string; title: string; learnedAt: Date | null; rating: number | null; breadcrumb: string }>;
}

export interface DashboardHistory {
  totalLearned: number;
  currentStreak: number;
  recent: Array<{
    id: string;
    title: string;
    areaName: string;
    breadcrumb: string;
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
      subject: { select: { title: true } },
      area: { include: { parent: { include: { parent: true } } } },
    },
    orderBy: { learnedAt: "desc" },
  });

  const byAreaMap = new Map<string, AreaHistory>();
  for (const item of items) {
    const root = item.area.level === "AREA" ? item.area : item.area.parent?.parent ?? item.area.parent ?? item.area;
    const key = root.id;
    const entry =
      byAreaMap.get(key) ??
      ({
        area: {
          id: root.id,
          name: root.name,
          slug: root.slug,
          color: root.color,
        },
        learned: [],
      } satisfies AreaHistory);
    entry.learned.push({
      id: item.id,
      title: item.subject.title,
      learnedAt: item.learnedAt,
      rating: item.rating,
      breadcrumb: getAreaBreadcrumb(item.area),
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
      areaName: rootAreaName(item.area),
      breadcrumb: getAreaBreadcrumb(item.area),
      learnedAt: item.learnedAt,
    })),
    byArea: [...byAreaMap.values()],
  };
}

function rootAreaName(area: { level: string; name: string; parent?: { name: string; parent?: { name: string } | null } | null }): string {
  return area.level === "AREA" ? area.name : area.parent?.parent?.name ?? area.parent?.name ?? area.name;
}
