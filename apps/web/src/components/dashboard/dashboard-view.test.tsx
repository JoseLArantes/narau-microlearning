/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DashboardView } from "./dashboard-view";

const history = {
  totalLearned: 2,
  currentStreak: 2,
  recent: [
    {
      id: "item-physics",
      title: "Quantum entanglement",
      areaName: "Science",
      breadcrumb: "Science › Physics",
      learnedAt: new Date("2026-08-19T10:00:00.000Z"),
    },
    {
      id: "item-art",
      title: "Impressionism",
      areaName: "Art",
      breadcrumb: "Art",
      learnedAt: new Date("2026-08-18T10:00:00.000Z"),
    },
  ],
  byArea: [
    {
      area: { id: "science", name: "Science", slug: "science", color: null },
      learned: [
        {
          id: "item-physics",
          title: "Quantum entanglement",
          breadcrumb: "Science › Physics",
          learnedAt: new Date("2026-08-19T10:00:00.000Z"),
          rating: 5,
        },
      ],
    },
    {
      area: { id: "art", name: "Art", slug: "art", color: null },
      learned: [
        {
          id: "item-art",
          title: "Impressionism",
          breadcrumb: "Art",
          learnedAt: new Date("2026-08-18T10:00:00.000Z"),
          rating: null,
        },
      ],
    },
  ],
};

describe("DashboardView", () => {
  it("links recent cards to their tenant-scoped history routes", () => {
    render(<DashboardView history={history} />);

    expect(screen.getAllByRole("link", { name: /Quantum entanglement/i })).not.toHaveLength(0);
    for (const link of screen.getAllByRole("link", { name: /Quantum entanglement/i })) {
      expect(link).toHaveAttribute("href", "/en/dashboard/card/item-physics");
    }
  });

  it("filters the drawer to a selected root area", async () => {
    const user = userEvent.setup();
    render(<DashboardView history={history} />);

    await user.click(screen.getByRole("button", { name: "Science 1" }));

    expect(screen.getByRole("heading", { name: "Science" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quantum entanglement/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Impressionism/i })).not.toBeInTheDocument();
  });

  it("renders a clear empty state", () => {
    render(<DashboardView history={{ totalLearned: 0, currentStreak: 0, recent: [], byArea: [] }} />);

    expect(screen.getByRole("heading", { name: "Nothing learned yet" })).toBeInTheDocument();
    expect(screen.getByText(/Finish today's reading/i)).toBeInTheDocument();
  });
});
