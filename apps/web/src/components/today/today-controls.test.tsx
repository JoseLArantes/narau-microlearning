/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  markTodayLearned: vi.fn(),
  skipTodayItem: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/server/actions/today", () => ({
  markTodayLearned: mocks.markTodayLearned,
  skipTodayItem: mocks.skipTodayItem,
}));

import { MarkLearnedButton } from "./mark-learned-button";
import { SkipButton } from "./skip-button";

describe("daily card controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.markTodayLearned.mockResolvedValue({ ok: true, data: undefined });
    mocks.skipTodayItem.mockResolvedValue({ ok: true, data: undefined });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces the learned stamp and refreshes after its animation", async () => {
    const user = userEvent.setup();
    render(
      <MarkLearnedButton
        itemId="item-1"
        contentDate={new Date("2026-08-19T00:00:00.000Z")}
      />,
    );

    await user.click(screen.getByRole("button", { name: "I learned this" }));

    expect(mocks.markTodayLearned).toHaveBeenCalledWith("item-1");
    expect(await screen.findByRole("status")).toHaveTextContent("LEARNED AUG 19, 2026");
    expect(mocks.refresh).not.toHaveBeenCalled();

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1), { timeout: 1_000 });
  });

  it("announces a learned-action failure without refreshing", async () => {
    mocks.markTodayLearned.mockResolvedValue({ ok: false, error: "That card is no longer available." });
    const user = userEvent.setup();
    render(
      <MarkLearnedButton
        itemId="item-1"
        contentDate={new Date("2026-08-19T00:00:00.000Z")}
      />,
    );

    await user.click(screen.getByRole("button", { name: "I learned this" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That card is no longer available.");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("refreshes immediately after a successful skip", async () => {
    const user = userEvent.setup();
    render(<SkipButton itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Skip this card" }));

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(mocks.skipTodayItem).toHaveBeenCalledWith("item-1");
  });

  it("announces a skip failure", async () => {
    mocks.skipTodayItem.mockResolvedValue({ ok: false, error: "The card could not be skipped." });
    const user = userEvent.setup();
    render(<SkipButton itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Skip this card" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The card could not be skipped.");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
