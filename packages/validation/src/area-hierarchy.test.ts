import { describe, expect, it } from "vitest";
import {
  buildHierarchicalAreaSlug,
  buildWikipediaCategorySuggestions,
  getChildAreaSlugPrefix,
  hasHierarchicalAreaSlug,
  normalizeWikipediaCategoryTitle,
} from "./area";

describe("hierarchical area values", () => {
  it("builds a required slug prefix from the complete parent path", () => {
    expect(getChildAreaSlugPrefix(["engineering"])).toBe("engineering-");
    expect(getChildAreaSlugPrefix(["engineering", "computer"])).toBe("engineering-computer-");
    expect(buildHierarchicalAreaSlug(["engineering", "computer"], "Operating Systems")).toBe(
      "engineering-computer-operating-systems",
    );
  });

  it("rejects child slugs that do not carry the complete parent path", () => {
    expect(hasHierarchicalAreaSlug("engineering-computer", ["engineering"])).toBe(true);
    expect(hasHierarchicalAreaSlug("computer", ["engineering"])).toBe(false);
    expect(hasHierarchicalAreaSlug("engineering-computer-ai", ["engineering", "computer"])).toBe(true);
  });
});

describe("Wikipedia category values", () => {
  it("keeps Category: as a normalized fixed prefix", () => {
    expect(normalizeWikipediaCategoryTitle(" physics ")).toBe("Category:physics");
    expect(normalizeWikipediaCategoryTitle("Category:Quantum mechanics")).toBe("Category:Quantum mechanics");
  });

  it("builds unique ancestor-to-child category suggestions", () => {
    expect(buildWikipediaCategorySuggestions(["Physics", "Quantum Mechanics", "Quantum Mechanics"])).toEqual([
      "Category:Physics",
      "Category:Quantum Mechanics",
    ]);
  });
});
