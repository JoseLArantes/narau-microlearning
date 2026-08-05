import { describe, expect, it } from "vitest";
import { authConfig } from "./auth";

describe("NextAuth Configuration", () => {
  it("includes email and social providers (Google, Facebook, Twitter, LinkedIn)", () => {
    const providerIds = authConfig.providers.map((provider) => {
      if (typeof provider === "function") {
        const res = provider();
        return res.id;
      }
      return provider.id;
    });

    expect(providerIds).toContain("email");
    expect(providerIds).toContain("google");
    expect(providerIds).toContain("facebook");
    expect(providerIds).toContain("twitter");
    expect(providerIds).toContain("linkedin");
  });
});
