import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  settingsFindUnique: vi.fn(),
  settingsUpsert: vi.fn(),
  encryptSecret: vi.fn(),
  decryptSecret: vi.fn(),
  testLlmConnection: vi.fn(),
}));

vi.mock("@narau/database", () => ({
  prisma: {
    appSettings: {
      findUnique: mocks.settingsFindUnique,
      upsert: mocks.settingsUpsert,
    },
  },
}));

vi.mock("@narau/ai-curation", () => ({
  encryptSecret: mocks.encryptSecret,
  decryptSecret: mocks.decryptSecret,
  testLlmConnection: mocks.testLlmConnection,
}));

import { saveLlmSettings, testConfiguredLlm } from "./app-settings";

describe("application LLM settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LLM_SETTINGS_ENCRYPTION_KEY = "test-encryption-key";
    mocks.settingsUpsert.mockResolvedValue({});
    mocks.encryptSecret.mockReturnValue("encrypted-value");
    mocks.decryptSecret.mockReturnValue("stored-secret");
    mocks.testLlmConnection.mockResolvedValue(undefined);
  });

  it("requires a key before enabling an unconfigured provider", async () => {
    mocks.settingsFindUnique.mockResolvedValue(null);

    await expect(
      saveLlmSettings({ enabled: true, provider: "OPENAI", model: "gpt-test", apiKey: "" }),
    ).rejects.toThrow("Enter an API key for openai");
    expect(mocks.settingsUpsert).not.toHaveBeenCalled();
  });

  it("preserves the stored key when saving the same provider without a new key", async () => {
    mocks.settingsFindUnique.mockResolvedValue({
      llmProvider: "OPENAI",
      llmApiKeyEncrypted: "existing-encrypted",
    });

    await saveLlmSettings({ enabled: true, provider: "OPENAI", model: "gpt-test", apiKey: "" });

    expect(mocks.settingsUpsert).toHaveBeenCalledWith({
      where: { id: 1 },
      update: { llmEnabled: true, llmProvider: "OPENAI", llmModel: "gpt-test" },
      create: { id: 1, llmEnabled: true, llmProvider: "OPENAI", llmModel: "gpt-test" },
    });
  });

  it("clears an incompatible stored key when a disabled configuration changes provider", async () => {
    mocks.settingsFindUnique.mockResolvedValue({
      llmProvider: "OPENAI",
      llmApiKeyEncrypted: "existing-encrypted",
    });

    await saveLlmSettings({ enabled: false, provider: "GEMINI", model: "gemini-test", apiKey: "" });

    expect(mocks.settingsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ llmApiKeyEncrypted: null, llmApiKeyHint: null }),
      }),
    );
  });

  it("encrypts a supplied key and stores only its final four characters as a hint", async () => {
    mocks.settingsFindUnique.mockResolvedValue(null);

    await saveLlmSettings({
      enabled: true,
      provider: "DEEPSEEK",
      model: "deepseek-test",
      apiKey: "  secret-1234  ",
    });

    expect(mocks.encryptSecret).toHaveBeenCalledWith("secret-1234", "test-encryption-key");
    expect(mocks.settingsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          llmApiKeyEncrypted: "encrypted-value",
          llmApiKeyHint: "••••1234",
        }),
      }),
    );
  });

  it("tests a matching provider with its decrypted stored key", async () => {
    mocks.settingsFindUnique.mockResolvedValue({
      llmProvider: "OPENAI",
      llmApiKeyEncrypted: "existing-encrypted",
    });

    await testConfiguredLlm({ enabled: true, provider: "OPENAI", model: "gpt-test", apiKey: "" });

    expect(mocks.decryptSecret).toHaveBeenCalledWith("existing-encrypted", "test-encryption-key");
    expect(mocks.testLlmConnection).toHaveBeenCalledWith({
      provider: "OPENAI",
      model: "gpt-test",
      apiKey: "stored-secret",
    });
  });
});
