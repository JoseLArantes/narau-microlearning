import type { ReactElement } from "react";
import { requireGlobalAdmin } from "@/server/guards";
import { listTenants } from "@/server/tenant";
import { CreateTenantDialog } from "@/components/admin/create-tenant-dialog";
import { TenantsTable, type TenantRow } from "@/components/admin/tenants-table";

export const metadata = { title: "Tenants" };

export default async function AdminTenantsPage(): Promise<ReactElement> {
  await requireGlobalAdmin();
  const tenants = await listTenants(true);
  const rows: TenantRow[] = tenants.map(({ id, slug, name, language, isDefault, status }) => ({ id, slug, name, language, isDefault, status }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="mono-meta text-muted-foreground">ROUTE REGISTER</span>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Tenants</h1>
          <p className="max-w-2xl text-muted-foreground">Each tenant has an isolated content catalog and a route slug. The ingestion and daily-selection engines remain shared.</p>
        </div>
        <CreateTenantDialog />
      </header>
      <TenantsTable tenants={rows} />
    </div>
  );
}

