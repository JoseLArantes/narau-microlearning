import { describe, expect, it, vi } from "vitest";
import { createWikipediaClient } from "./client";

describe("WikipediaClient Rate Limiting & Spacing", () => {
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
