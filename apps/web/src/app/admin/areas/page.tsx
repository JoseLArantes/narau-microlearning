import type { ReactElement } from "react";
import { requireAdmin } from "@/server/guards";
import { listAllAreas } from "@/server/services/areas";
import { AreasTable } from "@/components/admin/areas-table";
import { CreateAreaDialog } from "@/components/admin/create-area-dialog";

export default async function AdminAreasPage(): Promise<ReactElement> {
  await requireAdmin();
  const areas = await listAllAreas();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="mono-meta text-muted-foreground">SHELF SECTIONS</span>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Areas</h1>
          <p className="text-muted-foreground">
            {areas.length} area{areas.length === 1 ? "" : "s"} feeding the daily machine
          </p>
        </div>
        <CreateAreaDialog />
      </header>

      <AreasTable areas={areas} />
    </div>
  );
}
