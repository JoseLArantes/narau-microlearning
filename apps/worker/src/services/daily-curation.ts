import {
  curateWikipediaText,
  decryptSecret,
  type CurateWikipediaTextInput,
  type CuratedWikipediaText,
  type LlmConnection,
} from "@narau/ai-curation";
import { prisma } from "@narau/database";

type CurationStatus = "NOT_REQUESTED" | "PENDING" | "CURATED" | "FAILED";

interface EnabledCurationSettings {
  enabled: true;
  connection: LlmConnection;
  readingMinutes: number;
}

interface DisabledCurationSettings {
  enabled: false;
}

interface DailySubjectForCuration {
  id: string;
  curationStatus: CurationStatus;
  subject: {
    title: string;
    canonicalUrl: string;
    summary: string;
    language: string;
    revisionId: string | null;
  };
}

interface StoredCuration {
  text: string;
  hook?: string;
  provider: "OPENAI" | "DEEPSEEK" | "GEMINI";
  model: string;
  promptVersion: string;
  sourceRevisionId: string | null;
}

export interface DailyCurationRepository {
  loadSettings(): Promise<EnabledCurationSettings | DisabledCurationSettings>;
  loadDailySubject(id: string): Promise<DailySubjectForCuration | null>;
  saveCurated(id: string, input: StoredCuration): Promise<void>;
  saveFailed(id: string, error: string): Promise<void>;
}

type Curator = (input: CurateWikipediaTextInput) => Promise<CuratedWikipediaText>;

function encryptionKey(): string {
  const key = process.env.LLM_SETTINGS_ENCRYPTION_KEY;
  if (!key) throw new Error("LLM_SETTINGS_ENCRYPTION_KEY is required when an API key is stored.");
  return key;
}

export const prismaDailyCurationRepository: DailyCurationRepository = {
  async loadSettings() {
    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    if (!settings.llmEnabled || !settings.llmModel || !settings.llmApiKeyEncrypted)
      return { enabled: false };
    return {
      enabled: true,
      readingMinutes: settings.defaultReadingMinutes,
      connection: {
        provider: settings.llmProvider,
        model: settings.llmModel,
        apiKey: decryptSecret(settings.llmApiKeyEncrypted, encryptionKey()),
      },
    };
  },

  loadDailySubject(id) {
    return prisma.dailyAreaSubject.findUnique({
      where: { id },
      select: {
        id: true,
        curationStatus: true,
        subject: {
          select: {
            title: true,
            canonicalUrl: true,
            summary: true,
            language: true,
            revisionId: true,
          },
        },
      },
    });
  },

  async saveCurated(id, input) {
    await prisma.dailyAreaSubject.update({
      where: { id },
      data: {
        curationStatus: "CURATED",
        curatedText: input.text,
        curatedHook: input.hook ?? null,
        curationProvider: input.provider,
        curationModel: input.model,
        curationPromptVersion: input.promptVersion,
        curationSourceRevisionId: input.sourceRevisionId,
        curatedAt: new Date(),
        curationError: null,
      },
    });
  },

  async saveFailed(id, error) {
    await prisma.dailyAreaSubject.update({
      where: { id },
      data: {
        curationStatus: "FAILED",
        curationError: error,
        curatedText: null,
        curatedHook: null,
        curationProvider: null,
        curationModel: null,
        curationPromptVersion: null,
        curationSourceRevisionId: null,
        curatedAt: null,
      },
    });
  },
};

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[\r\n]+/g, " ").slice(0, 1000);
}

export async function curateDailySubject(
  dailySubjectId: string,
  repository: DailyCurationRepository = prismaDailyCurationRepository,
  curate: Curator = curateWikipediaText,
): Promise<{ status: "CURATED" | "FAILED" | "SKIPPED" }> {
  const settings = await repository.loadSettings();
  if (!settings.enabled) return { status: "SKIPPED" };

  const daily = await repository.loadDailySubject(dailySubjectId);
  if (!daily || daily.curationStatus === "CURATED") return { status: "SKIPPED" };

  try {
    const curated = await curate({
      connection: settings.connection,
      source: {
        title: daily.subject.title,
        url: daily.subject.canonicalUrl,
        text: daily.subject.summary,
        language: daily.subject.language,
        readingMinutes: settings.readingMinutes,
      },
    });
    await repository.saveCurated(daily.id, {
      text: curated.text,
      ...(curated.hook ? { hook: curated.hook } : {}),
      provider: curated.provider,
      model: curated.model,
      promptVersion: curated.promptVersion,
      sourceRevisionId: daily.subject.revisionId,
    });
    return { status: "CURATED" };
  } catch (error) {
    await repository.saveFailed(daily.id, safeError(error));
    return { status: "FAILED" };
  }
}

export interface DailyCurationResult {
  found: number;
  curated: number;
  failed: number;
  skipped: number;
}

export async function curateDailySubjectsForDate(date: Date): Promise<DailyCurationResult> {
  const settings = await prismaDailyCurationRepository.loadSettings();
  if (!settings.enabled) return { found: 0, curated: 0, failed: 0, skipped: 0 };

  const publications = await prisma.dailyAreaSubject.findMany({
    where: { contentDate: date, status: "PUBLISHED", curationStatus: { not: "CURATED" } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const result: DailyCurationResult = {
    found: publications.length,
    curated: 0,
    failed: 0,
    skipped: 0,
  };
  for (const publication of publications) {
    const outcome = await curateDailySubject(publication.id, prismaDailyCurationRepository);
    if (outcome.status === "CURATED") result.curated += 1;
    else if (outcome.status === "FAILED") result.failed += 1;
    else result.skipped += 1;
  }
  return result;
}
