/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LearningInterestSelector, type AreaTreeOption } from "./learning-interest-selector";

const areas: AreaTreeOption[] = [
  {
    id: "science",
    parentId: null,
    level: "AREA",
    name: "Science",
    description: "The natural world",
    status: "ACTIVE",
    effectiveActive: true,
    children: [
      {
        id: "physics",
        parentId: "science",
        level: "TOPIC",
        name: "Physics",
        description: "Matter and energy",
        status: "ACTIVE",
        effectiveActive: true,
        children: [
          {
            id: "quantum",
            parentId: "physics",
            level: "SPECIALTY",
            name: "Quantum mechanics",
            description: null,
            status: "ACTIVE",
            effectiveActive: true,
            children: [],
          },
        ],
      },
    ],
  },
];

describe("LearningInterestSelector", () => {
  it("replaces a broad selection with a more specific topic", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<LearningInterestSelector areas={areas} onSave={onSave} />);

    await user.click(screen.getByRole("checkbox", { name: "Area: Science" }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Choose specific topics" }));
    expect(screen.getByRole("checkbox", { name: "Area: Science" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Topic: Physics" })).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Topic: Physics" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));

    expect(onSave).toHaveBeenCalledWith(["physics"]);
    expect(await screen.findByRole("status")).toHaveTextContent("Your choices will guide tomorrow’s card.");
  });

  it("keeps disabled descendants out of the selection UI", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    const disabledAreas = structuredClone(areas);
    disabledAreas[0]!.children[0]!.effectiveActive = false;
    render(<LearningInterestSelector areas={disabledAreas} onSave={onSave} />);

    await user.click(screen.getByRole("checkbox", { name: "Area: Science" }));

    expect(screen.queryByRole("button", { name: "Choose specific topics" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Topic: Physics" })).not.toBeInTheDocument();
  });

  it("preserves the selection and announces a save failure", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ ok: false, error: "Could not save these choices." });
    render(
      <LearningInterestSelector
        areas={areas}
        initialSelectedNodeIds={["science"]}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start learning" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save these choices.");
    expect(screen.getByRole("checkbox", { name: "Area: Science" })).toBeChecked();
  });
});
