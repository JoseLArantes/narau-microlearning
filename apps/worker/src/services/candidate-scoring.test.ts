import { describe, expect, it } from "vitest";
import { scoreCandidate } from "./candidate-scoring";

const base = {
  title: "Marie Curie",
  summary: "x".repeat(500),
  categories: ["Category:Scientists"],
};

describe("scoreCandidate", () => {
  it("scores a strong candidate highly", () => {
    const score = scoreCandidate({
      ...base,
      summary: "Marie Curie was a Polish physicist. ".repeat(8),
      hasImage: true,
      categories: ["Category:Scientists", "Category:Physicists"],
    });
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("awards 40 points for a summary of 200-1200 characters", () => {
    expect(scoreCandidate({ ...base, summary: "x".repeat(200) })).toBeGreaterThanOrEqual(40);
    expect(scoreCandidate({ ...base, summary: "x".repeat(1200) })).toBeGreaterThanOrEqual(40);
    expect(scoreCandidate({ ...base, summary: "x".repeat(199) })).toBeLessThan(40);
  });

  it("awards 20 points when an image exists", () => {
    const withImage = scoreCandidate({ ...base, hasImage: true });
    const withoutImage = scoreCandidate({ ...base, hasImage: false });
    expect(withImage - withoutImage).toBe(20);
  });

  it("awards 10 points for a definitional first sentence", () => {
    const definitional = scoreCandidate({ ...base, summary: "A kiwi is a flightless bird. ".repeat(12) });
    const vague = scoreCandidate({ ...base, summary: "Something about a kiwi. ".repeat(12) });
    expect(definitional - vague).toBe(10);
  });

  it("awards 10 points when the page has categories", () => {
    const withCategories = scoreCandidate({ ...base, categories: ["Category:Science"] });
    const withoutCategories = scoreCandidate({ ...base, categories: [] });
    expect(withCategories - withoutCategories).toBe(10);
  });

  it("penalizes disambiguation-like candidates", () => {
    const disambig = scoreCandidate({
      ...base,
      title: "Mercury (disambiguation)",
      summary: "Mercury may refer to many things. ".repeat(8),
    });
    expect(disambig).toBeLessThanOrEqual(20);
  });

  it("penalizes list-like candidates", () => {
    const list = scoreCandidate({
      ...base,
      title: "List of physicists",
      summary: "This is a list of physicists. ".repeat(8),
    });
    expect(list).toBeLessThanOrEqual(30);
  });

  it("penalizes stub-like candidates", () => {
    const stub = scoreCandidate({ ...base, summary: "A short stub summary." });
    const full = scoreCandidate({ ...base, summary: "x".repeat(250) });
    expect(stub).toBeLessThan(full);
  });

  it("clamps the score between 0 and 100", () => {
    const allNegative = scoreCandidate({
      title: "List of things (disambiguation)",
      summary: "May refer to a list. ",
      hasImage: false,
      categories: ["Category:Lists", "Category:Disambiguation pages"],
    });
    expect(allNegative).toBeGreaterThanOrEqual(0);
    const maxed = scoreCandidate({
      ...base,
      summary: "The example thing is a real subject. ".repeat(40),
      hasImage: true,
      categories: Array.from({ length: 20 }, (_, i) => `Category:C${i}`),
    });
    expect(maxed).toBeLessThanOrEqual(100);
  });
});
