const CITATION_MARKERS = /\[(?:citation needed|note \d+|\d+|[a-z]+\s?\d*)\]/gi;

const HTML_TAGS = /<[^>]+>/g;

const EMPTY_PARENTHESES = /\(\s*\)/g;

const WHITESPACE = /\s+/g;

export function cleanText(text: string): string {
  return text
    .replace(CITATION_MARKERS, "")
    .replace(HTML_TAGS, "")
    .replace(EMPTY_PARENTHESES, "")
    .replace(WHITESPACE, " ")
    .trim();
}
