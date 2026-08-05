import type { AdapterUser } from "@auth/core/adapters";

export function attachTenantToAdapterUser(user: AdapterUser, tenantId: string): AdapterUser & { tenantId: string } {
  return { ...user, tenantId };
}
