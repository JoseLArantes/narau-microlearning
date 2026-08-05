import Link from "next/link";
import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@narau/ui";
import { requireTenantAdmin } from "@/server/guards";
import { adminOverview } from "@/server/services/admin";
import { tenantPath } from "@/server/tenant-routing";

export default async function AdminPage(): Promise<ReactElement> {
  const { tenant } = await requireTenantAdmin();
  const overview = await adminOverview(tenant.id);

  const stats = [
    { label: "Users", value: overview.users, href: "/admin/users" },
    { label: "Areas", value: overview.areas, href: "/admin/areas" },
    { label: "Pending reports", value: overview.pendingReports, href: "/admin/reports" },
    { label: "Pending daily items", value: overview.pendingItems, href: "/admin/subjects" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="mono-meta text-muted-foreground">LIBRARIAN&apos;S CATALOG</span>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Overview</h1>
        <p className="text-muted-foreground">The daily machine at a glance.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={tenantPath(tenant.slug, stat.href)} className="transition-opacity hover:opacity-80">
            <Card className="px-6 py-6">
              <p className="mono-meta text-muted-foreground">{stat.label.toUpperCase()}</p>
              <p className="mt-3 font-serif text-4xl font-normal tracking-tight">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operator notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            Run the worker jobs in order: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">bun run job:ingest</code>,{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">bun run job:select</code>, then{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">bun run job:assign</code>.
          </p>
          <p>Admin overrides in Subjects are never overwritten by the worker.</p>
        </CardContent>
      </Card>
    </div>
  );
}
