import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ itemFindMany: vi.fn() }));

vi.mock("@narau/database", () => ({
  prisma: { userDailyItem: { findMany: mocks.itemFindMany } },
}));

import { getHistory } from "./dashboard";

const root = {
  id: "area-science",
  level: "AREA",
  name: "Science",
  slug: "science",
  color: "#123456",
  parent: null,
};
const topic = {
  id: "topic-physics",
  level: "TOPIC",
  name: "Physics",
  slug: "science-physics",
  color: null,
  parent: root,
};
const specialty = {
  id: "specialty-quantum",
  level: "SPECIALTY",
  name: "Quantum mechanics",
  slug: "science-physics-quantum",
  color: null,
  parent: { ...topic, parent: root },
};

describe("dashboard history", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-19T18:00:00.000Z"));
    vi.clearAllMocks();
  });

  it("scopes history to the user and tenant and groups nested nodes by root", async () => {
    mocks.itemFindMany.mockResolvedValue([
      {
        id: "item-today",
        contentDate: new Date("2026-08-19T00:00:00.000Z"),
        learnedAt: new Date("2026-08-19T10:00:00.000Z"),
        rating: 5,
        subject: { title: "Quantum entanglement" },
        area: specialty,
      },
      {
        id: "item-yesterday",
        contentDate: new Date("2026-08-18T00:00:00.000Z"),
        learnedAt: new Date("2026-08-18T10:00:00.000Z"),
        rating: null,
        subject: { title: "Classical mechanics" },
        area: topic,
      },
    ]);

    const history = await getHistory("user-1", "tenant-en");

    expect(mocks.itemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1", tenantId: "tenant-en", status: "LEARNED" } }),
    );
    expect(history).toMatchObject({ totalLearned: 2, currentStreak: 2 });
    expect(history.byArea).toHaveLength(1);
    expect(history.byArea[0]?.area).toEqual({
      id: "area-science",
      name: "Science",
      slug: "science",
      color: "#123456",
    });
    expect(history.byArea[0]?.learned.map((entry) => entry.breadcrumb)).toEqual([
      "Science › Physics › Quantum mechanics",
      "Science › Physics",
    ]);
  });

  it("allows a streak to continue from yesterday when today is not learned yet", async () => {
    mocks.itemFindMany.mockResolvedValue([
      {
        id: "item-yesterday",
        contentDate: new Date("2026-08-18T00:00:00.000Z"),
        learnedAt: new Date("2026-08-18T10:00:00.000Z"),
        rating: null,
        subject: { title: "Yesterday" },
        area: root,
      },
      {
        id: "item-before",
        contentDate: new Date("2026-08-17T00:00:00.000Z"),
        learnedAt: new Date("2026-08-17T10:00:00.000Z"),
        rating: null,
        subject: { title: "Before" },
        area: root,
      },
    ]);

    await expect(getHistory("user-1", "tenant-en")).resolves.toMatchObject({ currentStreak: 2 });
  });

  it("stops a streak at the first missing UTC date", async () => {
    mocks.itemFindMany.mockResolvedValue([
      {
        id: "item-today",
        contentDate: new Date("2026-08-19T00:00:00.000Z"),
        learnedAt: new Date("2026-08-19T10:00:00.000Z"),
        rating: null,
        subject: { title: "Today" },
        area: root,
      },
      {
        id: "item-old",
        contentDate: new Date("2026-08-17T00:00:00.000Z"),
        learnedAt: new Date("2026-08-17T10:00:00.000Z"),
        rating: null,
        subject: { title: "Old" },
        area: root,
      },
    ]);

    await expect(getHistory("user-1", "tenant-en")).resolves.toMatchObject({ currentStreak: 1 });
  });
});
