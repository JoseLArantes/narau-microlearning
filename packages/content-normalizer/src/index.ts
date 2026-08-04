import { cleanText } from "./clean";
import { createContentHash } from "./hash";
import { firstSentence, truncateToSentence } from "./normalize";

export const SUMMARY_MIN_WORDS = 60;
export const SUMMARY_MAX_WORDS = 2100;

export interface NormalizeInput {
  title: string;
  extract: string;
  imageUrl?: string;
}

export interface NormalizedContent {
  title: string;
  hook: string;
  summary: string;
  imageUrl?: string;
  wordCount: number;
}

export function normalizeWikipediaContent(input: NormalizeInput): NormalizedContent {
  const cleaned = cleanText(input.extract);
  const words = cleaned.split(/\s+/).filter(Boolean);

  let summary: string;
  if (words.length <= SUMMARY_MAX_WORDS) {
    summary = cleaned;
  } else {
    const atBoundary = truncateToSentence(cleaned, SUMMARY_MAX_WORDS);
    if (atBoundary.split(/\s+/).filter(Boolean).length >= SUMMARY_MIN_WORDS) {
      summary = atBoundary;
    } else {
      summary = `${words.slice(0, SUMMARY_MAX_WORDS).join(" ")}\u2026`;
    }
  }

  return {
    title: input.title.trim(),
    hook: firstSentence(cleaned),
    summary,
    imageUrl: input.imageUrl,
    wordCount: summary.split(/\s+/).filter(Boolean).length,
  };
}

export { cleanText, truncateToSentence, firstSentence, createContentHash };
