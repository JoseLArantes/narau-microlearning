export function truncateToSentence(text: string, maxWords: number): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) return trimmed;
  const limited = words.slice(0, maxWords).join(" ");
  const boundary = limited.match(/.*[.!?](?=\s|$)/);
  if (boundary?.[0]) {
    return boundary[0].trim();
  }
  return `${limited}\u2026`;
}

export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return match?.[0]?.trim() ?? text.trim();
}
