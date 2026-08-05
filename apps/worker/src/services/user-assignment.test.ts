import { describe, expect, it, vi } from "vitest";
import { assignUserItems, type UserAssignmentRepository } from "./user-assignment";

const DATE = new Date("2026-08-03T00:00:00.000Z");

function createRepo(overrides: Partial<UserAssignmentRepository> = {}): UserAssignmentRepository {
  return {
    loadActiveUsersWithAreas: vi.fn().mockResolvedValue([
      {
        id: "user-1",
        tenantId: "tenant-en",
        timezone: "UTC",
        areas: [
          { id: "area-1", preferenceWeight: 1 },
          { id: "area-2", preferenceWeight: 1 },
        ],
      },
    ]),
    loadPublishedDailySubjects: vi.fn().mockResolvedValue([
      { id: "daily-1", areaId: "area-1", subjectId: "subject-1" },
      { id: "daily-2", areaId: "area-2", subjectId: "subject-2" },
    ]),
    loadLearnedSubjectIds: vi.fn().mockResolvedValue([]),
    hasItem: vi.fn().mockResolvedValue(false),
    createItem: vi.fn().mockResolvedValue({ id: "item-1" }),
    ...overrides,
  };
}

describe("assignUserItems", () => {
  it("creates one item per active user when none exists", async () => {
    const repo = createRepo();
    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(1);
    expect(result.skipped).toBe(0);
    expect(repo.createItem).toHaveBeenCalledTimes(1);
    const call = vi.mocked(repo.createItem).mock.calls[0]![0]!;
    expect(call).toMatchObject({ userId: "user-1", contentDate: DATE });
    expect(["area-1", "area-2"]).toContain(call.areaId);
    expect(["subject-1", "subject-2"]).toContain(call.subjectId);
  });

  it("skips users who already have an item for the date (idempotency)", async () => {
    const repo = createRepo({ hasItem: vi.fn().mockResolvedValue(true) });
    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(0);
    expect(result.skipped).toBe(1);
    expect(repo.createItem).not.toHaveBeenCalled();
  });

  it("does not create an invalid item when no subjects are available", async () => {
    const repo = createRepo({ loadPublishedDailySubjects: vi.fn().mockResolvedValue([]) });
    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(0);
    expect(result.skipped).toBe(0);
    expect(repo.createItem).not.toHaveBeenCalled();
  });

  it("excludes subjects the user already learned", async () => {
    const repo = createRepo({
      loadLearnedSubjectIds: vi.fn().mockResolvedValue(["subject-1"]),
    });
    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(1);
    const call = vi.mocked(repo.createItem).mock.calls[0]![0]!;
    expect(call.subjectId).toBe("subject-2");
  });

  it("continues when one user fails", async () => {
    const repo = createRepo({
      loadActiveUsersWithAreas: vi.fn().mockResolvedValue([
        { id: "user-1", tenantId: "tenant-en", timezone: "UTC", areas: [{ id: "area-1", preferenceWeight: 1 }] },
        { id: "user-2", tenantId: "tenant-en", timezone: "UTC", areas: [{ id: "area-1", preferenceWeight: 1 }] },
      ]),
      createItem: vi
        .fn()
        .mockRejectedValueOnce(new Error("db down"))
        .mockResolvedValueOnce({ id: "item-2" }),
    });

    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(1);
    expect(result.errors).toHaveLength(1);
  });
});
