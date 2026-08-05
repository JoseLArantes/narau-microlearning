import { describe, expect, it } from "vitest";
import { attachTenantToAdapterUser } from "./tenant-auth";

describe("tenant-aware authentication", () => {
  it("assigns a newly created user to the request tenant", () => {
    const user = {
      id: "user-id",
      email: "new@example.com",
      emailVerified: null,
    };

    expect(attachTenantToAdapterUser(user, "tenant-es")).toEqual({
      ...user,
      tenantId: "tenant-es",
    });
  });
});
