"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@dailycurio/ui";
import { useTransition } from "react";
import { adminDisableArea } from "@/server/actions/admin/areas";

export interface AreaRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "ACTIVE" | "DISABLED";
  displayOrder: number;
  color: string | null;
  _count: { userAreas: number; candidates: number };
}

export function AreasTable({ areas }: { areas: AreaRow[] }): React.ReactElement {
  const [pending, startTransition] = useTransition();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Area</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Subscribers</TableHead>
          <TableHead>Candidates</TableHead>
          <TableHead className="text-right">Manage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {areas.map((area) => (
          <TableRow key={area.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: area.color ?? "transparent" }}
                />
                <div className="space-y-0.5">
                  <p className="font-medium">{area.name}</p>
                  <p className="text-xs text-muted-foreground">{area.slug}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={area.status === "ACTIVE" ? "secondary" : "outline"}>{area.status}</Badge>
            </TableCell>
            <TableCell>{area._count.userAreas}</TableCell>
            <TableCell>{area._count.candidates}</TableCell>
            <TableCell className="text-right">
              {area.status === "ACTIVE" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await adminDisableArea(area.id);
                    });
                  }}
                >
                  Disable
                </Button>
              ) : (
                <Badge variant="muted">Disabled</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
