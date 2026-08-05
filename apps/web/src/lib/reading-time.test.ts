import { describe, expect, it } from "vitest";
import { fitToReadingTime, prepareReadingContent } from "./reading-time";

describe("fitToReadingTime", () => {
  it("preserves paragraph boundaries when content fits the target", () => {
    const result = fitToReadingTime(
      "First paragraph has a short sentence.\n\nSecond paragraph has another short sentence.",
      3,
      "en",
    );

    expect(result.text).toContain("\n\n");
  });

  it("trims at a sentence boundary without flattening paragraphs", () => {
    const first = Array.from({ length: 110 }, (_, index) => `first${index}`).join(" ");
    const second = Array.from({ length: 110 }, (_, index) => `second${index}`).join(" ");
    const result = fitToReadingTime(`${first}.\n\n${second}.`, 1, "en");

    expect(result.text).not.toContain("second0");
    expect(result.text).not.toMatch(/\.\.\.$/);
  });
});

describe("prepareReadingContent", () => {
  it("removes a displayed standfirst from the body", () => {
    const result = prepareReadingContent(
      "The example is a thing. It has a second sentence.\n\nIt has another paragraph.",
      "The example is a thing.",
      "en",
    );

    expect(result.standfirst).toBe("The example is a thing.");
    expect(result.paragraphs).toEqual(["It has a second sentence.", "It has another paragraph."]);
    expect(result.paragraphs.join(" ")).not.toContain("The example is a thing.");
  });

  it("does not italicize an overlong hook", () => {
    const longHook = `${Array.from({ length: 40 }, (_, index) => `word${index}`).join(" ")}.`;
    const result = prepareReadingContent(`${longHook} The body continues.`, longHook, "en");

    expect(result.standfirst).toBeUndefined();
    expect(result.paragraphs.join(" ")).toContain(longHook);
  });

  it("groups legacy single-block summaries into readable paragraphs", () => {
    const sentences = Array.from(
      { length: 12 },
      (_, sentenceIndex) =>
        `Sentence ${sentenceIndex} explains the subject with enough context for a learner to follow the idea clearly`,
    );
    const result = prepareReadingContent(sentences.join(". ") + ".", undefined, "en");

    expect(result.paragraphs.length).toBeGreaterThan(1);
    expect(result.paragraphs.join(" ")).toBe(sentences.join(". ") + ".");
  });
});
