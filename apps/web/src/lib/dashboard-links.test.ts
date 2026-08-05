import { describe, expect, it } from "vitest";
import { dashboardCardPath } from "./dashboard-links";

describe("dashboard links", () => {
  it("points learned entries to their internal card route", () => {
    expect(dashboardCardPath("en", "item-123")).toBe("/en/dashboard/card/item-123");
  });

  it("encodes item ids before adding them to the route", () => {
    expect(dashboardCardPath("pt-br", "item/with spaces")).toBe("/pt-br/dashboard/card/item%2Fwith%20spaces");
  });
});
