import { describe, expect, it } from "vitest";
import { getTranslation, translate, DICTIONARY_LOCALES, DEFAULT_LOCALE } from "./i18n";

describe("i18n translation system", () => {
  it("defines base supported locales including en (default), es, and pt", () => {
    expect(DICTIONARY_LOCALES).toContain("en");
    expect(DICTIONARY_LOCALES).toContain("es");
    expect(DICTIONARY_LOCALES).toContain("pt");
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

  it("provides system and home translations for every supported tenant", () => {
    for (const locale of DICTIONARY_LOCALES) {
      expect(getTranslation(locale, "system.signIn")).not.toBe("system.signIn");
      expect(getTranslation(locale, "landing.title")).not.toBe("landing.title");
    }
    expect(getTranslation("es", "landing.title")).toBe("¿Qué aprendiste hoy?");
    expect(getTranslation("pt-BR", "system.signIn")).toBe("Entrar");
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
