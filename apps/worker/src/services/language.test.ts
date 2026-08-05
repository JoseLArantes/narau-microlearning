import { describe, expect, it } from "vitest";
import { wikipediaLanguageCode } from "./language";

describe("Wikipedia language mapping", () => {
  it("maps regional language tags to the Wikipedia project code", () => {
    expect(wikipediaLanguageCode("pt-br")).toBe("pt");
    expect(wikipediaLanguageCode("es")).toBe("es");
  });
});

