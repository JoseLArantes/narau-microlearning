import { readingTimeWordBounds } from "@narau/ai-curation";

export { readingTimeWordBounds } from "@narau/ai-curation";

function countWords(text: string, locale: string): number {
  return Array.from(new Intl.Segmenter(locale, { granularity: "word" }).segment(text)).filter(
    (part) => part.isWordLike,
  ).length;
}

/**
 * A source is eligible when it contains sufficient content to read (at least 20 words).
 */
export function isCardLengthEligible(text: string, _minutes = 1, locale = "en"): boolean {
  return countWords(text, locale) >= 20;
}
