import { createContentHash, normalizeWikipediaContent } from "@dailycurio/content-normalizer";
import { prisma } from "@dailycurio/database";
import { areaSourceConfigSchema } from "@dailycurio/validation";
import { createWikipediaClient, type WikipediaClient } from "@dailycurio/wikipedia-client";
import { env } from "../lib/env";
import { storeImage } from "../lib/storage";
import { isDisambiguationLike, isListLike, scoreCandidate } from "./candidate-scoring";

export interface IngestionResult {
  areas: number;
  candidatesCreated: number;
  errors: string[];
}

const MIN_SUMMARY_CHARS = 80;
const USED_WINDOW_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const WIKIPEDIA_LICENSE = "CC BY-SA 4.0";

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string; extension: string } | null> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": env.WIKIPEDIA_USER_AGENT } });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    return { buffer, contentType, extension };
  } catch {
    return null;
  }
}

/**
 * Generates candidate subjects for each active area on the given content
 * date. Idempotent: existing candidates for (area, subject, date) are left
 * untouched, and subjects are keyed by a stable content hash.
 */
export async function ingestAreaCandidates(date: Date, client: WikipediaClient = createWikipediaClient({ userAgent: env.WIKIPEDIA_USER_AGENT })): Promise<IngestionResult> {
  const result: IngestionResult = { areas: 0, candidatesCreated: 0, errors: [] };
  const since = new Date(date.getTime() - USED_WINDOW_DAYS * DAY_MS);
  const areas = await prisma.area.findMany({ where: { status: "ACTIVE" } });
  result.areas = areas.length;

  for (const area of areas) {
    try {
      const config = areaSourceConfigSchema.safeParse(area.sourceConfig);
      if (!config.success) {
        result.errors.push(`area ${area.slug}: invalid sourceConfig`);
        continue;
      }

      const members = await client.getPagesFromCategories(config.data.categories, {
        includeSubcategories: config.data.includeSubcategories,
        depth: config.data.depth,
        maxMembers: config.data.maxCandidates,
      });
      const details = await client.getPageDetails(members.map((member) => member.pageId));

      const usedSubjectIds = new Set(
        (
          await prisma.areaSubjectCandidate.findMany({
            where: { areaId: area.id, generatedForDate: { gte: since } },
            select: { subjectId: true },
          })
        ).map((candidate) => candidate.subjectId),
      );
      const unsafeCategories = new Set(config.data.excludeCategories.map((category) => category.toLowerCase()));

      for (const member of members) {
        const page = details.get(member.pageId);
        if (!page) continue;
        if (page.namespace !== 0) continue;
        if (!page.extract || page.extract.length < MIN_SUMMARY_CHARS) continue;

        const features = { title: page.title, summary: page.extract, categories: page.categories };
        if (isDisambiguationLike(features) || isListLike(features)) continue;
        if (page.categories.some((category) => unsafeCategories.has(category.toLowerCase()))) continue;

        const normalized = normalizeWikipediaContent({
          title: page.title,
          extract: page.extract,
          imageUrl: page.thumbnailUrl,
        });
        const contentHash = createContentHash({ title: normalized.title, summary: normalized.summary });
        const existingSubject = await prisma.subject.findUnique({ where: { contentHash } });
        if (existingSubject && usedSubjectIds.has(existingSubject.id)) continue;

        let imageUrl = page.thumbnailUrl;
        const score = scoreCandidate({ ...features, hasImage: Boolean(imageUrl) });
        const subject = await prisma.subject.upsert({
          where: { contentHash },
          update: {
            summary: normalized.summary,
            hook: normalized.hook,
            imageUrl,
            revisionId: page.lastRevisionId,
            qualityScore: score,
          },
          create: {
            source: "WIKIPEDIA",
            sourcePageId: String(page.pageId),
            title: normalized.title,
            canonicalUrl: `https://en.wikipedia.org/wiki/${page.title.replace(/ /g, "_")}`,
            summary: normalized.summary,
            hook: normalized.hook,
            imageUrl,
            contentHash,
            revisionId: page.lastRevisionId,
            license: WIKIPEDIA_LICENSE,
            qualityScore: score,
            raw: { categories: page.categories },
          },
        });

        if (page.thumbnailUrl && env.STORAGE_ENABLED === "true") {
          const image = await downloadImage(page.thumbnailUrl);
          if (image) {
            const stored = await storeImage(subject.id, image.buffer, image.contentType, image.extension);
            if (stored && stored.url !== imageUrl) {
              imageUrl = stored.url;
              await prisma.subject.update({ where: { id: subject.id }, data: { imageUrl: stored.url } });
            }
          }
        }

        const candidate = await prisma.areaSubjectCandidate.upsert({
          where: {
            areaId_subjectId_generatedForDate: {
              areaId: area.id,
              subjectId: subject.id,
              generatedForDate: date,
            },
          },
          update: { candidateScore: score },
          create: {
            areaId: area.id,
            subjectId: subject.id,
            generatedForDate: date,
            candidateScore: score,
          },
        });
        if (candidate.status === "CANDIDATE") {
          result.candidatesCreated += 1;
        }
      }
    } catch (error) {
      result.errors.push(
        `area ${area.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return result;
}
