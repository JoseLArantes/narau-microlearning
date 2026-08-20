/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/today/mark-viewed", () => ({ MarkViewed: () => null }));
vi.mock("@/components/today/mark-learned-button", () => ({
  MarkLearnedButton: () => <button type="button">I learned this</button>,
}));
vi.mock("@/components/today/skip-button", () => ({
  SkipButton: () => <button type="button">Skip this card</button>,
}));
vi.mock("@/components/today/rating-dialog", () => ({
  RatingDialog: () => <button type="button">Rate it</button>,
}));
vi.mock("@/components/today/report-dialog", () => ({
  ReportDialog: () => <button type="button">Report a problem</button>,
}));

import { DailyItem } from "./daily-item";

function item(overrides: Record<string, unknown> = {}): { id: string; [key: string]: unknown } {
  return {
    id: "item-1",
    tenantId: "tenant-en",
    userId: "user-1",
    contentDate: new Date("2026-08-19T00:00:00.000Z"),
    userLocalDate: new Date("2026-08-19T00:00:00.000Z"),
    areaId: "topic-physics",
    subjectId: "subject-1",
    dailyAreaSubjectId: "daily-1",
    status: "PENDING",
    viewedAt: null,
    learnedAt: null,
    skippedAt: null,
    rating: null,
    ratingComment: null,
    createdAt: new Date("2026-08-19T00:00:00.000Z"),
    updatedAt: new Date("2026-08-19T00:00:00.000Z"),
    subject: {
      id: "subject-1",
      title: "Quantum entanglement",
      summary: "Original Wikipedia summary. A second sentence explains the topic.",
      hook: "Original Wikipedia summary.",
      canonicalUrl: "https://en.wikipedia.org/wiki/Quantum_entanglement",
      imageUrl: "https://upload.wikimedia.org/example.jpg",
      imageAttribution: "Example image by Researcher",
      imageLicense: "CC BY-SA 4.0",
      license: "CC BY-SA 4.0",
    },
    area: {
      id: "topic-physics",
      name: "Physics",
      level: "TOPIC",
      parent: { id: "science", name: "Science", level: "AREA", parent: null },
    },
    dailyAreaSubject: {
      id: "daily-1",
      curationStatus: "CURATED",
      curatedText: "AI-curated, source-bound text. It keeps the source facts intact.",
      curatedHook: "AI-curated, source-bound text.",
    },
    ...overrides,
  };
}

describe("DailyItem", () => {
  it("renders curated content with source attribution and accessible image text", () => {
    render(<DailyItem item={item() as never} readingMinutes={5} locale="en" />);

    expect(screen.getByRole("heading", { name: "Quantum entanglement" })).toBeInTheDocument();
    expect(screen.getByText("AI-curated, source-bound text.")).toBeInTheDocument();
    expect(screen.queryByText("Original Wikipedia summary.")).not.toBeInTheDocument();
    expect(screen.getByText("TEXT CURATED BY AI")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Illustration for Quantum entanglement" })).toBeInTheDocument();
    expect(screen.getByText("Example image by Researcher · CC BY-SA 4.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the full article" })).toHaveAttribute(
      "href",
      "https://en.wikipedia.org/wiki/Quantum_entanglement",
    );
    expect(screen.getByText("Source: Wikipedia · CC BY-SA 4.0")).toBeInTheDocument();
  });

  it("falls back to the authoritative source when curation failed", () => {
    render(
      <DailyItem
        item={item({
          dailyAreaSubject: {
            id: "daily-1",
            curationStatus: "FAILED",
            curatedText: "Untrusted failed text.",
            curatedHook: null,
          },
        }) as never}
        readingMinutes={5}
        locale="en"
      />,
    );

    expect(screen.getByText("Original Wikipedia summary.")).toBeInTheDocument();
    expect(screen.queryByText("Untrusted failed text.")).not.toBeInTheDocument();
    expect(screen.queryByText("TEXT CURATED BY AI")).not.toBeInTheDocument();
  });

  it("shows learned and rated state without mutation controls in read-only history", () => {
    render(
      <DailyItem
        item={item({
          status: "LEARNED",
          learnedAt: new Date("2026-08-19T12:00:00.000Z"),
          rating: 4,
        }) as never}
        readingMinutes={5}
        locale="en"
        readOnly
      />,
    );

    expect(screen.getByText("LEARNED · AUG 19, 2026")).toBeInTheDocument();
    expect(screen.getByText("RATED 4/5")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "I learned this" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rate it" })).not.toBeInTheDocument();
  });
});
