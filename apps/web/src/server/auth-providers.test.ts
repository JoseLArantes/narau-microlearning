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

  it("redirect callback rewrites relative, 0.0.0.0, and 127.0.0.1 URLs to APP_URL", async () => {
    const originalAppUrl = process.env.APP_URL;
    process.env.APP_URL = "https://narau.beakcloud.com";

    const redirectFn = authConfig.callbacks?.redirect;
    expect(redirectFn).toBeDefined();

    if (redirectFn) {
      const relResult = await redirectFn({
        url: "/en/today",
        baseUrl: "http://0.0.0.0:3030",
      });
      expect(relResult).toBe("https://narau.beakcloud.com/en/today");

      const zeroResult = await redirectFn({
        url: "http://0.0.0.0:3030/en/today",
        baseUrl: "http://0.0.0.0:3030",
      });
      expect(zeroResult).toBe("https://narau.beakcloud.com/en/today");

      const loopbackResult = await redirectFn({
        url: "http://127.0.0.1:3030/en",
        baseUrl: "http://127.0.0.1:3030",
      });
      expect(loopbackResult).toBe("https://narau.beakcloud.com/en");

      const matchResult = await redirectFn({
        url: "https://narau.beakcloud.com/en/today",
        baseUrl: "https://narau.beakcloud.com",
      });
      expect(matchResult).toBe("https://narau.beakcloud.com/en/today");
    }

    if (originalAppUrl) {
      process.env.APP_URL = originalAppUrl;
    } else {
      delete process.env.APP_URL;
    }
  });
});
