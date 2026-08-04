import { describe, expect, it, vi } from "vitest";
import { assignUserItems, type UserAssignmentRepository } from "./user-assignment";

const DATE = new Date("2026-08-04T00:00:00.000Z");

describe("Multi-tenant user assignment", () => {
  it("only assigns daily items from matching tenant", async () => {
    const createItem = vi.fn().mockResolvedValue({ id: "item-1" });
    const repo: UserAssignmentRepository = {
      loadActiveUsersWithAreas: vi.fn().mockResolvedValue([
        {
          id: "user-es",
          tenantId: "es",
          timezone: "UTC",
          areas: [{ id: "area-ciencia", preferenceWeight: 1 }],
        },
      ]),
      loadPublishedDailySubjects: vi.fn().mockResolvedValue([
        { id: "daily-es", areaId: "area-ciencia", subjectId: "subject-es", tenantId: "es" },
      ]),
      loadLearnedSubjectIds: vi.fn().mockResolvedValue([]),
      hasItem: vi.fn().mockResolvedValue(false),
      createItem,
    };

    const result = await assignUserItems(DATE, repo);

    expect(result.assigned).toBe(1);
    expect(createItem).toHaveBeenCalledTimes(1);
    const call = createItem.mock.calls[0]![0]!;
    expect(call.subjectId).toBe("subject-es");
  });
});
