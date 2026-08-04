export interface CandidateFeatures {
  title: string;
  summary: string;
  categories: string[];
}

export interface CandidateScoringInput extends CandidateFeatures {
  hasImage?: boolean;
}

const DEFINITIONAL_PATTERN =
  /^((the|a|an)\s+)?[^.!?]{0,80}\b(is|are|was|were|refers to|describes|means|denotes|designates)\b/i;

const LIST_OF_PATTERN = /^list of\b/i;

function isDefinitional(summary: string): boolean {
  return DEFINITIONAL_PATTERN.test(summary);
}

export function isDisambiguationLike(input: CandidateFeatures): boolean {
  return (
    /\(disambiguation\)/i.test(input.title) ||
    /\(disambiguation\)/i.test(input.summary) ||
    input.categories.some((category) => category.toLowerCase().includes("disambiguation"))
  );
}

export function isListLike(input: CandidateFeatures): boolean {
  return (
    LIST_OF_PATTERN.test(input.title) ||
    /\(list\)$/i.test(input.title) ||
    /^may refer to/i.test(input.summary) ||
    input.categories.some((category) => category.toLowerCase().includes(":lists"))
  );
}

export function isStubLike(summary: string): boolean {
  return summary.length < 200;
}

/**
 * Scores a Wikipedia candidate following the ingestion rules:
 * +40 for a 200-8000 char summary, +20 for an image, +10 for a definitional
 * first sentence, +10 for categories, -50 for disambiguation-like pages,
 * -50 for list-like pages, -30 for stub-like pages. Clamped to 0..100.
 */
export function scoreCandidate(input: CandidateScoringInput): number {
  let score = 0;
  const summaryLength = input.summary.length;

  if (summaryLength >= 200 && summaryLength <= 8000) score += 40;
  if (input.hasImage === true) score += 20;
  if (isDefinitional(input.summary)) score += 10;
  if (input.categories.length > 0) score += 10;
  if (isDisambiguationLike(input)) score -= 50;
  if (isListLike(input)) score -= 50;
  if (isStubLike(input.summary)) score -= 30;

  return Math.max(0, Math.min(100, score));
}
