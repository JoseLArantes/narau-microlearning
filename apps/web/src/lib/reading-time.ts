export const WORDS_PER_MINUTE = 200;
export const READING_MINUTE_OPTIONS = [3, 5, 10] as const;
export const MAX_READING_MINUTES = 10;

export interface FittedContent {
  text: string;
  minutes: number;
}

export function fitToReadingTime(summary: string, minutes: number): FittedContent {
  const words = summary.trim().split(/\s+/).filter(Boolean);
  const targetWords = Math.max(1, Math.round(minutes)) * WORDS_PER_MINUTE;

  if (words.length <= targetWords) {
    const actual = Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
    return { text: summary, minutes: Math.min(actual, MAX_READING_MINUTES) };
  }

  const trimmed = words.slice(0, targetWords).join(" ");
  const lastEnd = Math.max(
    trimmed.lastIndexOf(". "),
    trimmed.lastIndexOf("! "),
    trimmed.lastIndexOf("? "),
  );
  const text = lastEnd > 0 ? trimmed.slice(0, lastEnd + 1) : `${trimmed}…`;
  return { text, minutes };
}
