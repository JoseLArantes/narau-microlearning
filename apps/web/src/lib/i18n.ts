import en from "../../public/locales/en.json";
import es from "../../public/locales/es.json";
import pt from "../../public/locales/pt.json";

export const SUPPORTED_LOCALES = ["en", "es", "pt"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";

export interface TenantInfo {
  id: string;
  name: string;
  language: SupportedLocale;
}

export const TENANTS: Record<string, TenantInfo> = {
  en: { id: "en", name: "English", language: "en" },
  es: { id: "es", name: "Español", language: "es" },
  pt: { id: "pt", name: "Português", language: "pt" },
};

const dictionaries: Record<SupportedLocale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  es: es as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function getTranslation(
  locale: string,
  key: string,
  fallback?: string,
): string {
  const normalizedLocale = (SUPPORTED_LOCALES.includes(locale as SupportedLocale) ? locale : DEFAULT_LOCALE) as SupportedLocale;
  const dict = dictionaries[normalizedLocale] ?? dictionaries[DEFAULT_LOCALE];
  const value = getNestedValue(dict, key);
  if (value !== undefined) return value;

  // Fallback to default locale dictionary if missing in requested locale
  if (normalizedLocale !== DEFAULT_LOCALE) {
    const fallbackValue = getNestedValue(dictionaries[DEFAULT_LOCALE], key);
    if (fallbackValue !== undefined) return fallbackValue;
  }

  return fallback ?? key;
}

export function translate(
  locale: string,
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
): string {
  let text = getTranslation(locale, key, fallback);
  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
    }
  }
  return text;
}
