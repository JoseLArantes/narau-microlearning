import { describe, expect, it } from "vitest";
import {
  isPersonalityEligible,
  isPersonalityLike,
  MIN_PERSONALITY_CITATIONS,
  scoreCandidate,
} from "./candidate-scoring";

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

  it("awards 40 points for a summary of 200-8000 characters", () => {
    expect(scoreCandidate({ ...base, summary: "x".repeat(200) })).toBeGreaterThanOrEqual(40);
    expect(scoreCandidate({ ...base, summary: "x".repeat(8000) })).toBeGreaterThanOrEqual(40);
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

describe("personality eligibility", () => {
  const personality = {
    title: "A scientist",
    summary: "A scientist who contributed to the field.",
    categories: ["Category:Scientists", "Category:Physics"],
  };

  it("recognizes personality-like category pages", () => {
    expect(isPersonalityLike(personality)).toBe(true);
    expect(isPersonalityLike({ ...personality, categories: ["Category:Physics"] })).toBe(false);
  });

  it("rejects a personality without multiple citations", () => {
    expect(isPersonalityEligible({ ...personality, citationCount: MIN_PERSONALITY_CITATIONS - 1 }, "Category:Physics")).toBe(false);
  });

  it("rejects a well-cited personality unrelated to the research focus", () => {
    expect(isPersonalityEligible({ ...personality, citationCount: MIN_PERSONALITY_CITATIONS }, "Category:History")).toBe(false);
  });

  it("accepts a well-cited personality with a matching research category", () => {
    expect(isPersonalityEligible({ ...personality, citationCount: MIN_PERSONALITY_CITATIONS }, "Category:Physics")).toBe(true);
  });

  it("does not impose the personality citation gate on ordinary subjects", () => {
    expect(
      isPersonalityEligible(
        { title: "Quantum mechanics", summary: "x".repeat(200), categories: ["Category:Physics"], citationCount: 0 },
        "Category:Physics",
      ),
    ).toBe(true);
  });
});
