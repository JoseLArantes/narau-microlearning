import { describe, expect, it } from "vitest";
import {
  buildAreaTree,
  getAreaBreadcrumb,
  getRootAreaId,
  isAreaEffectivelyActive,
  normalizeAreaSourceConfig,
} from "./areas";

function area(overrides: Record<string, unknown>): { id: string; [key: string]: unknown } {
  return {
    id: "area",
    tenantId: "tenant-en",
    parentId: null,
    level: "AREA",
    name: "Science",
    slug: "science",
    description: null,
    iconUrl: null,
    color: null,
    status: "ACTIVE",
    displayOrder: 0,
    sourceConfig: { categories: ["Category:Science"] },
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    parent: null,
    ...overrides,
  };
}

describe("area hierarchy helpers", () => {
  it("requires every ancestor to be active", () => {
    const root = area({ status: "DISABLED" });
    const topic = area({ id: "topic", level: "TOPIC", parentId: root.id, parent: root });
    const specialty = area({ id: "specialty", level: "SPECIALTY", parentId: topic.id, parent: topic });

    expect(isAreaEffectivelyActive(root as never)).toBe(false);
    expect(isAreaEffectivelyActive(topic as never)).toBe(false);
    expect(isAreaEffectivelyActive(specialty as never)).toBe(false);
  });

  it("finds the root and breadcrumb for a specialty", () => {
    const root = area({ id: "root", name: "Science" });
    const topic = area({ id: "topic", name: "Physics", level: "TOPIC", parent: root });
    const specialty = area({ id: "specialty", name: "Quantum mechanics", level: "SPECIALTY", parent: topic });

    expect(getRootAreaId(specialty as never)).toBe("root");
    expect(getAreaBreadcrumb(specialty as never)).toBe("Science › Physics › Quantum mechanics");
  });

  it("builds and sorts a three-level tree", () => {
    const root = area({ id: "root", displayOrder: 2 });
    const firstRoot = area({ id: "first", name: "Art", slug: "art", displayOrder: 1 });
    const topicB = area({ id: "topic-b", parentId: "root", level: "TOPIC", name: "Zoology", displayOrder: 1, parent: root });
    const topicA = area({ id: "topic-a", parentId: "root", level: "TOPIC", name: "Astronomy", displayOrder: 1, parent: root });

    const tree = buildAreaTree([topicB, root, topicA, firstRoot] as never);

    expect(tree.map((node) => node.id)).toEqual(["first", "root"]);
    expect(tree[1]?.children.map((node) => node.id)).toEqual(["topic-a", "topic-b"]);
  });

  it("normalizes source categories with the full ancestor path", () => {
    const normalized = normalizeAreaSourceConfig(
      {
        name: "Quantum mechanics",
        parent: { name: "Physics", parent: { name: "Science" } },
      },
      {
        categories: ["Category:Quantum mechanics"],
        includeSubcategories: true,
        depth: 1,
        maxCandidates: 50,
        excludeCategories: [],
      },
    );

    expect(normalized.categories).toEqual([
      "Category:Quantum mechanics",
      "Category:Science",
      "Category:Physics",
    ]);
  });
});
