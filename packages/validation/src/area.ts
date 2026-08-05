import z from "zod";

const AREA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function areaSlugSegment(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "node";
}

export function getChildAreaSlugPrefix(parentSlugs: string[]): string {
  const path = parentSlugs.map((slug) => slug.trim()).filter(Boolean).join("-");
  return path ? `${path}-` : "";
}

export function buildHierarchicalAreaSlug(parentSlugs: string[], childName: string): string {
  return `${getChildAreaSlugPrefix(parentSlugs)}${areaSlugSegment(childName)}`;
}

export function hasHierarchicalAreaSlug(slug: string, parentSlugs: string[]): boolean {
  if (!AREA_SLUG_PATTERN.test(slug)) return false;
  const prefix = getChildAreaSlugPrefix(parentSlugs);
  return !prefix || (slug.startsWith(prefix) && slug.slice(prefix.length).length > 0);
}

export function normalizeWikipediaCategoryTitle(value: string): string {
  const categoryName = value
    .trim()
    .replace(/^category\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return `Category:${categoryName}`;
}

export function buildWikipediaCategorySuggestions(names: string[]): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  for (const name of names) {
    const category = normalizeWikipediaCategoryTitle(name);
    if (category === "Category:") continue;
    const key = category.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(category);
  }
  return suggestions;
}

const wikipediaCategorySchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizeWikipediaCategoryTitle)
  .refine((value) => value !== "Category:", "Category name is required");

export const areaSourceConfigSchema = z.object({
  categories: z
    .array(wikipediaCategorySchema)
    .min(1)
    .transform((categories) => [...new Map(categories.map((category) => [category.toLocaleLowerCase(), category])).values()]),
  includeSubcategories: z.boolean().default(true),
  depth: z.number().int().min(0).max(3).default(1),
  maxCandidates: z.number().int().min(10).max(500).default(100),
  excludeCategories: z.array(z.string()).default([]),
});

export type AreaSourceConfig = z.infer<typeof areaSourceConfigSchema>;

export const areaSlugSchema = z
  .string()
  .regex(AREA_SLUG_PATTERN, "Slug must be URL-safe (lowercase letters, numbers, and hyphens)");

export const areaLevelSchema = z.enum(["AREA", "TOPIC", "SPECIALTY"]);
export const areaStatusSchema = z.enum(["DRAFT", "ACTIVE", "DISABLED"]);

export const createAreaSchema = z.object({
  name: z.string().min(2).max(80),
  slug: areaSlugSchema,
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  displayOrder: z.number().int().min(0).max(999).default(0),
  sourceConfig: areaSourceConfigSchema,
});

export type CreateAreaInput = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = createAreaSchema
  .partial()
  .extend({ status: areaStatusSchema.optional() });

export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;

export const learningInterestSelectionSchema = z.object({
  selectedNodeIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one area or topic")
    .max(100)
    .transform((ids) => [...new Set(ids)]),
});

export type LearningInterestSelectionInput = z.infer<typeof learningInterestSelectionSchema>;

export const createAreaNodeSchema = createAreaSchema.extend({
  parentId: z.string().min(1).nullable().default(null),
});

export type CreateAreaNodeInput = z.infer<typeof createAreaNodeSchema>;

export const updateAreaNodeSchema = createAreaSchema.partial();
export type UpdateAreaNodeInput = z.infer<typeof updateAreaNodeSchema>;
