"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@narau/ui";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

interface MobileNavLink {
  href: string;
  label: string;
}

export function MobileNav({ isAdmin }: { isAdmin: boolean }): React.ReactElement {
  const pathname = usePathname();
  const { tenant } = useI18n();
  const [open, setOpen] = React.useState(false);

  const links: MobileNavLink[] = [
    { href: "/today", label: "Today" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  React.useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-9 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <nav
            role="menu"
            aria-label="Navigation"
            className="absolute right-0 top-11 z-50 w-60 rounded-[calc(var(--radius)+3px)] border border-border bg-card p-1.5 shadow-[0_1px_2px_rgba(48,34,12,0.1),0_16px_36px_-14px_rgba(48,34,12,0.4)]"
          >
            {links.map((link) => {
              const resolvedHref = tenantPath(tenant.slug, link.href);
              const active = pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
              return (
                <Link
                  key={link.href}
                  href={resolvedHref}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-[3px] px-3 py-2.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "bg-primary/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-1 border-t border-border" />
            <p className="px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/80">
              One card a day
            </p>
          </nav>
        </>
      ) : null}
    </div>
  );
}
