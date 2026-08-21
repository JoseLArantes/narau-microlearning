/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Logo } from "./logo";

vi.mock("../i18n-context", () => ({
  useI18n: () => ({
    tenant: { slug: "en", name: "English", language: "en" },
  }),
}));

vi.mock("@/server/tenant-routing", () => ({
  tenantPath: (slug: string, path: string) => `/${slug}${path}`,
}));

describe("Logo", () => {
  it("uses the font-independent PNG wordmark", () => {
    render(<Logo />);

    expect(screen.getByRole("img", { name: "Narau" })).toHaveAttribute("src", "/narau_logo.png");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/today");
  });
});
