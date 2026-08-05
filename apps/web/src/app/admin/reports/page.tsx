import type { ReactElement } from "react";
import { requireTenantAdmin } from "@/server/guards";
import { listReports } from "@/server/services/admin";
import { ReportsTable, type ReportRow } from "@/components/admin/reports-table";

export default async function AdminReportsPage(): Promise<ReactElement> {
  const { tenant } = await requireTenantAdmin();
  const reports = await listReports(tenant.id);

  const rows: ReportRow[] = reports.map((report) => ({
    id: report.id,
    itemId: report.userDailyItemId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.createdAt,
    user: report.user ? { email: report.user.email } : null,
    subject: {
      id: report.subject.id,
      title: report.subject.title,
      canonicalUrl: report.subject.canonicalUrl,
    },
    item: report.userDailyItem ? { contentDate: report.userDailyItem.contentDate } : null,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="mono-meta text-muted-foreground">RETURN &amp; REVIEW</span>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          {rows.length} open report{rows.length === 1 ? "" : "s"}
        </p>
      </header>

      <ReportsTable reports={rows} />
    </div>
  );
}
