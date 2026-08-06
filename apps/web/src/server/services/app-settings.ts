import { prisma } from "@narau/database";
import {
  decryptSecret,
  encryptSecret,
  testLlmConnection,
  type LlmConnection,
} from "@narau/ai-curation";
import type { LlmSettingsInput } from "@narau/validation";

const DEFAULT_READING_MINUTES = 5;

export interface AppSettingsView {
  defaultReadingMinutes: number;
  llm: {
    enabled: boolean;
    provider: "OPENAI" | "DEEPSEEK" | "GEMINI";
    model: string;
    hasApiKey: boolean;
    apiKeyHint: string | null;
  };
}

export async function getAppSettings(): Promise<AppSettingsView> {
  const settings = await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return {
    defaultReadingMinutes: settings.defaultReadingMinutes,
    llm: {
      enabled: settings.llmEnabled,
      provider: settings.llmProvider,
      model: settings.llmModel ?? "",
      hasApiKey: Boolean(settings.llmApiKeyEncrypted),
      apiKeyHint: settings.llmApiKeyHint,
    },
  };
}

function settingsEncryptionKey(): string {
  const key = process.env.LLM_SETTINGS_ENCRYPTION_KEY;
  if (!key) throw new Error("LLM_SETTINGS_ENCRYPTION_KEY is not configured on the server.");
  return key;
}

function keyHint(apiKey: string): string {
  return `••••${apiKey.slice(-4)}`;
}

export async function saveLlmSettings(input: LlmSettingsInput): Promise<void> {
  const apiKey = input.apiKey?.trim();
  const current = await prisma.appSettings.findUnique({ where: { id: 1 } });
  const providerChanged = Boolean(current && current.llmProvider !== input.provider);
  if (input.enabled && !apiKey && (!current?.llmApiKeyEncrypted || providerChanged)) {
    throw new Error(
      `Enter an API key for ${input.provider.toLowerCase()} before enabling curation.`,
    );
  }
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {
      llmEnabled: input.enabled,
      llmProvider: input.provider,
      llmModel: input.model || null,
      ...(apiKey
        ? {
            llmApiKeyEncrypted: encryptSecret(apiKey, settingsEncryptionKey()),
            llmApiKeyHint: keyHint(apiKey),
          }
        : providerChanged
          ? { llmApiKeyEncrypted: null, llmApiKeyHint: null }
          : {}),
    },
    create: {
      id: 1,
      llmEnabled: input.enabled,
      llmProvider: input.provider,
      llmModel: input.model || null,
      ...(apiKey
        ? {
            llmApiKeyEncrypted: encryptSecret(apiKey, settingsEncryptionKey()),
            llmApiKeyHint: keyHint(apiKey),
          }
        : {}),
    },
  });
}

async function resolveConnection(input: LlmSettingsInput): Promise<LlmConnection> {
  const current = await prisma.appSettings.findUnique({ where: { id: 1 } });
  const suppliedKey = input.apiKey?.trim();
  const storedKey =
    current?.llmProvider === input.provider && current.llmApiKeyEncrypted
      ? decryptSecret(current.llmApiKeyEncrypted, settingsEncryptionKey())
      : undefined;
  const apiKey = suppliedKey || storedKey;
  if (!apiKey) {
    throw new Error(`Enter an API key for ${input.provider.toLowerCase()} before testing.`);
  }
  return {
    provider: input.provider,
    model: input.model,
    apiKey,
  };
}

export async function testConfiguredLlm(input: LlmSettingsInput): Promise<void> {
  await testLlmConnection(await resolveConnection(input));
}

export async function getDefaultReadingMinutes(): Promise<number> {
  const settings = await getAppSettings();
  return settings.defaultReadingMinutes || DEFAULT_READING_MINUTES;
}

export async function setDefaultReadingMinutes(minutes: number): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: { defaultReadingMinutes: minutes },
    create: { id: 1, defaultReadingMinutes: minutes },
  });
}
