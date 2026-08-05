import { chooseDailyCard, prisma } from "@narau/database";

export interface AssignableArea {
  id: string;
  rootAreaId: string;
}

export interface AssignableUser {
  id: string;
  tenantId: string;
  timezone: string;
  areas: AssignableArea[];
}

export interface PublishedDailySubject {
  id: string;
  areaId: string;
  subjectId: string;
  tenantId: string;
  rootAreaId: string;
}

export interface CreateItemInput {
  tenantId: string;
  userId: string;
  contentDate: Date;
  userLocalDate: Date;
  areaId: string;
  subjectId: string;
  dailyAreaSubjectId?: string;
}

export interface UserAssignmentRepository {
  loadActiveUsersWithAreas(): Promise<AssignableUser[]>;
  loadPublishedDailySubjects(areaIds: string[], contentDate: Date): Promise<PublishedDailySubject[]>;
  loadLearnedSubjectIds(userId: string): Promise<string[]>;
  hasItem(userId: string, contentDate: Date): Promise<boolean>;
  createItem(input: CreateItemInput): Promise<unknown>;
}

type AreaTreeRecord = {
  id: string;
  tenantId: string;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  level: "AREA" | "TOPIC" | "SPECIALTY";
  parentId: string | null;
  parent: {
    id: string;
    status: "DRAFT" | "ACTIVE" | "DISABLED";
    level: "AREA" | "TOPIC" | "SPECIALTY";
    parent: { id: string; status: "DRAFT" | "ACTIVE" | "DISABLED"; level: "AREA" | "TOPIC" | "SPECIALTY" } | null;
  } | null;
};

const areaTreeSelect = {
  id: true,
  tenantId: true,
  status: true,
  level: true,
  parentId: true,
  parent: {
    select: {
      id: true,
      status: true,
      level: true,
      parent: { select: { id: true, status: true, level: true } },
    },
  },
} as const;

function isEffectivelyActive(area: AreaTreeRecord): boolean {
  if (area.status !== "ACTIVE") return false;
  if (area.level === "AREA") return true;
  if (!area.parent || area.parent.status !== "ACTIVE") return false;
  return area.level !== "SPECIALTY" || Boolean(area.parent.parent && area.parent.parent.status === "ACTIVE");
}

function rootAreaId(area: AreaTreeRecord): string {
  if (area.level === "AREA") return area.id;
  if (area.level === "TOPIC") return area.parent?.id ?? area.id;
  return area.parent?.parent?.id ?? area.parent?.id ?? area.id;
}

export interface AssignmentResult {
  assigned: number;
  skipped: number;
  errors: string[];
}

export const prismaUserAssignmentRepository: UserAssignmentRepository = {
  async loadActiveUsersWithAreas(): Promise<AssignableUser[]> {
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        tenant: { status: "ACTIVE" },
      userAreas: { some: { area: { status: "ACTIVE" } } },
      },
      select: {
        id: true,
        tenantId: true,
        timezone: true,
        userAreas: {
          where: { area: { status: "ACTIVE" } },
          select: { areaId: true, area: { select: areaTreeSelect } },
        },
      },
    });
    return users
      .map((user) => ({
        id: user.id,
        tenantId: user.tenantId,
        timezone: user.timezone,
        areas: user.userAreas
          .filter((userArea) => userArea.area.tenantId === user.tenantId && isEffectivelyActive(userArea.area))
          .map((userArea) => ({ id: userArea.areaId, rootAreaId: rootAreaId(userArea.area) })),
      }))
      .filter((user) => user.areas.length > 0);
  },

  loadPublishedDailySubjects(areaIds, contentDate): Promise<PublishedDailySubject[]> {
    return prisma.dailyAreaSubject.findMany({
      where: {
        contentDate,
        areaId: { in: areaIds },
        status: "PUBLISHED",
        subject: { status: "ACTIVE" },
      },
      select: { id: true, areaId: true, subjectId: true, area: { select: areaTreeSelect } },
    }).then((items) =>
      items
        .filter((item) => isEffectivelyActive(item.area))
        .map((item) => ({
          id: item.id,
          areaId: item.areaId,
          subjectId: item.subjectId,
          tenantId: item.area.tenantId,
          rootAreaId: rootAreaId(item.area),
        })),
    );
  },

  async loadLearnedSubjectIds(userId): Promise<string[]> {
    const items = await prisma.userDailyItem.findMany({
      where: { userId, status: "LEARNED" },
      select: { subjectId: true },
    });
    return items.map((item) => item.subjectId);
  },

  async hasItem(userId, contentDate): Promise<boolean> {
    const item = await prisma.userDailyItem.findUnique({
      where: { userId_contentDate: { userId, contentDate } },
      select: { id: true },
    });
    return item !== null;
  },

  createItem(input): Promise<unknown> {
    return prisma.userDailyItem.create({ data: input });
  },
};

/**
 * Returns the calendar date a UTC timestamp represents in a given IANA
 * timezone, as a UTC-midnight Date for storage. Falls back to the UTC date.
 */
export function localDateForTimezone(utcDate: Date, timezone: string): Date {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(utcDate);
    const year = Number(parts.find((part) => part.type === "year")?.value ?? NaN);
    const month = Number(parts.find((part) => part.type === "month")?.value ?? NaN);
    const day = Number(parts.find((part) => part.type === "day")?.value ?? NaN);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return utcDate;
    }
    return new Date(Date.UTC(year, month - 1, day));
  } catch {
    return utcDate;
  }
}

/**
 * Assigns one daily item to each active user for the given content date.
 * Idempotent: users that already have an item for the date are skipped, and
 * subjects the user already learned are never reassigned.
 */
export async function assignUserItems(date: Date, repo: UserAssignmentRepository): Promise<AssignmentResult> {
  const result: AssignmentResult = { assigned: 0, skipped: 0, errors: [] };

  const users = await repo.loadActiveUsersWithAreas();
  for (const user of users) {
    try {
      if (await repo.hasItem(user.id, date)) {
        result.skipped += 1;
        continue;
      }
      const learned = new Set(await repo.loadLearnedSubjectIds(user.id));
      const dailySubjects = await repo.loadPublishedDailySubjects(
        user.areas.map((area) => area.id),
        date,
      );
      const pick = chooseDailyCard({
        selections: user.areas.map((area) => ({ nodeId: area.id, rootAreaId: area.rootAreaId })),
        cards: dailySubjects.map((subject) => ({
          nodeId: subject.areaId,
          rootAreaId: subject.rootAreaId,
          subjectId: subject.subjectId,
          dailyAreaSubjectId: subject.id,
        })),
        learnedSubjectIds: learned,
      });
      if (!pick) continue;

      await repo.createItem({
        tenantId: user.tenantId,
        userId: user.id,
        contentDate: date,
        userLocalDate: localDateForTimezone(date, user.timezone),
        areaId: pick.nodeId,
        subjectId: pick.subjectId,
        dailyAreaSubjectId: pick.dailyAreaSubjectId,
      });
      result.assigned += 1;
    } catch (error) {
      result.errors.push(`user ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}
