import { tenantPath } from "../server/tenant-routing";

export function dashboardCardPath(tenantSlug: string, itemId: string): string {
  return tenantPath(tenantSlug, `/dashboard/card/${encodeURIComponent(itemId)}`);
}
