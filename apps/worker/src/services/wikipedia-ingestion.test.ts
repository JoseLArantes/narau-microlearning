import { describe, expect, it } from "vitest";
import { getWikipediaResearchCategories } from "./wikipedia-research";

describe("Wikipedia research categories", () => {
  it("uses the most specific category as the primary crawl context", () => {
    expect(getWikipediaResearchCategories(["Category:Physics", "Category:Quantum mechanics"])).toEqual([
      "Category:Quantum mechanics",
    ]);
  });

  it("keeps a root area category as its own context", () => {
    expect(getWikipediaResearchCategories(["Category:Physics"])).toEqual(["Category:Physics"]);
  });
});
