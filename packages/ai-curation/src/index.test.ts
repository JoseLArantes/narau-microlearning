import { describe, expect, it, vi } from "vitest";
import {
  PROMPT_VERSION,
  buildCurationMessages,
  curateWikipediaText,
  decryptSecret,
  encryptSecret,
  testLlmConnection,
  validateCuratedText,
} from "./index";

const source = {
  title: "Apollo 11",
  url: "https://en.wikipedia.org/wiki/Apollo_11",
  text: "Apollo 11 was the American spaceflight that first landed humans on the Moon in 1969. Neil Armstrong and Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, while Michael Collins flew the command module Columbia in lunar orbit. Armstrong became the first person to step onto the lunar surface.",
  language: "en",
  readingMinutes: 3,
};

describe("AI curation prompt", () => {
  it("treats the Wikipedia page as untrusted source material and forbids new facts", () => {
    const messages = buildCurationMessages(source);
    const prompt = messages.map((message) => message.content).join("\n");

    expect(prompt).toContain(source.url);
    expect(prompt).toContain(source.text);
    expect(prompt).toContain("untrusted source material");
    expect(prompt).toContain("Never add");
    expect(prompt).toContain("600 words");
    expect(prompt).toContain(PROMPT_VERSION);
  });

  it("rejects numbers absent from the source and content over the time budget", () => {
    expect(() =>
      validateCuratedText(
        { text: "Apollo 11 landed in 1972. " + "Reliable source sentence. ".repeat(30) },
        source,
      ),
    ).toThrow(/number/i);

    expect(() =>
      validateCuratedText({ text: `${"Apollo mission text ".repeat(601)}` }, source),
    ).toThrow(/reading-time/i);
  });
});

describe("provider curation clients", () => {
  it.each([
    {
      provider: "OPENAI" as const,
      endpoint: "https://api.openai.com/v1/chat/completions",
      responseType: "json_schema",
    },
    {
      provider: "GEMINI" as const,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      responseType: "json_schema",
    },
    {
      provider: "DEEPSEEK" as const,
      endpoint: "https://api.deepseek.com/chat/completions",
      responseType: "json_object",
    },
  ])(
    "uses the production endpoint and response format for $provider",
    async ({ provider, endpoint, responseType }) => {
      const curatedText = `${source.text} ${"The mission remained tied to the documented account. ".repeat(12)}`;
      const fetchImpl = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify({ text: curatedText }) } }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      const result = await curateWikipediaText(
        {
          connection: {
            provider,
            model: "editor-model",
            apiKey: "secret",
          },
          source,
        },
        fetchImpl,
      );

      expect(fetchImpl).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: "POST" }));
      const request = fetchImpl.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body));
      expect(body.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ content: expect.stringContaining(source.url) }),
        ]),
      );
      expect(body.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ content: expect.stringContaining(source.text) }),
        ]),
      );
      expect(body.response_format.type).toBe(responseType);
      if (responseType === "json_schema") {
        expect(body.response_format.json_schema).toMatchObject({
          name: "narau_curated_text",
          strict: true,
        });
      } else {
        expect(body.response_format).toEqual({ type: "json_object" });
      }
      expect(result).toMatchObject({
        text: curatedText.trim(),
        model: "editor-model",
        promptVersion: PROMPT_VERSION,
      });
    },
  );

  it.each([
    ["OPENAI" as const, "json_schema"],
    ["GEMINI" as const, "json_schema"],
    ["DEEPSEEK" as const, "json_object"],
  ])("tests %s with its production response mode", async (provider, responseType) => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: JSON.stringify({ ok: true }) } }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    await expect(
      testLlmConnection({ provider, model: "editor-model", apiKey: "secret" }, fetchImpl),
    ).resolves.toEqual({ ok: true });

    const request = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body.response_format.type).toBe(responseType);
  });
});

describe("LLM API key encryption", () => {
  it("round-trips a key without storing it as plaintext", () => {
    const encrypted = encryptSecret("api-key-value", "local-encryption-key");
    expect(encrypted).not.toContain("api-key-value");
    expect(decryptSecret(encrypted, "local-encryption-key")).toBe("api-key-value");
  });
});
