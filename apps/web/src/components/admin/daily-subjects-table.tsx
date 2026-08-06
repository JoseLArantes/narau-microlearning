"use client";

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@narau/ui";
import { useState } from "react";
import { OverrideDialog } from "./override-dialog";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

export interface DailySubjectRow {
  areaId: string;
  areaName: string;
  subjectTitle: string | null;
  subjectUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "REPLACED";
  selectedBy: string | null;
  curationStatus: "NOT_REQUESTED" | "PENDING" | "CURATED" | "FAILED";
  curationProvider: "OPENAI" | "DEEPSEEK" | "GEMINI" | null;
  curationModel: string | null;
  curationError: string | null;
}

export function DailySubjectsTable({
  contentDate,
  areas,
  subjects,
}: {
  contentDate: Date;
  areas: Array<{ id: string; name: string; status: "DRAFT" | "ACTIVE" | "DISABLED" }>;
  subjects: DailySubjectRow[];
}): React.ReactElement {
  const [date, setDate] = useState(contentDate.toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useI18n();

  return (
    <div className="space-y-4">
      <form
        className="flex items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          window.location.href = `${tenantPath(tenant.slug, "/admin/subjects")}?date=${encodeURIComponent(date)}`;
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="flex h-9 rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="submit" variant="outline">
          Go
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Area</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI text</TableHead>
            <TableHead className="text-right">Override</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((row) => (
            <TableRow key={row.areaId}>
              <TableCell>{row.areaName}</TableCell>
              <TableCell>
                {row.subjectTitle ? (
                  <a
                    href={row.subjectUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {row.subjectTitle}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not picked yet</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    row.status === "PUBLISHED"
                      ? "secondary"
                      : row.status === "HIDDEN"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant={
                      row.curationStatus === "FAILED"
                        ? "destructive"
                        : row.curationStatus === "CURATED"
                          ? "stamped"
                          : "muted"
                    }
                  >
                    {row.curationStatus.replace("_", " ")}
                  </Badge>
                  {row.curationModel ? (
                    <p className="max-w-48 truncate text-xs text-muted-foreground">
                      {row.curationProvider ? `${row.curationProvider} · ` : ""}
                      {row.curationModel}
                    </p>
                  ) : null}
                  {row.curationError ? (
                    <p className="max-w-64 text-xs leading-5 text-destructive">
                      {row.curationError}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <OverrideDialog
                  contentDate={contentDate}
                  areaId={row.areaId}
                  areas={areas}
                  currentTitle={row.subjectTitle}
                  onError={setError}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
