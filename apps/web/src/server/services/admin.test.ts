import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  areaFindFirst: vi.fn(),
  candidateFindFirst: vi.fn(),
  dailyUpsert: vi.fn(),
  reportFindFirst: vi.fn(),
  reportUpdate: vi.fn(),
  auditCreate: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@narau/database", () => ({
  prisma: {
    area: { findFirst: mocks.areaFindFirst },
    areaSubjectCandidate: { findFirst: mocks.candidateFindFirst },
    dailyAreaSubject: { upsert: mocks.dailyUpsert },
    inaccuracyReport: {
      findFirst: mocks.reportFindFirst,
      update: mocks.reportUpdate,
    },
    auditLog: { create: mocks.auditCreate },
  },
}));
vi.mock("@/server/tracking", () => ({ track: mocks.track }));

import { overrideDailySubject, resolveReport } from "./admin";

const CONTENT_DATE = new Date("2026-08-19T00:00:00.000Z");

describe("admin service tenant boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.areaFindFirst.mockResolvedValue({
      id: "area-1",
      tenantId: "tenant-en",
      level: "AREA",
      status: "ACTIVE",
      parent: null,
    });
    mocks.candidateFindFirst.mockResolvedValue({ subjectId: "subject-1" });
    mocks.dailyUpsert.mockResolvedValue({ id: "daily-1" });
    mocks.auditCreate.mockResolvedValue({});
    mocks.track.mockResolvedValue(undefined);
    mocks.reportFindFirst.mockResolvedValue({ id: "report-1" });
    mocks.reportUpdate.mockResolvedValue({ id: "report-1", status: "RESOLVED" });
  });

  it("rejects overrides for inactive hierarchies", async () => {
    mocks.areaFindFirst.mockResolvedValue({
      id: "topic-1",
      tenantId: "tenant-en",
      level: "TOPIC",
      status: "ACTIVE",
      parent: { id: "area-1", level: "AREA", status: "DISABLED", parent: null },
    });

    await expect(
      overrideDailySubject(
        { tenantId: "tenant-en", contentDate: CONTENT_DATE, areaId: "topic-1", subjectId: "subject-1" },
        "admin-1",
      ),
    ).rejects.toThrow("not currently active");
    expect(mocks.dailyUpsert).not.toHaveBeenCalled();
  });

  it("requires an active candidate from the same tenant, area, and date", async () => {
    mocks.candidateFindFirst.mockResolvedValue(null);

    await expect(
      overrideDailySubject(
        { tenantId: "tenant-en", contentDate: CONTENT_DATE, areaId: "area-1", subjectId: "subject-other" },
        "admin-1",
      ),
    ).rejects.toThrow("not an active candidate");
    expect(mocks.candidateFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: "tenant-en",
        areaId: "area-1",
        subjectId: "subject-other",
        generatedForDate: CONTENT_DATE,
        status: { in: ["CANDIDATE", "SELECTED"] },
        subject: { status: "ACTIVE" },
      },
      select: { subjectId: true },
    });
  });

  it("publishes an override, clears stale curation, and records its effects", async () => {
    await overrideDailySubject(
      { tenantId: "tenant-en", contentDate: CONTENT_DATE, areaId: "area-1", subjectId: "subject-1" },
      "admin-1",
    );

    expect(mocks.dailyUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          contentDate_areaId_tenantId: {
            contentDate: CONTENT_DATE,
            areaId: "area-1",
            tenantId: "tenant-en",
          },
        },
        update: expect.objectContaining({
          subjectId: "subject-1",
          selectedBy: "admin:admin-1",
          curationStatus: "PENDING",
          curatedText: null,
          curationError: null,
        }),
      }),
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "tenant-en",
          actorId: "admin-1",
          action: "ADMIN_SUBJECT_OVERRIDDEN",
        }),
      }),
    );
    expect(mocks.track).toHaveBeenCalledWith("admin-1", "ADMIN_SUBJECT_OVERRIDDEN", {
      areaId: "area-1",
      subjectId: "subject-1",
    });
  });

  it("does not resolve a report outside the current tenant", async () => {
    mocks.reportFindFirst.mockResolvedValue(null);

    await expect(resolveReport("report-other", "admin-1", "tenant-en")).rejects.toThrow(
      "Report not found in the current tenant",
    );
    expect(mocks.reportUpdate).not.toHaveBeenCalled();
  });
});
