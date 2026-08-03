import pLimit from "p-limit";
import pRetry from "p-retry";
import { z } from "zod";
import type { CategoryMember, CategoryOptions, PageDetails, PageSummary, WikipediaClient, WikipediaClientOptions } from "./types";
import { chunk, encodeTitle, toCanonicalUrl } from "./utils";

const categoryMembersResponseSchema = z.object({
  query: z
    .object({
      categorymembers: z.array(
        z.object({
          pageid: z.number(),
          title: z.string(),
        }),
      ),
    })
    .optional(),
  continue: z.object({ cmcontinue: z.string() }).optional(),
});

const pageQueryResponseSchema = z.object({
  query: z
    .object({
      pages: z
        .array(
          z.object({
            pageid: z.number(),
            title: z.string(),
            ns: z.number(),
            extract: z.string().optional(),
            thumbnail: z
              .object({
                source: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
              .optional(),
            pageimage: z.string().optional(),
            categories: z.array(z.object({ title: z.string() })).optional(),
            revisions: z.array(z.object({ revid: z.number() })).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

const pageSummaryResponseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  extract: z.string().optional(),
  thumbnail: z.object({ source: z.string() }).optional(),
  originalimage: z.object({ source: z.string() }).optional(),
  content_urls: z
    .object({ desktop: z.object({ page: z.string() }).optional() })
    .optional(),
});

const DEFAULT_ENDPOINT = "https://en.wikipedia.org";
const MEMBER_BATCH_SIZE = 500;
const PAGE_BATCH_SIZE = 50;

export function createWikipediaClient(options: WikipediaClientOptions): WikipediaClient {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const concurrency = options.concurrency ?? 4;
  const retries = options.retries ?? 3;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const limit = pLimit(concurrency);
  const headers = { "User-Agent": options.userAgent, Accept: "application/json" };

  async function fetchJson(url: string): Promise<unknown> {
    return pRetry(
      async () => {
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
        if (!response.ok) {
          throw new Error(`Wikipedia API responded with ${response.status} for ${url}`);
        }
        return (await response.json()) as unknown;
      },
      { retries, minTimeout: 500, maxTimeout: 5000 },
    );
  }

  async function fetchCategoryMembersRecursive(
    categoryTitle: string,
    options: CategoryOptions,
    seen: Map<number, CategoryMember>,
  ): Promise<void> {
    const maxMembers = options.maxMembers ?? 500;
    const depth = options.depth ?? 0;

    let cmcontinue: string | undefined;
    do {
      const url =
        `${endpoint}/w/api.php?action=query&list=categorymembers&cmtitle=${encodeTitle(categoryTitle)}` +
        `&cmnamespace=0&cmlimit=${MEMBER_BATCH_SIZE}&format=json&formatversion=2` +
        (cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : "");
      const parsed = categoryMembersResponseSchema.safeParse(await fetchJson(url));
      if (!parsed.success) break;
      for (const member of parsed.data.query?.categorymembers ?? []) {
        if (seen.size >= maxMembers) return;
        if (!seen.has(member.pageid)) {
          seen.set(member.pageid, { pageId: member.pageid, title: member.title });
        }
      }
      cmcontinue = parsed.data.continue?.cmcontinue;
    } while (cmcontinue && seen.size < maxMembers);

    if (options.includeSubcategories && depth > 0 && seen.size < maxMembers) {
      const subcategories = await fetchSubcategories(categoryTitle);
      for (const sub of subcategories) {
        if (seen.size >= maxMembers) return;
        await fetchCategoryMembersRecursive(sub, { ...options, depth: depth - 1 }, seen);
      }
    }
  }

  async function fetchSubcategories(categoryTitle: string): Promise<string[]> {
    const url =
      `${endpoint}/w/api.php?action=query&list=categorymembers&cmtitle=${encodeTitle(categoryTitle)}` +
      `&cmnamespace=14&cmlimit=${MEMBER_BATCH_SIZE}&format=json&formatversion=2`;
    const parsed = categoryMembersResponseSchema.safeParse(await fetchJson(url));
    if (!parsed.success) return [];
    return (parsed.data.query?.categorymembers ?? []).map((member) => member.title);
  }

  async function getCategoryMembers(categoryTitle: string, options: CategoryOptions = {}): Promise<CategoryMember[]> {
    const seen = new Map<number, CategoryMember>();
    await fetchCategoryMembersRecursive(categoryTitle, options, seen);
    return [...seen.values()];
  }

  async function getPagesFromCategories(categories: string[], options: CategoryOptions = {}): Promise<CategoryMember[]> {
    const results = await Promise.all(
      categories.map((category) => limit(() => getCategoryMembers(category, options))),
    );
    const seen = new Map<number, CategoryMember>();
    for (const members of results) {
      for (const member of members) {
        if (!seen.has(member.pageId)) seen.set(member.pageId, member);
      }
    }
    return [...seen.values()];
  }

  async function getPageDetails(pageIds: number[]): Promise<Map<number, PageDetails>> {
    const details = new Map<number, PageDetails>();
    const uniqueIds = [...new Set(pageIds)];
    const batches = chunk(uniqueIds, PAGE_BATCH_SIZE);
    await Promise.all(
      batches.map((batch) =>
        limit(async () => {
          const url =
            `${endpoint}/w/api.php?action=query&prop=extracts|pageimages|info|revisions|categories` +
            `&pageids=${batch.join("|")}&explaintext=1&exintro=1&exlimit=max&cllimit=max&rvprop=ids` +
            `&format=json&formatversion=2&redirects=1`;
          const parsed = pageQueryResponseSchema.safeParse(await fetchJson(url));
          if (!parsed.success) return;
          for (const page of parsed.data.query?.pages ?? []) {
            details.set(page.pageid, {
              pageId: page.pageid,
              title: page.title,
              namespace: page.ns,
              extract: page.extract ?? "",
              thumbnailUrl: page.thumbnail?.source,
              pageImage: page.pageimage,
              categories: (page.categories ?? []).map((category) => category.title),
              lastRevisionId: page.revisions?.[0]?.revid?.toString(),
            });
          }
        }),
      ),
    );
    return details;
  }

  async function getPageSummary(title: string): Promise<PageSummary | null> {
    const url = `${endpoint}/api/rest_v1/page/summary/${encodeTitle(title)}`;
    const raw = await fetchJson(url);
    const parsed = pageSummaryResponseSchema.safeParse(raw);
    if (!parsed.success) return null;
    return {
      title: parsed.data.title,
      description: parsed.data.description,
      extract: parsed.data.extract,
      thumbnailUrl: parsed.data.thumbnail?.source,
      originalImageUrl: parsed.data.originalimage?.source,
      pageUrl: parsed.data.content_urls?.desktop?.page ?? toCanonicalUrl(parsed.data.title, endpoint),
    };
  }

  return { getCategoryMembers, getPagesFromCategories, getPageDetails, getPageSummary };
}
