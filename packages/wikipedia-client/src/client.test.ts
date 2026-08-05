import { describe, expect, it, vi } from "vitest";
import { createWikipediaClient } from "./client";

describe("WikipediaClient Rate Limiting & Spacing", () => {
  it("uses the requested Wikipedia language project", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ query: { categorymembers: [{ pageid: 1, title: "Ciencia" }] } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock;

    try {
      const client = createWikipediaClient({
        userAgent: "TestBot/1.0",
        language: "es",
        requestDelayMs: 0,
      });

      await client.getCategoryMembers("Categoría:Ciencia", { maxMembers: 1 });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/es\.wikipedia\.org\/w\/api\.php/),
        expect.anything(),
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("does not deadlock category requests with the default concurrency", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          query: {
            categorymembers: [{ pageid: 1, title: "Test Page 1" }],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    try {
      const client = createWikipediaClient({
        userAgent: "TestBot/1.0",
        requestDelayMs: 0,
        timeoutMs: 1_000,
      });

      const members = await Promise.race([
        client.getPagesFromCategories(["Category:Science"], { maxMembers: 1 }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("category request deadlocked")), 500);
        }),
      ]);

      expect(members).toEqual([{ pageId: 1, title: "Test Page 1" }]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("does not deadlock page detail requests with the default concurrency", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          query: {
            pages: [{ pageid: 1, title: "Test Page 1", ns: 0, extract: "A sufficiently long page extract." }],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    try {
      const client = createWikipediaClient({
        userAgent: "TestBot/1.0",
        requestDelayMs: 0,
        timeoutMs: 1_000,
      });

      const details = await Promise.race([
        client.getPageDetails([1]),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("page detail request deadlocked")), 500);
        }),
      ]);

      expect(details.get(1)?.title).toBe("Test Page 1");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("honors Retry-After before retrying a rate-limited request", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429, headers: { "Retry-After": "1" } }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ title: "Test Page 1", extract: "A page extract." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    globalThis.fetch = fetchMock;

    try {
      const client = createWikipediaClient({
        userAgent: "TestBot/1.0",
        requestDelayMs: 0,
        retries: 1,
      });
      const startedAt = Date.now();

      await client.getPageSummary("Page 1");

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(900);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("spaces out consecutive HTTP requests by configured requestDelayMs", async () => {
    const timestamps: number[] = [];

    // Mock global fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      timestamps.push(Date.now());
      if (url.includes("action=query")) {
        return new Response(
          JSON.stringify({
            query: {
              categorymembers: [{ pageid: 1, title: "Test Page 1" }],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ title: "Test Page 1", extract: "Some summary text for testing." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    try {
      const delayMs = 100; // Fast 100ms delay for unit test speed
      const client = createWikipediaClient({
        userAgent: "TestBot/1.0",
        requestDelayMs: delayMs,
      });

      // Execute 3 requests
      await client.getPageSummary("Page 1");
      await client.getPageSummary("Page 2");
      await client.getPageSummary("Page 3");

      expect(timestamps.length).toBe(3);
      const t0 = timestamps[0] ?? 0;
      const t1 = timestamps[1] ?? 0;
      const t2 = timestamps[2] ?? 0;

      const diff1 = t1 - t0;
      const diff2 = t2 - t1;

      expect(diff1).toBeGreaterThanOrEqual(delayMs - 20); // Allow slight timer variance
      expect(diff2).toBeGreaterThanOrEqual(delayMs - 20);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
