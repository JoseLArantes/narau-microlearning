import { describe, expect, it } from "vitest";
import { getTranslation, translate, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n";

describe("i18n translation system", () => {
  it("defines base supported locales including en (default), es, and pt", () => {
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("es");
    expect(SUPPORTED_LOCALES).toContain("pt");
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("translates existing keys for English", () => {
    const title = getTranslation("en", "common.appName");
    expect(title).toBe("Narau");
  });

  it("translates existing keys for Spanish", () => {
    const greeting = getTranslation("es", "today.title");
    expect(greeting).toBe("¿Qué aprendiste hoy?");
  });

  it("translates existing keys for Portuguese", () => {
    const greeting = getTranslation("pt", "today.title");
    expect(greeting).toBe("O que você aprendeu hoje?");
  });

  it("falls back to default value or key when missing", () => {
    const val = getTranslation("es", "nonexistent.key", "Fallback Value");
    expect(val).toBe("Fallback Value");
  });

  it("supports parameter interpolation", () => {
    const res = translate("en", "today.readMinutes", { minutes: 5 });
    expect(res).toBe("5 min read");
  });
});
