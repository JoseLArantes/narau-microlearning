import { describe, expect, it } from "vitest";
import { stripTenantPath, tenantPath } from "./tenant-routing";

describe("tenant routing", () => {
  it("prefixes internal paths with any tenant slug", () => {
    expect(tenantPath("pt-br", "/admin/areas")).toBe("/pt-br/admin/areas");
    expect(tenantPath("es", "/")).toBe("/es");
  });

  it("replaces an existing tenant slug when switching context", () => {
    expect(tenantPath("pt-br", "/en/admin/areas")).toBe("/pt-br/admin/areas");
  });

  it("does not treat reserved application routes as tenant routes", () => {
    expect(stripTenantPath("/admin/areas")).toEqual({ slug: null, pathname: "/admin/areas" });
    expect(tenantPath("pt-br", "/today")).toBe("/pt-br/today");
  });
});

