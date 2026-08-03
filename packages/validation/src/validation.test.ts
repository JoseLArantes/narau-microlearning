import { describe, expect, it } from "vitest";
import {
  areaSourceConfigSchema,
  assignUserAreasSchema,
  createAreaSchema,
  createUserSchema,
  onboardingAreasSchema,
  overrideDailySubjectSchema,
  ratingSchema,
  reportSchema,
  updateAreaSchema,
} from "./index";

describe("areaSourceConfigSchema", () => {
  it("accepts a valid config", () => {
    const result = areaSourceConfigSchema.safeParse({
      categories: ["Category:Science"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: [],
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults", () => {
    const result = areaSourceConfigSchema.safeParse({ categories: ["Category:Science"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.includeSubcategories).toBe(true);
      expect(result.data.depth).toBe(1);
      expect(result.data.maxCandidates).toBe(100);
      expect(result.data.excludeCategories).toEqual([]);
    }
  });

  it("rejects config without categories", () => {
    const result = areaSourceConfigSchema.safeParse({ categories: [] });
    expect(result.success).toBe(false);
  });

  it("rejects config with empty category string", () => {
    const result = areaSourceConfigSchema.safeParse({ categories: [""] });
    expect(result.success).toBe(false);
  });

  it("rejects depth outside 0..3", () => {
    expect(areaSourceConfigSchema.safeParse({ categories: ["Category:X"], depth: 4 }).success).toBe(false);
    expect(areaSourceConfigSchema.safeParse({ categories: ["Category:X"], depth: -1 }).success).toBe(false);
  });

  it("rejects maxCandidates outside 10..500", () => {
    expect(areaSourceConfigSchema.safeParse({ categories: ["Category:X"], maxCandidates: 5 }).success).toBe(false);
    expect(areaSourceConfigSchema.safeParse({ categories: ["Category:X"], maxCandidates: 501 }).success).toBe(false);
  });
});

describe("area slug", () => {
  it("accepts url-safe slugs", () => {
    const valid = { sourceConfig: { categories: ["Category:Space"] } };
    expect(createAreaSchema.safeParse({ name: "Space", slug: "space", ...valid }).success).toBe(true);
    expect(createAreaSchema.safeParse({ name: "Art History", slug: "art-history", ...valid }).success).toBe(true);
    expect(createAreaSchema.safeParse({ name: "Science", slug: "science2", ...valid }).success).toBe(true);
  });

  it("rejects url-unsafe slugs", () => {
    expect(createAreaSchema.safeParse({ name: "A", slug: "My Area" }).success).toBe(false);
    expect(createAreaSchema.safeParse({ name: "A", slug: "space_" }).success).toBe(false);
    expect(createAreaSchema.safeParse({ name: "A", slug: "café" }).success).toBe(false);
    expect(createAreaSchema.safeParse({ name: "A", slug: "-lead" }).success).toBe(false);
    expect(createAreaSchema.safeParse({ name: "A", slug: "trail-" }).success).toBe(false);
  });
});

describe("createAreaSchema", () => {
  it("accepts a full valid area", () => {
    const result = createAreaSchema.safeParse({
      name: "Science",
      slug: "science",
      description: "All about science",
      color: "#2f5d50",
      displayOrder: 1,
      sourceConfig: { categories: ["Category:Science"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing sourceConfig", () => {
    const result = createAreaSchema.safeParse({ name: "Science", slug: "science" });
    expect(result.success).toBe(false);
  });

  it("rejects short names", () => {
    const result = createAreaSchema.safeParse({
      name: "X",
      slug: "science",
      sourceConfig: { categories: ["Category:Science"] },
    });
    expect(result.success).toBe(false);
  });
});

describe("updateAreaSchema", () => {
  it("accepts partial updates", () => {
    expect(updateAreaSchema.safeParse({ description: "New description" }).success).toBe(true);
    expect(updateAreaSchema.safeParse({ status: "DISABLED" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(updateAreaSchema.safeParse({ status: "BANANA" }).success).toBe(false);
  });
});

describe("onboardingAreasSchema", () => {
  it("accepts one or more areas", () => {
    expect(onboardingAreasSchema.safeParse({ areaIds: ["area-1"] }).success).toBe(true);
    expect(onboardingAreasSchema.safeParse({ areaIds: ["area-1", "area-2"] }).success).toBe(true);
  });

  it("rejects zero areas", () => {
    expect(onboardingAreasSchema.safeParse({ areaIds: [] }).success).toBe(false);
    expect(onboardingAreasSchema.safeParse({ areaIds: [] }).success).toBe(false);
  });

  it("rejects empty string area ids", () => {
    expect(onboardingAreasSchema.safeParse({ areaIds: [""] }).success).toBe(false);
  });
});

describe("ratingSchema", () => {
  it("accepts integer ratings from 1 to 5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(ratingSchema.safeParse({ itemId: "item-1", rating }).success).toBe(true);
    }
  });

  it("rejects ratings out of range", () => {
    expect(ratingSchema.safeParse({ itemId: "item-1", rating: 0 }).success).toBe(false);
    expect(ratingSchema.safeParse({ itemId: "item-1", rating: 6 }).success).toBe(false);
    expect(ratingSchema.safeParse({ itemId: "item-1", rating: -1 }).success).toBe(false);
  });

  it("rejects non-integer ratings", () => {
    expect(ratingSchema.safeParse({ itemId: "item-1", rating: 1.5 }).success).toBe(false);
    expect(ratingSchema.safeParse({ itemId: "item-1", rating: "3" }).success).toBe(false);
  });

  it("rejects missing itemId", () => {
    expect(ratingSchema.safeParse({ rating: 3 }).success).toBe(false);
  });
});

describe("reportSchema", () => {
  it("accepts a valid report", () => {
    const result = reportSchema.safeParse({
      subjectId: "subject-1",
      reason: "INACCURATE",
      details: "The date is wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown reasons", () => {
    const result = reportSchema.safeParse({ subjectId: "subject-1", reason: "ANGRY" });
    expect(result.success).toBe(false);
  });

  it("rejects details longer than 2000 characters", () => {
    const result = reportSchema.safeParse({
      subjectId: "subject-1",
      reason: "OTHER",
      details: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts details of exactly 2000 characters", () => {
    const result = reportSchema.safeParse({
      subjectId: "subject-1",
      reason: "OTHER",
      details: "x".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a report without subject", () => {
    const result = reportSchema.safeParse({ reason: "OTHER" });
    expect(result.success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("accepts a valid email", () => {
    expect(createUserSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(createUserSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(createUserSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("accepts optional role and status", () => {
    const result = createUserSchema.safeParse({
      email: "user@example.com",
      role: "ADMIN",
      status: "INVITED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(createUserSchema.safeParse({ email: "user@example.com", role: "KING" }).success).toBe(false);
  });
});

describe("assignUserAreasSchema", () => {
  it("accepts a user with areas", () => {
    expect(assignUserAreasSchema.safeParse({ userId: "user-1", areaIds: ["a", "b"] }).success).toBe(true);
  });

  it("rejects empty area list", () => {
    expect(assignUserAreasSchema.safeParse({ userId: "user-1", areaIds: [] }).success).toBe(false);
  });
});

describe("overrideDailySubjectSchema", () => {
  it("accepts a valid override", () => {
    const result = overrideDailySubjectSchema.safeParse({
      contentDate: "2026-08-03",
      areaId: "area-1",
      subjectId: "subject-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(
      overrideDailySubjectSchema.safeParse({ contentDate: "03/08/2026", areaId: "a", subjectId: "s" }).success,
    ).toBe(false);
    expect(
      overrideDailySubjectSchema.safeParse({ contentDate: "2026-8-3", areaId: "a", subjectId: "s" }).success,
    ).toBe(false);
  });
});
