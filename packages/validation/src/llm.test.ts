import { describe, expect, it } from "vitest";
import { llmSettingsSchema } from "./llm";

describe("LLM settings validation", () => {
  it("requires a supported provider and model when enabled", () => {
    expect(
      llmSettingsSchema.safeParse({ enabled: true, provider: "OPENAI", model: "" }).success,
    ).toBe(false);
    expect(
      llmSettingsSchema.safeParse({ enabled: true, provider: "OLLAMA", model: "local" }).success,
    ).toBe(false);
  });

  it.each(["OPENAI", "DEEPSEEK", "GEMINI"])("accepts the %s provider", (provider) => {
    expect(
      llmSettingsSchema.safeParse({ enabled: true, provider, model: "model-id" }).success,
    ).toBe(true);
  });

  it("allows a disabled, unconfigured connection", () => {
    expect(
      llmSettingsSchema.safeParse({ enabled: false, provider: "OPENAI", model: "" }).success,
    ).toBe(true);
  });
});
