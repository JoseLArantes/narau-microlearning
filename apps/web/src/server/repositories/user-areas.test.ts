import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  areaFindMany: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@narau/database", () => ({
  prisma: {
    area: { findMany: mocks.areaFindMany },
    $transaction: mocks.transaction,
  },
}));

import { setUserAreas, validateSelectedAreaIds } from "./user-areas";

function node(overrides: Record<string, unknown> = {}): { id: string; [key: string]: unknown } {
  return {
    id: "area-1",
    tenantId: "tenant-en",
    parentId: null,
    level: "AREA",
    name: "Science",
    slug: "science",
    description: null,
    iconUrl: null,
    color: null,
    status: "ACTIVE",
    displayOrder: 1,
    sourceConfig: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    ...overrides,
  };
}

describe("user area selection repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteMany.mockResolvedValue({ count: 0 });
    mocks.createMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation(async (callback) =>
      callback({ userArea: { deleteMany: mocks.deleteMany, createMany: mocks.createMany } }),
    );
  });

  it("rejects ids outside the current tenant", async () => {
    mocks.areaFindMany.mockResolvedValue([node({ id: "area-1" })]);

    await expect(
      validateSelectedAreaIds("tenant-en", ["area-1", "area-other-tenant"]),
    ).rejects.toThrow("not available in this tenant");
    expect(mocks.areaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["area-1", "area-other-tenant"] }, tenantId: "tenant-en" } }),
    );
  });

  it("rejects a topic whose ancestor is inactive", async () => {
    mocks.areaFindMany.mockResolvedValue([
      node({
        id: "topic-1",
        level: "TOPIC",
        parentId: "area-1",
        parent: node({ id: "area-1", status: "DISABLED" }),
      }),
    ]);

    await expect(validateSelectedAreaIds("tenant-en", ["topic-1"])).rejects.toThrow(
      "not currently available",
    );
  });

  it("rejects selecting an ancestor and descendant together", async () => {
    const root = node({ id: "area-1" });
    mocks.areaFindMany.mockResolvedValue([
      root,
      node({ id: "topic-1", level: "TOPIC", parentId: root.id, parent: root }),
    ]);

    await expect(validateSelectedAreaIds("tenant-en", ["area-1", "topic-1"])).rejects.toThrow(
      "either a broad area or its more specific topics",
    );
  });

  it("deduplicates ids and replaces selections transactionally", async () => {
    mocks.areaFindMany.mockResolvedValue([node({ id: "area-1" })]);

    await setUserAreas("user-1", "tenant-en", ["area-1", "area-1"], "admin-1");

    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1", tenantId: "tenant-en" } });
    expect(mocks.createMany).toHaveBeenCalledWith({
      data: [{ userId: "user-1", tenantId: "tenant-en", areaId: "area-1", assignedBy: "admin-1" }],
    });
  });
});
