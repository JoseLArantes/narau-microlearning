import { describe, expect, it } from "vitest";
import { cleanText, createContentHash, normalizeWikipediaContent, truncateToSentence } from "./index";

describe("cleanText", () => {
  it("removes numeric citation markers", () => {
    expect(cleanText("The sky is blue.[1][2]")).toBe("The sky is blue.");
  });

  it("removes named citation markers", () => {
    expect(cleanText("The sky is blue.[citation needed]")).toBe("The sky is blue.");
    expect(cleanText("The sky is blue.[note 1]")).toBe("The sky is blue.");
  });

  it("removes HTML tags", () => {
    expect(cleanText("<p>The sky is <b>blue</b>.</p>")).toBe("The sky is blue.");
  });

  it("collapses whitespace", () => {
    expect(cleanText("The  sky\n   is\tblue. ")).toBe("The sky is blue.");
  });

  it("preserves paragraph boundaries while collapsing inline whitespace", () => {
    expect(cleanText("First paragraph.\n\n  Second   paragraph.\nThird sentence.")).toBe(
      "First paragraph.\n\nSecond paragraph. Third sentence.",
    );
  });

  it("removes empty parentheses", () => {
    expect(cleanText("The sky () is blue.")).toBe("The sky is blue.");
  });

  it("keeps meaningful parentheses", () => {
    expect(cleanText("The sky (at noon) is blue.")).toBe("The sky (at noon) is blue.");
  });
});

describe("truncateToSentence", () => {
  it("keeps short text untouched", () => {
    expect(truncateToSentence("A short text.", 20)).toBe("A short text.");
  });

  it("truncates at the last sentence boundary before the limit", () => {
    const text = "First sentence here. Second sentence here. Third sentence here.";
    expect(truncateToSentence(text, 3)).toBe("First sentence here.");
  });

  it("hard-truncates when no sentence boundary exists within the limit", () => {
    const text = "one two three four five";
    const result = truncateToSentence(text, 3);
    expect(result).toBe("one two three\u2026");
    expect(result.split(" ").length).toBeLessThanOrEqual(4);
  });

  it("returns an empty string for empty input", () => {
    expect(truncateToSentence("", 10)).toBe("");
  });
});

describe("normalizeWikipediaContent", () => {
  it("produces a summary between 60 and 2100 words when input is long", () => {
    const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
    const result = normalizeWikipediaContent({
      title: "Example",
      extract: `Lead sentence. ${words}`,
      locale: "en",
    });
    const count = result.summary.split(" ").length;
    expect(count).toBeGreaterThanOrEqual(60);
    expect(count).toBeLessThanOrEqual(2100);
  });

  it("extracts a hook from the first sentence", () => {
    const result = normalizeWikipediaContent({
      title: "Example",
      extract: "The example is a thing. It does other things.",
      locale: "en",
    });
    expect(result.hook).toBe("The example is a thing.");
  });

  it("cleans citations from the summary", () => {
    const result = normalizeWikipediaContent({
      title: "Example",
      extract: "The example is a thing.[1] It does other things.[citation needed]",
      locale: "en",
    });
    expect(result.summary).not.toContain("[1]");
    expect(result.summary).not.toContain("[citation needed]");
  });

  it("preserves the title", () => {
    const result = normalizeWikipediaContent({ title: "Example", extract: "The example is a thing.", locale: "en" });
    expect(result.title).toBe("Example");
  });

  it("keeps normalized source paragraphs", () => {
    const result = normalizeWikipediaContent({
      title: "Example",
      extract: "The example is a thing.\n\nIt has a second paragraph.",
      locale: "en",
    });

    expect(result.summary).toBe("The example is a thing.\n\nIt has a second paragraph.");
  });
});

describe("createContentHash", () => {
  it("is stable for identical input", () => {
    const input = { title: "Example", summary: "The example is a thing." };
    expect(createContentHash(input)).toBe(createContentHash(input));
  });

  it("is stable across serialization differences", () => {
    const a = { title: "Example", summary: "The example is a thing." };
    const b = { summary: "The example is a thing.", title: "Example" };
    expect(createContentHash(a)).toBe(createContentHash(b));
  });

  it("changes when content changes", () => {
    expect(
      createContentHash({ title: "Example", summary: "The example is a thing." }),
    ).not.toBe(createContentHash({ title: "Example", summary: "The example is another thing." }));
  });

  it("produces a sha256 hex digest", () => {
    const hash = createContentHash({ title: "A", summary: "B" });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
