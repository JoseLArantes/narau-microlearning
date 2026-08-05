import Link from "next/link";
import type { ReactElement } from "react";
import { requireTenantAdmin } from "@/server/guards";
import { listAllAreas } from "@/server/services/areas";
import { listCandidates } from "@/server/services/admin";
import { CandidatesTable, type CandidateRow } from "@/components/admin/candidates-table";
import { parseUtcDate } from "@/lib/date";
import { tenantPath } from "@/server/tenant-routing";

export const metadata = { title: "Candidates" };

export default async function AdminCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; date?: string }>;
}): Promise<ReactElement> {
  const { tenant } = await requireTenantAdmin();
  const params = await searchParams;
  const contentDate = parseUtcDate(params.date ?? new Date().toISOString());
  const areas = await listAllAreas(tenant.id);
  const area = params.area ? areas.find((entry) => entry.slug === params.area) : areas[0];
  const candidates = area ? await listCandidates(tenant.id, area.id, contentDate) : [];

  const rows: CandidateRow[] = candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.subject.title,
    canonicalUrl: candidate.subject.canonicalUrl,
    candidateScore: candidate.candidateScore,
    qualityScore: candidate.subject.qualityScore,
    status: candidate.status,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="mono-meta text-muted-foreground">POOL INSPECTION</span>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">Candidates</h1>
        <p className="text-muted-foreground">
          The pool the curator picks from, for{" "}
          <time dateTime={contentDate.toISOString()}>{contentDate.toISOString().slice(0, 10)}</time>. Reject a
          candidate and the worker will never select it.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {areas.map((entry) => {
          const isActive = area?.id === entry.id;
          return (
            <Link
              key={entry.id}
              href={`${tenantPath(tenant.slug, "/admin/candidates")}?area=${entry.slug}`}
              className={
                isActive
                  ? "inline-flex items-center rounded-[3px] border border-[hsl(var(--primary))] bg-primary px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary-foreground"
                  : "inline-flex items-center rounded-[3px] border border-border bg-card px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              }
            >
              {entry.name}
            </Link>
          );
        })}
      </div>

      <CandidatesTable candidates={rows} />
    </div>
  );
}
