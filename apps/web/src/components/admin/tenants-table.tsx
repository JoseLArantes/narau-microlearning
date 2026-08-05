"use client";

import Link from "next/link";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { adminActivateTenant, adminDisableTenant } from "@/server/actions/admin/tenants";
import { tenantPath } from "@/server/tenant-routing";
import { useI18n } from "@/components/i18n-context";
import { EditTenantDialog } from "./edit-tenant-dialog";

export interface TenantRow {
  id: string;
  slug: string;
  name: string;
  language: string;
  isDefault: boolean;
  status: "ACTIVE" | "DISABLED";
}

export function TenantsTable({ tenants }: { tenants: TenantRow[] }): React.ReactElement {
  const router = useRouter();
  const { tenant: currentTenant } = useI18n();
  const [error, setError] = React.useState<string | null>(null);

  async function disable(id: string): Promise<void> {
    setError(null);
    const result = await adminDisableTenant(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function activate(id: string): Promise<void> {
    setError(null);
    const result = await adminActivateTenant(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader><TableRow><TableHead>Tenant</TableHead><TableHead>Route</TableHead><TableHead>Language</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell><p className="font-medium">{tenant.name}</p>{tenant.isDefault ? <span className="mono-meta text-muted-foreground">DEFAULT ROUTE</span> : null}</TableCell>
              <TableCell><code className="font-mono text-xs">/{tenant.slug}</code></TableCell>
              <TableCell><code className="font-mono text-xs">{tenant.language}</code></TableCell>
              <TableCell><Badge variant={tenant.status === "ACTIVE" ? "secondary" : "outline"}>{tenant.status}</Badge></TableCell>
              <TableCell className="space-x-2 text-right">
                {tenant.status === "ACTIVE" ? <Link href={tenantPath(tenant.slug, "/admin/areas")} className="text-sm underline underline-offset-4 hover:text-accent-foreground">Open content</Link> : null}
                <EditTenantDialog tenant={tenant} />
                {tenant.id !== currentTenant.id && tenant.status === "ACTIVE" ? <Button variant="ghost" size="sm" onClick={() => void disable(tenant.id)}>Disable</Button> : null}
                {tenant.status === "DISABLED" ? <Button variant="ghost" size="sm" onClick={() => void activate(tenant.id)}>Enable</Button> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
