"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@dailycurio/ui";
import { useState, useTransition } from "react";
import { adminDismissReport, adminResolveReport } from "@/server/actions/admin/reports";

export interface ReportRow {
  id: string;
  itemId: string | null;
  reason: string;
  details: string | null;
  status: "NEW" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  createdAt: Date;
  user: { email: string } | null;
  subject: { title: string; canonicalUrl: string };
  item: { contentDate: Date } | null;
}

export function ReportsTable({ reports }: { reports: ReportRow[] }): React.ReactElement {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, reportId: string): void {
    setError(null);
    setPendingId(reportId);
    startTransition(async () => {
      const result = await action();
      setPendingId(null);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <a
                  href={report.subject.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {report.subject.title}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{report.reason}</Badge>
              </TableCell>
              <TableCell className="max-w-[280px]">
                <p className="line-clamp-2 text-xs text-muted-foreground">{report.details ?? "—"}</p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{report.user?.email ?? "Anonymous"}</TableCell>
              <TableCell>
                <Badge variant={report.status === "NEW" ? "default" : "muted"}>{report.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {report.status === "NEW" || report.status === "REVIEWING" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={pendingId === report.id}
                      onClick={() =>
                        run(() => adminResolveReport(report.id), report.id)
                      }
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === report.id}
                      onClick={() =>
                        run(() => adminDismissReport(report.id), report.id)
                      }
                    >
                      Dismiss
                    </Button>
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {reports.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No open reports. The inbox is clean.</p>
      ) : null}
    </div>
  );
}
