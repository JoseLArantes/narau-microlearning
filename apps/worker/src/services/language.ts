export function wikipediaLanguageCode(languageTag: string): string {
  return languageTag.trim().toLowerCase().split("-")[0] || "en";
}

