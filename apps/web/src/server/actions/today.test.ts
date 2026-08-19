import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  markViewed: vi.fn(),
  markLearned: vi.fn(),
  markSkipped: vi.fn(),
  rate: vi.fn(),
  createReport: vi.fn(),
}));

vi.mock("@/server/guards", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/server/services/today", () => ({
  TodayService: {
    markViewed: mocks.markViewed,
    markLearned: mocks.markLearned,
    markSkipped: mocks.markSkipped,
    rate: mocks.rate,
  },
}));
vi.mock("@/server/services/reports", () => ({ createReport: mocks.createReport }));

import {
  markTodayLearned,
  rateTodayItem,
  reportTodayItem,
  skipTodayItem,
} from "./today";

describe("today server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ user: { id: "user-1", tenantId: "tenant-en" } });
    mocks.markLearned.mockResolvedValue({ id: "item-1" });
    mocks.markSkipped.mockResolvedValue({ id: "item-1" });
    mocks.rate.mockResolvedValue({ id: "item-1" });
    mocks.createReport.mockResolvedValue({ id: "report-1" });
  });

  it("maps an unavailable learned item to a safe action error", async () => {
    mocks.markLearned.mockResolvedValue(null);

    await expect(markTodayLearned("item-1")).resolves.toEqual({
      ok: false,
      error: "That item is not available.",
    });
  });

  it("maps an unavailable skip to a safe action error", async () => {
    mocks.markSkipped.mockResolvedValue(null);

    await expect(skipTodayItem("item-1")).resolves.toEqual({
      ok: false,
      error: "That item is not available.",
    });
  });

  it("validates ratings before reading the session", async () => {
    const result = await rateTodayItem({ itemId: "", rating: 7 });

    expect(result).toMatchObject({ ok: false, error: "The rating is invalid." });
    expect(mocks.requireUser).not.toHaveBeenCalled();
    expect(mocks.rate).not.toHaveBeenCalled();
  });

  it("explains that ratings require a learned item", async () => {
    mocks.rate.mockResolvedValue(null);

    await expect(rateTodayItem({ itemId: "item-1", rating: 5 })).resolves.toEqual({
      ok: false,
      error: "You can only rate an item after marking it learned.",
    });
  });

  it("passes validated reports to the authenticated user service", async () => {
    await expect(
      reportTodayItem({
        subjectId: "subject-1",
        itemId: "item-1",
        reason: "OUTDATED",
        details: "The source has changed.",
      }),
    ).resolves.toEqual({ ok: true, data: undefined });

    expect(mocks.createReport).toHaveBeenCalledWith("user-1", {
      subjectId: "subject-1",
      itemId: "item-1",
      reason: "OUTDATED",
      details: "The source has changed.",
    });
  });

  it("converts service exceptions into action errors", async () => {
    mocks.requireUser.mockRejectedValue(new Error("Session expired."));

    await expect(markTodayLearned("item-1")).resolves.toEqual({
      ok: false,
      error: "Session expired.",
    });
  });
});
