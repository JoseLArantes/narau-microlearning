import { describe, expect, it } from "vitest";
import { wikipediaLanguageCode } from "./language";

describe("Wikipedia language mapping", () => {
  it("maps regional language tags to the Wikipedia project code", () => {
    expect(wikipediaLanguageCode("pt-br")).toBe("pt");
    expect(wikipediaLanguageCode("pt_BR")).toBe("pt");
    expect(wikipediaLanguageCode("es")).toBe("es");
  });

  it("does not silently fall back to English for an invalid tenant language", () => {
    expect(() => wikipediaLanguageCode(" ")).toThrow("tenant language");
    expect(() => wikipediaLanguageCode("Portuguese")).toThrow("tenant language");
  });
});
