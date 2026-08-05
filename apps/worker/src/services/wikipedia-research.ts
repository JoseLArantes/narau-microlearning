/**
 * Keep the most specific category as the primary research scope. Broader
 * categories remain available as a fallback when the focus category is empty.
 */
export function getWikipediaResearchCategories(categories: string[]): string[] {
  const focusCategory = categories[categories.length - 1];
  return focusCategory ? [focusCategory] : [];
}
