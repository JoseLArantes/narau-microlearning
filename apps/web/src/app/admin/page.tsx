import Link from "next/link";
import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@dailycurio/ui";
import { requireAdmin } from "@/server/guards";
import { adminOverview } from "@/server/services/admin";

export default async function AdminPage(): Promise<ReactElement> {
  await requireAdmin();
  const overview = await adminOverview();

  const stats = [
    { label: "Users", value: overview.users, href: "/admin/users" },
    { label: "Areas", value: overview.areas, href: "/admin/areas" },
    { label: "Pending reports", value: overview.pendingReports, href: "/admin/reports" },
    { label: "Pending daily items", value: overview.pendingItems, href: "/admin/subjects" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight">Overview</h1>
        <p className="text-muted-foreground">The daily machine at a glance.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="transition-opacity hover:opacity-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-4xl font-normal">{stat.value}</CardTitle>
                <CardTitle className="text-base">{stat.label}</CardTitle>
              </CardHeader>
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
            Run the worker jobs in order: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">pnpm job:ingest</code>,{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">pnpm job:select</code>, then{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">pnpm job:assign</code>.
          </p>
          <p>Admin overrides in Subjects are never overwritten by the worker.</p>
        </CardContent>
      </Card>
    </div>
  );
}
