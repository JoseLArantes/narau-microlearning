/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
  useSession: () => ({ status: "unauthenticated", data: null }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/components/i18n-context", () => ({
  useI18n: () => ({
    tenant: { slug: "en", name: "English", language: "en" },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form with brand logo", () => {
    render(<LoginPage />);
    expect(screen.getByRole("img", { name: "Narau" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
  });

  it("renders sent confirmation with logo, green stamp, and hides Mailpit disclaimer in production or when APP_URL is set", async () => {
    vi.stubEnv("NODE_ENV", "production");

    mocks.signIn.mockResolvedValue({ ok: true, error: null });
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email Address"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "Send sign-in link" }));

    expect(await screen.findByText("Check your inbox")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Narau" })).toBeInTheDocument();
    expect(screen.queryByText(/In local development, open/i)).not.toBeInTheDocument();

    const sentStamp = screen.getByText("SENT");
    expect(sentStamp).toBeInTheDocument();
    expect(sentStamp.className).toContain("text-[#16A34A]");
    expect(sentStamp.className).toContain("border-[#16A34A]");

    vi.unstubAllEnvs();
  });
});
