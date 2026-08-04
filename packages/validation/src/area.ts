import z from "zod";

export const areaSourceConfigSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  includeSubcategories: z.boolean().default(true),
  depth: z.number().int().min(0).max(3).default(1),
  maxCandidates: z.number().int().min(10).max(500).default(100),
  excludeCategories: z.array(z.string()).default([]),
});

export type AreaSourceConfig = z.infer<typeof areaSourceConfigSchema>;

export const areaSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase letters, numbers, and hyphens)");

export const areaStatusSchema = z.enum(["ACTIVE", "DISABLED"]);

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

export const onboardingAreasSchema = z.object({
  areaIds: z.array(z.string().min(1)).min(1, "Select at least one area"),
});

export type OnboardingAreasInput = z.infer<typeof onboardingAreasSchema>;
