import { describe, expect, it } from "vitest";
import { resolveUserIdFromToken } from "./session";

describe("resolveUserIdFromToken", () => {
  it("prefers the application token id", () => {
    expect(resolveUserIdFromToken({ id: "user-id", sub: "subject-id" })).toBe("user-id");
  });

  it("falls back to Auth.js subject for existing sessions", () => {
    expect(resolveUserIdFromToken({ sub: "user-id" })).toBe("user-id");
  });

  it("returns undefined when the token has no user identity", () => {
    expect(resolveUserIdFromToken({})).toBeUndefined();
  });
});
