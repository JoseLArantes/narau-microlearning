import { describe, expect, it } from "vitest";
import {
  renderDailyLearnEmail,
  renderWelcomeEmail,
  renderPasswordResetEmail,
  renderMagicLinkEmail,
} from "./templates";

describe("Email Templates", () => {
  it("renders daily learn email with link to app and without card content/summary", () => {
    const html = renderDailyLearnEmail({
      userName: "Alice",
      subjectTitle: "The Rosetta Stone",
      areaName: "History",
      userTags: ["History", "Archaeology", "Linguistics"],
      readingMinutes: 4,
      itemUrl: "http://localhost:3030/today",
      dateStr: "AUG 4, 2026",
      aiCuratedLabel: "TEXT CURATED BY AI",
    });

    expect(html).toContain("NARAU");
    expect(html).toContain('src="http://localhost:3030/narau_logo.png"');
    expect(html).not.toContain("narau_logo.svg");
    expect(html).toContain("History");
    expect(html).toContain("Archaeology");
    expect(html).toContain("Linguistics");
    expect(html).toContain("http://localhost:3030/today");
    expect(html).toContain("AUG 4, 2026");
    expect(html).toContain("TEXT CURATED BY AI");
    expect(html).toContain("READ TODAY'S CARD");
    expect(html).not.toContain("An ancient Egyptian granodiorite stele");
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

  it("renders welcome email with default action link derived from APP_URL", () => {
    const originalAppUrl = process.env.APP_URL;
    process.env.APP_URL = "https://narau.beakcloud.com";

    const html = renderWelcomeEmail({
      userName: "Bob",
    });

    expect(html).toContain("https://narau.beakcloud.com/onboarding");

    if (originalAppUrl) {
      process.env.APP_URL = originalAppUrl;
    } else {
      delete process.env.APP_URL;
    }
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
