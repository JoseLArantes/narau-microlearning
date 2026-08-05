export const WORDS_PER_MINUTE = 200;
export const READING_MINUTE_OPTIONS = [3, 5, 10] as const;
export const MAX_READING_MINUTES = 10;

export interface FittedContent {
  text: string;
  minutes: number;
}

export interface PreparedReadingContent {
  standfirst?: string;
  paragraphs: string[];
}

type Segment = { index: number; segment: string; isWordLike?: boolean };

const STANDFIRST_MAX_WORDS = 32;
const STANDFIRST_MAX_CHARACTERS = 220;
const PARAGRAPH_TARGET_WORDS = 90;
const PARAGRAPH_MAX_WORDS = 140;

function wordSegments(text: string, locale: string): Segment[] {
  return Array.from(new Intl.Segmenter(locale, { granularity: "word" }).segment(text))
    .filter((part) => part.isWordLike)
    .map((part) => ({ index: part.index, segment: part.segment, isWordLike: part.isWordLike }));
}

function sentenceSegments(text: string, locale: string): Segment[] {
  return Array.from(new Intl.Segmenter(locale, { granularity: "sentence" }).segment(text)).map((part) => ({
    index: part.index,
    segment: part.segment,
  }));
}

function wordCount(text: string, locale: string): number {
  return wordSegments(text, locale).length;
}

function groupParagraph(paragraph: string, locale: string): string[] {
  const trimmed = paragraph.trim();
  if (!trimmed) return [];
  if (wordCount(trimmed, locale) <= PARAGRAPH_MAX_WORDS) return [trimmed];

  const sentences = sentenceSegments(trimmed, locale).map((part) => part.segment.trim()).filter(Boolean);
  if (sentences.length <= 1) return [trimmed];

  const groups: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = wordCount(sentence, locale);
    const shouldBreak =
      current.length > 0 &&
      (currentWords >= PARAGRAPH_TARGET_WORDS || currentWords + sentenceWords > PARAGRAPH_MAX_WORDS);

    if (shouldBreak) {
      groups.push(current.join(" "));
      current = [];
      currentWords = 0;
    }

    current.push(sentence);
    currentWords += sentenceWords;
  }

  if (current.length > 0) groups.push(current.join(" "));
  return groups;
}

function splitIntoParagraphs(text: string, locale: string): string[] {
  return text
    .split(/\n{2,}/)
    .flatMap((paragraph) => groupParagraph(paragraph, locale))
    .filter(Boolean);
}

function canUseStandfirst(text: string, hook: string | undefined, locale: string): hook is string {
  if (!hook) return false;
  const candidate = hook.trim();
  if (!candidate || candidate.length > STANDFIRST_MAX_CHARACTERS) return false;
  if (wordCount(candidate, locale) > STANDFIRST_MAX_WORDS) return false;
  return text === candidate || text.startsWith(`${candidate} `) || text.startsWith(`${candidate}\n`);
}

export function prepareReadingContent(
  text: string,
  hook: string | undefined,
  locale: string,
): PreparedReadingContent {
  const trimmed = text.trim();
  if (!trimmed) return { paragraphs: [] };

  let body = trimmed;
  let standfirst: string | undefined;
  if (canUseStandfirst(trimmed, hook?.trim(), locale)) {
    standfirst = hook.trim();
    body = trimmed.slice(standfirst.length).trim();
  }

  return {
    ...(standfirst ? { standfirst } : {}),
    paragraphs: splitIntoParagraphs(body, locale),
  };
}

export function fitToReadingTime(summary: string, minutes: number, locale: string): FittedContent {
  const trimmed = summary.trim();
  const words = wordSegments(trimmed, locale);
  const targetWords = Math.max(1, Math.round(minutes)) * WORDS_PER_MINUTE;

  if (words.length <= targetWords) {
    const actual = Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
    return { text: trimmed, minutes: Math.min(actual, MAX_READING_MINUTES) };
  }

  const wordLimit = words[targetWords - 1];
  const limitedEnd = (wordLimit?.index ?? trimmed.length) + (wordLimit?.segment.length ?? 0);
  const sentenceEnd = sentenceSegments(trimmed, locale)
    .map((part) => ({
      end: part.index + part.segment.length,
      text: part.segment.trim(),
      punctuationAfterLimit: trimmed.slice(limitedEnd, part.index + part.segment.length),
    }))
    .filter(
      (part) =>
        (part.end <= limitedEnd || /^[\s]*[.!?](?:["'”’)\]]*)\s*$/.test(part.punctuationAfterLimit)) &&
          /[.!?]$/.test(part.text),
    )
    .at(-1)?.end;
  const text = trimmed.slice(0, sentenceEnd ?? limitedEnd).trimEnd() + (sentenceEnd ? "" : "…");
  return { text, minutes };
}
