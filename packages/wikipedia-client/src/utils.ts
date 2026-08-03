export function encodeTitle(title: string): string {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

export function toCanonicalUrl(title: string, endpoint = "https://en.wikipedia.org"): string {
  return `${endpoint}/wiki/${encodeTitle(title)}`;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
