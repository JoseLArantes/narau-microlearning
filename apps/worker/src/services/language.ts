export function wikipediaLanguageCode(languageTag: string): string {
  const languageCode = languageTag.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  if (!/^[a-z]{2,3}$/.test(languageCode)) {
    throw new Error(`Invalid tenant language for Wikipedia: ${languageTag}`);
  }
  return languageCode;
}
