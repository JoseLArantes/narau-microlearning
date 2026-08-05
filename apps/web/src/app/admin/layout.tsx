import type { ReactElement, ReactNode } from "react";
import { requireAdmin } from "@/server/guards";
import { AppHeader } from "@/components/layout/app-header";
import { NavLink } from "@/components/layout/nav-link";
import { getRequestTenant } from "@/server/tenant";

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  const session = await requireAdmin();
  const tenant = await getRequestTenant();

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <div className="border-b border-border bg-card/60">
        <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-2">
          <NavLink href="/admin">Overview</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
          <NavLink href="/admin/areas">Areas &amp; topics</NavLink>
          <NavLink href="/admin/subjects">Subjects</NavLink>
          <NavLink href="/admin/candidates">Candidates</NavLink>
          <NavLink href="/admin/reports">Reports</NavLink>
          <NavLink href="/admin/settings">Settings</NavLink>
          {session.user.role === "ADMIN" ? <NavLink href="/admin/tenants">Tenants</NavLink> : null}
        </nav>
      </div>
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-2">
          <p className="mono-meta text-muted-foreground">CONTENT TENANT</p>
          <p className="font-mono text-xs text-foreground"><span className="font-bold">{tenant.name}</span> · /{tenant.slug} · {tenant.language}</p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
