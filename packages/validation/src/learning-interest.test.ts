import { describe, expect, it } from "vitest";
import { learningInterestSelectionSchema } from "./area";

describe("learningInterestSelectionSchema", () => {
  it("requires at least one exact node selection", () => {
    expect(learningInterestSelectionSchema.safeParse({ selectedNodeIds: [] }).success).toBe(false);
    expect(learningInterestSelectionSchema.safeParse({ selectedNodeIds: ["area-1"] }).success).toBe(true);
  });

  it("removes duplicate IDs after parsing", () => {
    expect(learningInterestSelectionSchema.parse({ selectedNodeIds: ["a", "a", "b"] })).toEqual({
      selectedNodeIds: ["a", "b"],
    });
  });
});
