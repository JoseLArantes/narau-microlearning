import { describe, expect, it } from "vitest";
import { createTenantSchema, tenantLanguageSchema, tenantSlugSchema } from "./tenant";

describe("tenant validation", () => {
  it("accepts route slugs for newly added languages", () => {
    expect(tenantSlugSchema.parse("pt-br")).toBe("pt-br");
    expect(tenantLanguageSchema.parse("pt-BR")).toBe("pt-br");
  });

  it("rejects ambiguous or unsafe route slugs", () => {
    expect(tenantSlugSchema.safeParse("pt_BR").success).toBe(false);
    expect(tenantSlugSchema.safeParse("/pt-br").success).toBe(false);
    expect(tenantSlugSchema.safeParse("a").success).toBe(false);
  });

  it("normalizes tenant creation input", () => {
    expect(
      createTenantSchema.parse({
        name: "  Português do Brasil ",
        slug: " pt-br ",
        language: " PT-BR ",
      }),
    ).toMatchObject({ name: "Português do Brasil", slug: "pt-br", language: "pt-br", isDefault: false });
  });
});

