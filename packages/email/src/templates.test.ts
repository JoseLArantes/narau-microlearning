import { describe, expect, it } from "vitest";
import {
  renderDailyLearnEmail,
  renderWelcomeEmail,
  renderPasswordResetEmail,
  renderMagicLinkEmail,
} from "./templates";

describe("Email Templates", () => {
  it("renders daily learn email with subject, area, user tags, and logo", () => {
    const html = renderDailyLearnEmail({
      userName: "Alice",
      subjectTitle: "The Rosetta Stone",
      subjectSummary: "An ancient Egyptian granodiorite stele inscribed with a decree...",
      areaName: "History",
      userTags: ["History", "Archaeology", "Linguistics"],
      readingMinutes: 4,
      itemUrl: "http://localhost:3030/today",
      dateStr: "AUG 4, 2026",
    });

    expect(html).toContain("NARAU");
    expect(html).toContain("The Rosetta Stone");
    expect(html).toContain("History");
    expect(html).toContain("Archaeology");
    expect(html).toContain("Linguistics");
    expect(html).toContain("http://localhost:3030/today");
    expect(html).toContain("AUG 4, 2026");
  });

  it("renders welcome email with editorial greeting and action link", () => {
    const html = renderWelcomeEmail({
      userName: "Bob",
      actionUrl: "http://localhost:3030/onboarding",
    });

    expect(html).toContain("Welcome to Narau");
    expect(html).toContain("Bob");
    expect(html).toContain("http://localhost:3030/onboarding");
  });

  it("renders password reset email with secure magic link", () => {
    const html = renderPasswordResetEmail({
      email: "user@example.com",
      resetUrl: "http://localhost:3030/reset-password?token=123",
      expiresMinutes: 30,
    });

    expect(html).toContain("Reset Your Password");
    expect(html).toContain("http://localhost:3030/reset-password?token=123");
    expect(html).toContain("30 minutes");
  });

  it("renders smart magic link sign-in email with sign in button", () => {
    const html = renderMagicLinkEmail({
      email: "learner@example.com",
      url: "http://localhost:3030/api/auth/callback/email?token=xyz",
    });

    expect(html).toContain("Sign In to Narau");
    expect(html).toContain("learner@example.com");
    expect(html).toContain("http://localhost:3030/api/auth/callback/email?token=xyz");
  });
});
