/** Keep the most specific category as the only research scope for an area. */
export function getWikipediaResearchCategories(categories: string[]): string[] {
  const focusCategory = categories[categories.length - 1];
  return focusCategory ? [focusCategory] : [];
}
