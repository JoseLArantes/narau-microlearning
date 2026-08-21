/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TenantSwitcher } from "./tenant-switcher";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { role: "ADMIN" } } }),
}));

vi.mock("./i18n-context", () => ({
  useI18n: () => ({
    tenant: { id: "en", slug: "en", name: "English", language: "en" },
    tenants: [
      { id: "en", slug: "en", name: "English", language: "en" },
      { id: "pt", slug: "pt", name: "Português", language: "pt" },
    ],
    switchTenant: vi.fn(),
    isPending: false,
  }),
}));

describe("TenantSwitcher", () => {
  it("keeps language text readable when hovered", () => {
    render(<TenantSwitcher />);

    const select = screen.getByRole("combobox", { name: "Select Tenant Language" });

    expect(select).toHaveClass("text-foreground", "hover:text-foreground");
    expect(select).not.toHaveClass("hover:text-accent-foreground");
  });
});
