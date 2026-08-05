const CITATION_MARKERS = /\[(?:citation needed|note \d+|\d+|[a-z]+\s?\d*)\]/gi;

const HTML_TAGS = /<[^>]+>/g;

const EMPTY_PARENTHESES = /\(\s*\)/g;

const BLOCK_END_TAGS = /<\/(?:p|div|li|h[1-6])\s*>/gi;

const LINE_BREAK_TAGS = /<\s*br\s*\/?>/gi;

export function cleanText(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .replace(BLOCK_END_TAGS, "\n\n")
    .replace(LINE_BREAK_TAGS, "\n")
    .replace(CITATION_MARKERS, "")
    .replace(HTML_TAGS, "")
    .replace(EMPTY_PARENTHESES, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return paragraphs.join("\n\n");
}
