/** Return all research categories configured for an area. */
export function getWikipediaResearchCategories(categories: string[]): string[] {
  return categories.filter(Boolean);
}
