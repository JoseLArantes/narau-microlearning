import { prisma } from "@dailycurio/database";

export interface AssignableArea {
  id: string;
  preferenceWeight: number;
}

export interface AssignableUser {
  id: string;
  timezone: string;
  areas: AssignableArea[];
}

export interface PublishedDailySubject {
  id: string;
  areaId: string;
  subjectId: string;
}

export interface CreateItemInput {
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
        userAreas: { some: { area: { status: "ACTIVE" } } },
      },
      select: {
        id: true,
        timezone: true,
        userAreas: {
          where: { area: { status: "ACTIVE" } },
          select: { areaId: true, preferenceWeight: true },
        },
      },
    });
    return users.map((user) => ({
      id: user.id,
      timezone: user.timezone,
      areas: user.userAreas.map((userArea) => ({
        id: userArea.areaId,
        preferenceWeight: userArea.preferenceWeight,
      })),
    }));
  },

  loadPublishedDailySubjects(areaIds, contentDate): Promise<PublishedDailySubject[]> {
    return prisma.dailyAreaSubject.findMany({
      where: {
        contentDate,
        areaId: { in: areaIds },
        status: "PUBLISHED",
        subject: { status: "ACTIVE" },
      },
      select: { id: true, areaId: true, subjectId: true },
    });
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
      const candidates = dailySubjects.filter((subject) => !learned.has(subject.subjectId));
      if (candidates.length === 0) continue;

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (!pick) continue;

      await repo.createItem({
        userId: user.id,
        contentDate: date,
        userLocalDate: localDateForTimezone(date, user.timezone),
        areaId: pick.areaId,
        subjectId: pick.subjectId,
        dailyAreaSubjectId: pick.id,
      });
      result.assigned += 1;
    } catch (error) {
      result.errors.push(`user ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}
