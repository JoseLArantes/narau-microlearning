import { describe, expect, it, vi } from "vitest";
import { curateDailySubject, type DailyCurationRepository } from "./daily-curation";

function createRepository(
  overrides: Partial<DailyCurationRepository> = {},
): DailyCurationRepository {
  return {
    loadSettings: vi.fn().mockResolvedValue({
      enabled: true,
      connection: {
        provider: "OPENAI",
        model: "editor-model",
        apiKey: "secret",
      },
      readingMinutes: 5,
    }),
    loadDailySubject: vi.fn().mockResolvedValue({
      id: "daily-1",
      curationStatus: "PENDING",
      subject: {
        title: "Apollo 11",
        canonicalUrl: "https://en.wikipedia.org/wiki/Apollo_11",
        summary: "Apollo 11 was the first mission to land humans on the Moon in 1969. ".repeat(15),
        language: "en",
        revisionId: "123",
      },
    }),
    saveCurated: vi.fn().mockResolvedValue(undefined),
    saveFailed: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("daily publication AI curation", () => {
  it("stores one shared curated derivative with provenance", async () => {
    const repository = createRepository();
    const curate = vi.fn().mockResolvedValue({
      text: "Curated source-bound text.",
      hook: "Curated source-bound text.",
      provider: "OPENAI",
      model: "editor-model",
      promptVersion: "narau-wikipedia-curator-v1",
      wordCount: 4,
    });

    await expect(curateDailySubject("daily-1", repository, curate)).resolves.toEqual({
      status: "CURATED",
    });
    expect(curate).toHaveBeenCalledWith(
      expect.objectContaining({
        source: expect.objectContaining({
          url: "https://en.wikipedia.org/wiki/Apollo_11",
          readingMinutes: 5,
        }),
      }),
    );
    expect(repository.saveCurated).toHaveBeenCalledWith(
      "daily-1",
      expect.objectContaining({
        provider: "OPENAI",
        model: "editor-model",
        sourceRevisionId: "123",
      }),
    );
  });

  it("does nothing when AI is disabled", async () => {
    const repository = createRepository({
      loadSettings: vi.fn().mockResolvedValue({ enabled: false }),
    });
    const curate = vi.fn();

    await expect(curateDailySubject("daily-1", repository, curate)).resolves.toEqual({
      status: "SKIPPED",
    });
    expect(curate).not.toHaveBeenCalled();
    expect(repository.saveFailed).not.toHaveBeenCalled();
  });

  it("records failure and preserves the original publication", async () => {
    const repository = createRepository();
    const curate = vi.fn().mockRejectedValue(new Error("LLM returned an unsupported claim"));

    await expect(curateDailySubject("daily-1", repository, curate)).resolves.toEqual({
      status: "FAILED",
    });
    expect(repository.saveFailed).toHaveBeenCalledWith(
      "daily-1",
      "LLM returned an unsupported claim",
    );
  });
});
