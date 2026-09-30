import { describe, expect, it } from "vitest";
import { getWikipediaResearchCategories } from "./wikipedia-research";

describe("Wikipedia research categories", () => {
  it("returns all research categories configured for an area", () => {
    expect(getWikipediaResearchCategories(["Category:Physics", "Category:Quantum mechanics"])).toEqual([
      "Category:Physics",
      "Category:Quantum mechanics",
    ]);
  });

  it("keeps a root area category as its own context", () => {
    expect(getWikipediaResearchCategories(["Category:Physics"])).toEqual(["Category:Physics"]);
  });
});
