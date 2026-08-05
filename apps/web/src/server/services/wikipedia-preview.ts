import type { AreaSourceConfig } from "@narau/validation";

function wikipediaLanguageCode(languageTag: string): string {
  const code = languageTag.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  if (!/^[a-z]{2,3}$/.test(code)) throw new Error(`Invalid tenant language for Wikipedia: ${languageTag}`);
  return code;
}

function encodeTitle(title: string): string {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

function userAgent(): string {
  return process.env.WIKIPEDIA_USER_AGENT ?? "NarauBot/0.1 (https://localhost:3030; contact@example.com)";
}

async function fetchWikipedia(language: string, params: Record<string, string>): Promise<any> {
  const query = new URLSearchParams({ ...params, format: "json", formatversion: "2" });
  const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${query.toString()}`, {
    headers: { "User-Agent": userAgent(), Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Wikipedia preview returned HTTP ${response.status}.`);
  return response.json();
}

export interface WikipediaSourcePreview {
  language: string;
  categories: Array<{ title: string; exists: boolean; pageCount: number; subcategoryCount: number }>;
  sampleTitles: string[];
}

export async function previewWikipediaSource(languageTag: string, config: AreaSourceConfig): Promise<WikipediaSourcePreview> {
  const language = wikipediaLanguageCode(languageTag);
  const categoryData = await fetchWikipedia(language, {
    action: "query",
    prop: "categoryinfo",
    titles: config.categories.join("|"),
  });
  const pages = Array.isArray(categoryData?.query?.pages) ? categoryData.query.pages : [];
  const categories = config.categories.map((requested) => {
    const page = pages.find((candidate: { title?: string }) => candidate.title === requested) ?? pages.find((candidate: { title?: string }) => candidate.title?.toLowerCase() === requested.toLowerCase());
    return {
      title: page?.title ?? requested,
      exists: Boolean(page && !page.missing),
      pageCount: page?.categoryinfo?.pages ?? 0,
      subcategoryCount: page?.categoryinfo?.subcats ?? 0,
    };
  });
  const usableCategories = categories.filter((category) => category.exists && category.pageCount > 0);
  if (usableCategories.length === 0) {
    throw new Error("At least one configured Wikipedia category must exist and contain articles before activation.");
  }

  const members = new Map<string, string>();
  for (const category of usableCategories) {
    const data = await fetchWikipedia(language, {
      action: "query",
      list: "categorymembers",
      cmtitle: category.title,
      cmnamespace: "0",
      cmlimit: "5",
    });
    for (const member of data?.query?.categorymembers ?? []) {
      if (typeof member.title === "string") members.set(String(member.pageid), member.title);
    }
    if (members.size >= 5) break;
  }
  return { language, categories, sampleTitles: [...members.values()].slice(0, 5) };
}

export { encodeTitle };
