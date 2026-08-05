function segmentWords(text: string, locale: string): Array<{ index: number; segment: string }> {
  return Array.from(new Intl.Segmenter(locale, { granularity: "word" }).segment(text))
    .filter((part) => part.isWordLike)
    .map((part) => ({ index: part.index, segment: part.segment }));
}

export function truncateToSentence(text: string, maxWords: number, locale = "en"): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const words = segmentWords(trimmed, locale);
  if (words.length <= maxWords) return trimmed;

  const wordLimit = words[maxWords - 1];
  if (!wordLimit) return trimmed;
  const limitedEnd = wordLimit.index + wordLimit.segment.length;
  const limited = trimmed.slice(0, limitedEnd);
  const sentences = Array.from(new Intl.Segmenter(locale, { granularity: "sentence" }).segment(trimmed));
  const completeSentence = sentences
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
    .at(-1);

  if (completeSentence) {
    return trimmed.slice(0, completeSentence.end).trim();
  }

  return `${limited.trim()}\u2026`;
}

export function firstSentence(text: string, locale = "en"): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const first = Array.from(new Intl.Segmenter(locale, { granularity: "sentence" }).segment(trimmed))[0];
  return first?.segment.trim() ?? trimmed;
}
