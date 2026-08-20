import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  chooseDailyCard: vi.fn(),
  userFindUnique: vi.fn(),
  userAreaFindMany: vi.fn(),
  itemFindMany: vi.fn(),
  itemCreate: vi.fn(),
  itemUpdate: vi.fn(),
  findUserItemForDate: vi.fn(),
  findPublishedDailySubjects: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@narau/database", () => ({
  chooseDailyCard: mocks.chooseDailyCard,
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    userArea: { findMany: mocks.userAreaFindMany },
    userDailyItem: {
      findMany: mocks.itemFindMany,
      create: mocks.itemCreate,
      update: mocks.itemUpdate,
    },
  },
}));

vi.mock("@/server/repositories/user-items", () => ({
  findUserItemForDate: mocks.findUserItemForDate,
}));

vi.mock("@/server/repositories/daily-subjects", () => ({
  findPublishedDailySubjects: mocks.findPublishedDailySubjects,
}));

vi.mock("@/server/tracking", () => ({ track: mocks.track }));

import { TodayService } from "./today";

const TODAY = new Date("2026-08-19T00:00:00.000Z");

function rootArea(overrides: Record<string, unknown> = {}): { id: string; [key: string]: unknown } {
  return {
    id: "area-1",
    tenantId: "tenant-en",
    parentId: null,
    level: "AREA",
    name: "Science",
    slug: "science",
    status: "ACTIVE",
    parent: null,
    ...overrides,
  };
}

function item(overrides: Record<string, unknown> = {}): { id: string; [key: string]: unknown } {
  return {
    id: "item-1",
    userId: "user-1",
    tenantId: "tenant-en",
    areaId: "area-1",
    subjectId: "subject-1",
    status: "PENDING",
    viewedAt: null,
    contentDate: TODAY,
    ...overrides,
  };
}

describe("TodayService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-19T12:00:00.000Z"));
    vi.clearAllMocks();
    mocks.userFindUnique.mockResolvedValue({ id: "user-1", tenantId: "tenant-en", timezone: "UTC" });
    mocks.userAreaFindMany.mockResolvedValue([{ areaId: "area-1", area: rootArea() }]);
    mocks.findPublishedDailySubjects.mockResolvedValue([
      { id: "daily-1", areaId: "area-1", subjectId: "subject-1", area: rootArea() },
    ]);
    mocks.itemFindMany.mockResolvedValue([]);
    mocks.chooseDailyCard.mockReturnValue({
      nodeId: "area-1",
      subjectId: "subject-1",
      dailyAreaSubjectId: "daily-1",
    });
    mocks.itemCreate.mockResolvedValue(item());
    mocks.itemUpdate.mockImplementation(async ({ data }) => ({ ...item(), ...data }));
    mocks.track.mockResolvedValue(undefined);
  });

  it("returns an existing daily item without rebuilding it", async () => {
    const existing = item({ status: "VIEWED" });
    mocks.findUserItemForDate.mockResolvedValue(existing);

    await expect(TodayService.getCurrentItem("user-1")).resolves.toBe(existing);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("creates a tenant-scoped late assignment and excludes learned subjects", async () => {
    mocks.findUserItemForDate.mockResolvedValue(null);
    mocks.itemFindMany.mockResolvedValue([{ subjectId: "learned-subject" }]);

    await expect(TodayService.ensureCurrentItem("user-1", TODAY)).resolves.toEqual(item());

    expect(mocks.findPublishedDailySubjects).toHaveBeenCalledWith(TODAY, ["area-1"], "tenant-en");
    expect(mocks.chooseDailyCard).toHaveBeenCalledWith(
      expect.objectContaining({ learnedSubjectIds: new Set(["learned-subject"]) }),
    );
    expect(mocks.itemCreate).toHaveBeenCalledWith({
      data: {
        tenantId: "tenant-en",
        userId: "user-1",
        contentDate: TODAY,
        userLocalDate: TODAY,
        areaId: "area-1",
        subjectId: "subject-1",
        dailyAreaSubjectId: "daily-1",
      },
      include: { subject: true, area: true, dailyAreaSubject: true },
    });
  });

  it("does not assign through an inactive ancestor", async () => {
    mocks.findUserItemForDate.mockResolvedValue(null);
    const inactiveRoot = rootArea({ status: "DISABLED" });
    mocks.userAreaFindMany.mockResolvedValue([
      {
        areaId: "topic-1",
        area: rootArea({ id: "topic-1", level: "TOPIC", parentId: "area-1", parent: inactiveRoot }),
      },
    ]);

    await expect(TodayService.ensureCurrentItem("user-1", TODAY)).resolves.toBeNull();
    expect(mocks.findPublishedDailySubjects).not.toHaveBeenCalled();
    expect(mocks.itemCreate).not.toHaveBeenCalled();
  });

  it("recovers the winning row after a concurrent create", async () => {
    const winningItem = item({ id: "concurrent-item" });
    mocks.findUserItemForDate.mockResolvedValueOnce(null).mockResolvedValueOnce(winningItem);
    mocks.itemCreate.mockRejectedValue(new Error("unique constraint"));

    await expect(TodayService.ensureCurrentItem("user-1", TODAY)).resolves.toBe(winningItem);
  });

  it("marks only the current pending item viewed", async () => {
    mocks.findUserItemForDate.mockResolvedValue(item());

    await TodayService.markViewed("user-1", "item-1");

    expect(mocks.itemUpdate).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { status: "VIEWED", viewedAt: new Date("2026-08-19T12:00:00.000Z") },
    });
    expect(mocks.track).toHaveBeenCalledWith("user-1", "TODAY_VIEWED", { itemId: "item-1" });
  });

  it("keeps learned transitions idempotent", async () => {
    const learned = item({ status: "LEARNED" });
    mocks.findUserItemForDate.mockResolvedValue(learned);

    await expect(TodayService.markLearned("user-1", "item-1")).resolves.toBe(learned);
    expect(mocks.itemUpdate).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("skips a current card while preserving its first viewed time", async () => {
    const viewedAt = new Date("2026-08-19T10:00:00.000Z");
    mocks.findUserItemForDate.mockResolvedValue(item({ status: "VIEWED", viewedAt }));

    await TodayService.markSkipped("user-1", "item-1");

    expect(mocks.itemUpdate).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { status: "SKIPPED", viewedAt },
    });
    expect(mocks.track).toHaveBeenCalledWith("user-1", "ITEM_SKIPPED", {
      itemId: "item-1",
      subjectId: "subject-1",
    });
  });

  it("accepts ratings only after the current item is learned", async () => {
    mocks.findUserItemForDate.mockResolvedValueOnce(item({ status: "VIEWED" }));
    await expect(TodayService.rate("user-1", "item-1", 5)).resolves.toBeNull();
    expect(mocks.itemUpdate).not.toHaveBeenCalled();

    mocks.findUserItemForDate.mockResolvedValueOnce(item({ status: "LEARNED" }));
    await TodayService.rate("user-1", "item-1", 4, "Useful");
    expect(mocks.itemUpdate).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { rating: 4, ratingComment: "Useful" },
    });
    expect(mocks.track).toHaveBeenCalledWith("user-1", "RATING_SUBMITTED", {
      itemId: "item-1",
      rating: 4,
    });
  });

  it("does not mutate an item that is not today's item", async () => {
    mocks.findUserItemForDate.mockResolvedValue(item({ id: "different-item" }));

    await expect(TodayService.markLearned("user-1", "item-1")).resolves.toBeNull();
    expect(mocks.itemUpdate).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
  });
});
