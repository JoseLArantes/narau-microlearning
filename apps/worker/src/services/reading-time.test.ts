import { describe, expect, it } from "vitest";
import { isCardLengthEligible, readingTimeWordBounds } from "./reading-time";

describe("card reading-time eligibility", () => {
  it("uses a rounded fifteen-percent window around the configured target", () => {
    expect(readingTimeWordBounds(5)).toEqual({
      minimumWords: 800,
      targetWords: 1_000,
      maximumWords: 1_200,
    });
  });

  it("accepts microlearning card summaries with at least 20 words", () => {
    expect(isCardLengthEligible("word ".repeat(50), 5, "en")).toBe(true);
    expect(isCardLengthEligible("word ".repeat(20), 5, "en")).toBe(true);
    expect(isCardLengthEligible("word ".repeat(10), 5, "en")).toBe(false);
  });
});
