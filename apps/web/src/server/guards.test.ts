import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  getRequestTenant: vi.fn(),
  getTenantById: vi.fn(),
  getRequestTenantPath: vi.fn(),
}));

vi.mock("@/server/auth", () => ({ auth: mocks.auth }));
vi.mock("@/server/tenant", () => ({
  getRequestTenant: mocks.getRequestTenant,
  getTenantById: mocks.getTenantById,
  getRequestTenantPath: mocks.getRequestTenantPath,
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { requireAdmin, requireGlobalAdmin, requireTenantAdmin, requireUser } from "./guards";

function session(
  overrides: Partial<{ id: string; role: string; tenantId: string }> = {},
): { user: { id: string; role: string; tenantId: string }; expires: string } {
  return {
    user: { id: "user-1", role: "USER", tenantId: "tenant-en", ...overrides },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

describe("server guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`);
    });
    mocks.getRequestTenantPath.mockImplementation(async (path: string) => `/en${path}`);
    mocks.getRequestTenant.mockResolvedValue({ id: "tenant-en", slug: "en" });
    mocks.getTenantById.mockResolvedValue({ id: "tenant-en", slug: "en" });
  });

  it("redirects anonymous visitors to the request tenant login", async () => {
    mocks.auth.mockResolvedValue(null);

    await expect(requireUser()).rejects.toThrow("redirect:/en/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/login");
  });

  it("redirects tenant-owned users back to their own tenant", async () => {
    mocks.auth.mockResolvedValue(session());
    mocks.getRequestTenant.mockResolvedValue({ id: "tenant-es", slug: "es" });

    await expect(requireUser()).rejects.toThrow("redirect:/en/today");
  });

  it("prevents regular users from opening admin routes", async () => {
    mocks.auth.mockResolvedValue(session());

    await expect(requireAdmin()).rejects.toThrow("redirect:/en/dashboard");
  });

  it("keeps moderators inside their assigned tenant", async () => {
    mocks.auth.mockResolvedValue(session({ role: "MODERATOR" }));
    mocks.getRequestTenant.mockResolvedValue({ id: "tenant-es", slug: "es" });

    await expect(requireTenantAdmin()).rejects.toThrow("redirect:/en/admin");
  });

  it("allows global admins to manage any tenant", async () => {
    const admin = session({ role: "ADMIN" });
    mocks.auth.mockResolvedValue(admin);

    await expect(requireGlobalAdmin()).resolves.toBe(admin);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
