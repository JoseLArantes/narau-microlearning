import type { ReactElement } from "react";
import { requireTenantAdmin } from "@/server/guards";
import { listAllAreas } from "@/server/services/areas";
import { AreasTable } from "@/components/admin/areas-table";
import { CreateAreaDialog } from "@/components/admin/create-area-dialog";

export default async function AdminAreasPage(): Promise<ReactElement> {
  const { tenant } = await requireTenantAdmin();
  const areas = await listAllAreas(tenant.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="mono-meta text-muted-foreground">SHELF SECTIONS</span>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Areas</h1>
          <p className="text-muted-foreground">
            {areas.length} area{areas.length === 1 ? "" : "s"} in {tenant.name} feeding the daily machine
          </p>
        </div>
        <CreateAreaDialog />
      </header>

      <AreasTable areas={areas} />
    </div>
  );
}
