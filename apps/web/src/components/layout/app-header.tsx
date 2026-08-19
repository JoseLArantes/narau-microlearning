import type { ReactElement } from "react";
import { auth } from "@/server/auth";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { SignOutButton } from "./sign-out-button";
import { TenantSwitcher } from "../tenant-switcher";
import { Logo } from "./logo";

function mastheadDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

export async function AppHeader(): Promise<ReactElement> {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="border-b border-border bg-secondary/60">
        <p className="mono-meta mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-1.5 text-muted-foreground">
          <span>
            THE DAILY CARD <span aria-hidden>·</span> VOL. I
          </span>
          <span className="hidden sm:inline">ONE WELL-SOURCED THING A DAY</span>
          <span>{mastheadDate()}</span>
        </p>
      </div>
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo className="w-[80%] max-w-[140px] h-auto" />
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/today">Today</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/settings">Settings</NavLink>
            {isAdmin ? <NavLink href="/admin">Admin</NavLink> : null}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <TenantSwitcher />
          <span className="hidden font-mono text-xs text-muted-foreground lg:inline">
            {session?.user?.email}
          </span>
          <SignOutButton />
          <MobileNav isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
