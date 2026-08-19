/** @vitest-environment jsdom */

import "@/test/setup-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateTodayItem: vi.fn(),
  reportTodayItem: vi.fn(),
}));

vi.mock("@/server/actions/today", () => ({
  rateTodayItem: mocks.rateTodayItem,
  reportTodayItem: mocks.reportTodayItem,
}));

import { RatingDialog } from "./rating-dialog";
import { ReportDialog } from "./report-dialog";

describe("daily card feedback dialogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateTodayItem.mockResolvedValue({ ok: true, data: undefined });
    mocks.reportTodayItem.mockResolvedValue({ ok: true, data: undefined });
  });

  it("submits an accessible star rating and optional comment", async () => {
    const user = userEvent.setup();
    render(<RatingDialog itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Rate it" }));
    expect(screen.getByRole("dialog", { name: "How was it?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit rating" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "5 stars" }));
    await user.type(screen.getByRole("textbox", { name: "Comment (optional)" }), "Clear and useful");
    await user.click(screen.getByRole("button", { name: "Submit rating" }));

    expect(mocks.rateTodayItem).toHaveBeenCalledWith({
      itemId: "item-1",
      rating: 5,
      comment: "Clear and useful",
    });
    expect(await screen.findByText("Your rating is saved. It helps us pick better readings.")).toBeInTheDocument();
  });

  it("announces a rating failure and preserves the form", async () => {
    mocks.rateTodayItem.mockResolvedValue({ ok: false, error: "The rating could not be saved." });
    const user = userEvent.setup();
    render(<RatingDialog itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Rate it" }));
    await user.click(screen.getByRole("radio", { name: "3 stars" }));
    await user.click(screen.getByRole("button", { name: "Submit rating" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The rating could not be saved.");
    expect(screen.getByRole("radio", { name: "3 stars" })).toBeChecked();
  });

  it("submits a report with its selected reason and details", async () => {
    const user = userEvent.setup();
    render(<ReportDialog subjectId="subject-1" itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Report a problem" }));
    expect(screen.getByRole("dialog", { name: "Report a problem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send report" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "The information is outdated" }));
    await user.type(screen.getByRole("textbox", { name: "Details (optional)" }), "A newer source is available.");
    await user.click(screen.getByRole("button", { name: "Send report" }));

    expect(mocks.reportTodayItem).toHaveBeenCalledWith({
      subjectId: "subject-1",
      itemId: "item-1",
      reason: "OUTDATED",
      details: "A newer source is available.",
    });
    expect(await screen.findByText("Thanks — a human will take a look.")).toBeInTheDocument();
  });

  it("announces a report failure and preserves its inputs", async () => {
    mocks.reportTodayItem.mockResolvedValue({ ok: false, error: "The report could not be sent." });
    const user = userEvent.setup();
    render(<ReportDialog subjectId="subject-1" itemId="item-1" />);

    await user.click(screen.getByRole("button", { name: "Report a problem" }));
    await user.click(screen.getByRole("radio", { name: "The source link is broken" }));
    await user.click(screen.getByRole("button", { name: "Send report" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The report could not be sent.");
    expect(screen.getByRole("radio", { name: "The source link is broken" })).toBeChecked();
  });
});
