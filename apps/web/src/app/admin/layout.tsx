import type { ReactElement, ReactNode } from "react";
import { requireAdmin } from "@/server/guards";
import { AppHeader } from "@/components/layout/app-header";
import { NavLink } from "@/components/layout/nav-link";

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  await requireAdmin();

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <div className="border-b border-border bg-card/60">
        <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-2">
          <NavLink href="/admin">Overview</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
          <NavLink href="/admin/areas">Areas</NavLink>
          <NavLink href="/admin/subjects">Subjects</NavLink>
          <NavLink href="/admin/reports">Reports</NavLink>
        </nav>
      </div>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
