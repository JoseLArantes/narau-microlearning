import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analyticsEventCreate: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock("@narau/database", () => ({
  prisma: {
    analyticsEvent: { create: mocks.analyticsEventCreate },
    user: { findUnique: mocks.userFindUnique },
  },
}));

import { track } from "./tracking";

describe("track", () => {
  beforeEach(() => {
    mocks.analyticsEventCreate.mockReset();
    mocks.userFindUnique.mockReset();
    mocks.analyticsEventCreate.mockResolvedValue({});
  });

  it("persists analytics events for an existing user", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "user-id" });

    await track("user-id", "DASHBOARD_VIEWED", { source: "test" });

    expect(mocks.userFindUnique).toHaveBeenCalledWith({
      where: { id: "user-id" },
      select: { id: true },
    });
    expect(mocks.analyticsEventCreate).toHaveBeenCalledWith({
      data: { userId: "user-id", name: "DASHBOARD_VIEWED", payload: { source: "test" } },
    });
  });

  it("writes stale-session events anonymously instead of violating the foreign key", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    await track("stale-user-id", "DASHBOARD_VIEWED");

    expect(mocks.analyticsEventCreate).toHaveBeenCalledWith({
      data: { name: "DASHBOARD_VIEWED", payload: undefined },
    });
  });
});
