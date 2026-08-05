import { cleanText } from "./clean";
import { createContentHash } from "./hash";
import { firstSentence, truncateToSentence } from "./normalize";

export const SUMMARY_MIN_WORDS = 60;
export const SUMMARY_MAX_WORDS = 2100;

export interface NormalizeInput {
  title: string;
  extract: string;
  locale: string;
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
    summary = truncateToSentence(cleaned, SUMMARY_MAX_WORDS, input.locale);
  }

  return {
    title: input.title.trim(),
    hook: firstSentence(cleaned, input.locale),
    summary,
    imageUrl: input.imageUrl,
    wordCount: summary.split(/\s+/).filter(Boolean).length,
  };
}

export { cleanText, truncateToSentence, firstSentence, createContentHash };
