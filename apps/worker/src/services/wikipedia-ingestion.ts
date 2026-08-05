import { createContentHash, normalizeWikipediaContent } from "@narau/content-normalizer";
import { prisma } from "@narau/database";
import { areaSourceConfigSchema } from "@narau/validation";
import { createWikipediaClient, type WikipediaClient } from "@narau/wikipedia-client";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { storeImage } from "../lib/storage";
import { isDisambiguationLike, isListLike, scoreCandidate } from "./candidate-scoring";
import { wikipediaLanguageCode } from "./language";

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
export async function ingestAreaCandidates(
  date: Date,
  clientFactory?: (language: string) => WikipediaClient,
): Promise<IngestionResult> {
  const result: IngestionResult = { areas: 0, candidatesCreated: 0, errors: [] };
  const since = new Date(date.getTime() - USED_WINDOW_DAYS * DAY_MS);
  const areas = await prisma.area.findMany({
    where: {
      status: "ACTIVE",
      tenant: { status: "ACTIVE" },
      OR: [
        { level: "AREA" },
        { level: "TOPIC", parent: { status: "ACTIVE", level: "AREA" } },
        {
          level: "SPECIALTY",
          parent: {
            status: "ACTIVE",
            level: "TOPIC",
            parent: { status: "ACTIVE", level: "AREA" },
          },
        },
      ],
    },
    include: { tenant: true },
    orderBy: [{ tenant: { slug: "asc" } }, { displayOrder: "asc" }, { slug: "asc" }],
  });
  result.areas = areas.length;

  for (const [areaIndex, area] of areas.entries()) {
    const candidatesBeforeArea = result.candidatesCreated;

    try {
      const tenantLanguage = area.tenant.language;
      const wikipediaLanguage = wikipediaLanguageCode(tenantLanguage);
      logger.info("ingestion area started", {
        area: area.slug,
        tenant: area.tenant.slug,
        language: tenantLanguage,
        wikipediaLanguage,
        position: areaIndex + 1,
        totalAreas: areas.length,
      });

      const config = areaSourceConfigSchema.safeParse(area.sourceConfig);
      if (!config.success) {
        result.errors.push(`area ${area.slug}: invalid sourceConfig`);
        continue;
      }

      const areaClient = clientFactory
        ? clientFactory(wikipediaLanguage)
        : createWikipediaClient({
            userAgent: env.WIKIPEDIA_USER_AGENT,
            language: wikipediaLanguage,
            requestDelayMs: env.WIKIPEDIA_REQUEST_DELAY_MS,
          });

      const members = await areaClient.getPagesFromCategories(config.data.categories, {
        includeSubcategories: config.data.includeSubcategories,
        depth: config.data.depth,
        maxMembers: config.data.maxCandidates,
      });
      logger.info("ingestion area members fetched", {
        area: area.slug,
        tenant: area.tenant.slug,
        members: members.length,
      });
      const details = await areaClient.getPageDetails(members.map((member) => member.pageId));
      logger.info("ingestion area details fetched", {
        area: area.slug,
        tenant: area.tenant.slug,
        details: details.size,
      });

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
          locale: tenantLanguage,
          imageUrl: page.thumbnailUrl,
        });
        const contentHash = createContentHash({ title: normalized.title, summary: normalized.summary });
        const canonicalUrl = `https://${wikipediaLanguage}.wikipedia.org/wiki/${page.title.replace(/ /g, "_")}`;

        let imageUrl = page.thumbnailUrl;
        const score = scoreCandidate({ ...features, hasImage: Boolean(imageUrl) });
        const subject = await prisma.subject.upsert({
          where: { canonicalUrl_tenantId: { canonicalUrl, tenantId: area.tenantId } },
          update: {
            language: tenantLanguage,
            summary: normalized.summary,
            hook: normalized.hook,
            imageUrl,
            revisionId: page.lastRevisionId,
            qualityScore: score,
            contentHash,
          },
          create: {
            tenantId: area.tenantId,
            language: tenantLanguage,
            source: "WIKIPEDIA",
            sourcePageId: String(page.pageId),
            title: normalized.title,
            canonicalUrl,
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

        if (usedSubjectIds.has(subject.id)) continue;

        const candidate = await prisma.areaSubjectCandidate.upsert({
          where: {
            areaId_subjectId_generatedForDate_tenantId: {
              areaId: area.id,
              subjectId: subject.id,
              generatedForDate: date,
              tenantId: area.tenantId,
            },
          },
          update: { candidateScore: score },
          create: {
            tenantId: area.tenantId,
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

      logger.info("ingestion area finished", {
        area: area.slug,
        tenant: area.tenant.slug,
        candidatesCreated: result.candidatesCreated - candidatesBeforeArea,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(
        `area ${area.slug}: ${message}`,
      );
      logger.error("ingestion area failed", { area: area.slug, tenant: area.tenant.slug, error: message });
    }
  }

  return result;
}
