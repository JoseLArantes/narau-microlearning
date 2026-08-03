"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@dailycurio/ui";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "rounded-sm px-3 py-1.5 text-sm transition-colors hover:bg-secondary hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}
