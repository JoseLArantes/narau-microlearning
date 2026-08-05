"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminActivateArea, adminDeleteDraftArea, adminDisableArea, adminPreviewArea } from "@/server/actions/admin/areas";
import { CreateAreaDialog } from "./create-area-dialog";
import { EditAreaDialog } from "./edit-area-dialog";

export interface AreaRow {
  id: string;
  parentId: string | null;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  displayOrder: number;
  color: string | null;
  sourceConfig: unknown;
  parent: { name: string; parent: { name: string } | null } | null;
  _count: { userAreas: number; candidates: number };
}

export function AreasTable({ areas }: { areas: AreaRow[] }): React.ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<{ areaName: string; language: string; sampleTitles: string[] } | null>(null);
  const sorted = [...areas].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      {error ? <p role="alert" className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {preview ? (
        <div className="rounded border border-border bg-card px-4 py-3 text-sm">
          <p className="font-medium">Wikipedia preview · {preview.areaName} · {preview.language}</p>
          <p className="mt-1 text-muted-foreground">Sample: {preview.sampleTitles.length ? preview.sampleTitles.join(" · ") : "No article members found."}</p>
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Learning tree</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscribers</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead className="text-right">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((area) => {
            const depth = area.level === "AREA" ? 0 : area.level === "TOPIC" ? 1 : 2;
            return (
              <TableRow key={area.id}>
                <TableCell>
                  <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                    <span aria-hidden className="size-3 rounded-full border border-border" style={{ backgroundColor: area.color ?? "transparent" }} />
                    <div className="space-y-0.5">
                      <p className="font-medium">{area.name}</p>
                      <p className="text-xs text-muted-foreground">{area.level} · {area.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant={area.status === "ACTIVE" ? "secondary" : area.status === "DRAFT" ? "outline" : "muted"}>{area.status}</Badge></TableCell>
                <TableCell>{area._count.userAreas}</TableCell>
                <TableCell>{area._count.candidates}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <EditAreaDialog area={area} />
                    <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => {
                      setError(null);
                      const result = await adminPreviewArea(area.id);
                      if (result.ok) setPreview({ areaName: area.name, language: result.data.language, sampleTitles: result.data.sampleTitles });
                      else setError(result.error);
                    })}>Preview</Button>
                    {area.level !== "SPECIALTY" ? <CreateAreaDialog parentId={area.id} parentLabel={area.name} /> : null}
                    {area.status === "DRAFT" ? (
                      <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => { setError(null); const result = await adminActivateArea(area.id); if (result.ok) router.refresh(); else setError(result.error); })}>Activate</Button>
                    ) : area.status === "ACTIVE" ? (
                      <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => { setError(null); const result = await adminDisableArea(area.id); if (result.ok) router.refresh(); else setError(result.error); })}>Disable</Button>
                    ) : null}
                    {area.status === "DRAFT" ? <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => { setError(null); const result = await adminDeleteDraftArea(area.id); if (result.ok) router.refresh(); else setError(result.error); })}>Delete</Button> : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
