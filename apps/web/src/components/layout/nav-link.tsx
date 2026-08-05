"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@narau/ui";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const { tenant } = useI18n();
  const resolvedHref = tenantPath(tenant.slug, href);
  const active = pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
  return (
    <Link
      href={resolvedHref}
      className={cn(
        "rounded-sm px-3 py-1.5 text-sm transition-colors hover:bg-secondary hover:text-foreground",
        active
          ? "font-medium text-foreground underline decoration-primary decoration-2 underline-offset-8"
          : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}
