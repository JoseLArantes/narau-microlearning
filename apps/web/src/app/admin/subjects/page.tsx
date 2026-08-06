import type { ReactElement } from "react";
import { requireTenantAdmin } from "@/server/guards";
import { listAllAreas } from "@/server/services/areas";
import { listDailySubjects } from "@/server/services/admin";
import { DailySubjectsTable, type DailySubjectRow } from "@/components/admin/daily-subjects-table";
import { parseUtcDate } from "@/lib/date";
import { getAreaBreadcrumb } from "@/server/services/areas";

export const metadata = { title: "Subjects" };

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<ReactElement> {
  const { tenant } = await requireTenantAdmin();
  const params = await searchParams;
  const contentDate = parseUtcDate(params.date ?? new Date().toISOString());
  const [areas, subjects] = await Promise.all([
    listAllAreas(tenant.id),
    listDailySubjects(tenant.id, contentDate),
  ]);

  const rows: DailySubjectRow[] = subjects.map((daily) => ({
    areaId: daily.areaId,
    areaName: getAreaBreadcrumb(daily.area),
    subjectTitle: daily.subject?.title ?? null,
    subjectUrl: daily.subject?.canonicalUrl ?? null,
    status: daily.status,
    selectedBy: daily.selectedBy,
    curationStatus: daily.curationStatus,
    curationProvider: daily.curationProvider,
    curationModel: daily.curationModel,
    curationError: daily.curationError,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl tracking-tight">Daily subjects</h1>
        <p className="text-muted-foreground">
          The items picked for{" "}
          <time dateTime={contentDate.toISOString()}>{contentDate.toISOString().slice(0, 10)}</time>
        </p>
      </header>

      <DailySubjectsTable contentDate={contentDate} areas={areas} subjects={rows} />
    </div>
  );
}
