import Link from "next/link";
import type { ReactElement } from "react";
import { auth } from "@/server/auth";
import { NavLink } from "./nav-link";
import { SignOutButton } from "./sign-out-button";

export async function AppHeader(): Promise<ReactElement> {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/today" className="font-serif text-base tracking-tight">
            Daily Curio
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/today">Today</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/settings">Settings</NavLink>
            {isAdmin ? <NavLink href="/admin">Admin</NavLink> : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {session?.user?.email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
