"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminActivateArea, adminDeleteDraftArea, adminDisableArea, adminPreviewArea } from "@/server/actions/admin/areas";
import { CreateAreaDialog, type AreaParentOption } from "./create-area-dialog";
import { EditAreaDialog } from "./edit-area-dialog";

export interface AreaRow extends AreaParentOption {
  parentId: string | null;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  displayOrder: number;
  color: string | null;
  sourceConfig: unknown;
  parent: { id: string; name: string; slug: string; parent: { id: string; name: string; slug: string } | null } | null;
  _count: { userAreas: number; candidates: number };
}

type AreaTreeRow = AreaRow & { children: AreaTreeRow[] };

function buildAreaTree(rows: AreaRow[]): AreaTreeRow[] {
  const nodes = new Map(rows.map((row) => [row.id, { ...row, children: [] as AreaTreeRow[] }]));
  const roots: AreaTreeRow[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (items: AreaTreeRow[]) => {
    items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    for (const item of items) sort(item.children);
  };
  sort(roots);
  return roots;
}

function countDescendants(area: AreaTreeRow): number {
  return area.children.reduce((count, child) => count + 1 + countDescendants(child), 0);
}

export function AreasTable({ areas }: { areas: AreaRow[] }): React.ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<{ areaName: string; language: string; sampleTitles: string[] } | null>(null);
  const roots = buildAreaTree(areas);

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>, onSuccess: () => void = () => router.refresh()): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onSuccess();
      else setError(result.error ?? "The action could not be completed.");
    });
  }

  function renderActions(area: AreaTreeRow): React.ReactElement {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <EditAreaDialog area={area} />
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => runAction(async () => {
            const result = await adminPreviewArea(area.id);
            if (result.ok) setPreview({ areaName: area.name, language: result.data.language, sampleTitles: result.data.sampleTitles });
            return result;
          }, () => undefined)}
        >
          Preview
        </Button>
        {area.level !== "SPECIALTY" ? <CreateAreaDialog parent={area} /> : null}
        {area.status === "DRAFT" ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => runAction(() => adminActivateArea(area.id))}>Activate</Button>
        ) : area.status === "ACTIVE" ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => runAction(() => adminDisableArea(area.id))}>Disable</Button>
        ) : null}
        {area.status === "DRAFT" ? <Button variant="ghost" size="sm" disabled={pending} onClick={() => runAction(() => adminDeleteDraftArea(area.id))}>Delete</Button> : null}
      </div>
    );
  }

  function renderRows(area: AreaTreeRow, depth: number): React.ReactNode[] {
    return [
      <TableRow key={area.id} className={depth === 0 ? "bg-secondary/30" : undefined}>
        <TableCell>
          <div className="flex items-start gap-3" style={{ paddingLeft: `${depth * 1.5}rem` }}>
            <span aria-hidden className="mt-1 size-3 shrink-0 rounded-full border border-border" style={{ backgroundColor: area.color ?? "transparent" }} />
            <div className="min-w-0 space-y-0.5">
              <p className={depth === 0 ? "font-medium" : "font-serif text-[1.02rem]"}>{area.name}</p>
              <p className="text-xs text-muted-foreground">
                {depth > 0 ? `Under ${area.parent?.name ?? "parent"} · ` : ""}{area.level} · <code className="font-mono">{area.slug}</code>
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell><Badge variant={area.status === "ACTIVE" ? "secondary" : area.status === "DRAFT" ? "outline" : "muted"}>{area.status}</Badge></TableCell>
        <TableCell>{area._count.userAreas}</TableCell>
        <TableCell>{area._count.candidates}</TableCell>
        <TableCell className="text-right">{renderActions(area)}</TableCell>
      </TableRow>,
      ...area.children.flatMap((child) => renderRows(child, depth + 1)),
    ];
  }

  return (
    <div className="space-y-6">
      {error ? <p role="alert" className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {preview ? (
        <div className="rounded border border-border bg-card px-4 py-3 text-sm">
          <p className="font-medium">Wikipedia preview · {preview.areaName} · {preview.language}</p>
          <p className="mt-1 text-muted-foreground">Sample: {preview.sampleTitles.length ? preview.sampleTitles.join(" · ") : "No article members found."}</p>
        </div>
      ) : null}
      {roots.map((root) => (
        <section key={root.id} className="space-y-3" aria-labelledby={`area-group-${root.id}`}>
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id={`area-group-${root.id}`} className="font-serif text-xl tracking-tight">{root.name}</h2>
              <p className="text-sm text-muted-foreground">
                <code className="font-mono text-xs">{root.slug}</code> · {countDescendants(root)} child{countDescendants(root) === 1 ? "" : "ren"}
              </p>
            </div>
            {root.level !== "SPECIALTY" ? <CreateAreaDialog parent={root} /> : null}
          </header>
          <div className="overflow-x-auto rounded-[11px] border border-border bg-card shadow-[0_1px_2px_rgba(48,34,12,0.1),0_16px_36px_-18px_rgba(48,34,12,0.35)]">
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
              <TableBody>{renderRows(root, 0)}</TableBody>
            </Table>
          </div>
        </section>
      ))}
      {roots.length === 0 ? <p className="rounded-[11px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No areas yet. Create the first top-level area to begin the learning tree.</p> : null}
    </div>
  );
}
