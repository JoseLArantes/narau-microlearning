import { afterEach, describe, expect, it, vi } from "vitest";
import { previewWikipediaSource } from "./wikipedia-preview";

const config = {
  categories: ["Category:Technology", "Category:artificial intelligence", "Category:rag"],
  includeSubcategories: true,
  depth: 1,
  maxCandidates: 100,
  excludeCategories: [],
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("previewWikipediaSource", () => {
  it("rejects a source when the most specific category has no articles", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          query: {
            pages: [
              { title: "Category:Technology", categoryinfo: { pages: 43, subcats: 44 } },
              { title: "Category:artificial intelligence", categoryinfo: { pages: 264, subcats: 36 } },
              { title: "Category:rag", missing: true },
            ],
          },
        }),
      ),
    );

    await expect(previewWikipediaSource("en", config)).rejects.toThrow(
      "The most specific configured Wikipedia category must exist and contain articles",
    );
  });

  it("uses the most specific category for the article sample", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = new URL(String(input));
      if (url.searchParams.get("prop") === "categoryinfo") {
        return jsonResponse({
          query: {
            pages: [
              { title: "Category:Technology", categoryinfo: { pages: 43, subcats: 44 } },
              { title: "Category:artificial intelligence", categoryinfo: { pages: 264, subcats: 36 } },
              { title: "Category:rag", categoryinfo: { pages: 2, subcats: 0 } },
            ],
          },
        });
      }
      return jsonResponse({ query: { categorymembers: [{ pageid: 1, title: "Retrieval-augmented generation" }] } });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(previewWikipediaSource("en", config)).resolves.toMatchObject({
      sampleTitles: ["Retrieval-augmented generation"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("Category%3Arag");
  });
});
