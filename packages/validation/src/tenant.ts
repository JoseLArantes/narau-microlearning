import z from "zod";

export const tenantSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Tenant slug must be URL-safe (lowercase letters, numbers, and hyphens)")
  .min(2)
  .max(32);

export const tenantLanguageSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i, "Language must be a valid language tag")
  .transform((value) => value.toLowerCase());

export const tenantNameSchema = z.string().trim().min(2).max(80);

export const createTenantSchema = z.object({
  name: tenantNameSchema,
  slug: tenantSlugSchema,
  language: tenantLanguageSchema,
  domain: z.string().trim().max(255).optional(),
  isDefault: z.boolean().default(false),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

