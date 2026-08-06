import { describe, expect, it, vi } from "vitest";
import { dedupeCandidatePool, selectDailySubjects, type SubjectSelectionRepository } from "./subject-selection";

const DATE = new Date("2026-08-06T00:00:00.000Z");

describe("daily subject selection", () => {
  it("keeps the newest candidate row when a subject exists in multiple daily pools", () => {
    expect(
      dedupeCandidatePool([
        { id: "today-row", subjectId: "subject-1", candidateScore: 0.9 },
        { id: "older-row", subjectId: "subject-1", candidateScore: 1 },
        { id: "other-row", subjectId: "subject-2", candidateScore: 0.5 },
      ]),
    ).toEqual([
      { id: "today-row", subjectId: "subject-1", candidateScore: 0.9 },
      { id: "other-row", subjectId: "subject-2", candidateScore: 0.5 },
    ]);
  });

  it("publishes from the reusable pool when today's ingestion produced no rows", async () => {
    const upsertDailySubject = vi.fn().mockResolvedValue({ id: "daily-1" });
    const repo: SubjectSelectionRepository = {
      loadActiveAreas: vi.fn().mockResolvedValue([{ id: "area-1", tenantId: "tenant-en" }]),
      loadCandidates: vi.fn().mockResolvedValue([
        { id: "older-row", subjectId: "subject-1", candidateScore: 0.8 },
      ]),
      loadRecentlySelectedSubjectIds: vi.fn().mockResolvedValue([]),
      findExisting: vi.fn().mockResolvedValue(null),
      upsertDailySubject,
      markSelected: vi.fn().mockResolvedValue({}),
      markRejected: vi.fn().mockResolvedValue({}),
    };

    const result = await selectDailySubjects(DATE, repo);

    expect(result).toMatchObject({ areas: 1, selected: 1, skipped: [] });
    expect(upsertDailySubject).toHaveBeenCalledWith({
      tenantId: "tenant-en",
      contentDate: DATE,
      areaId: "area-1",
      subjectId: "subject-1",
      selectedBy: "worker",
    });
  });
});
