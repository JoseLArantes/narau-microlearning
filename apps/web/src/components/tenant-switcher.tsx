"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Globe } from "lucide-react";
import { useI18n } from "./i18n-context";

export function TenantSwitcher({ className = "" }: { className?: string }) {
  const { tenant, tenants, switchTenant, isPending } = useI18n();
  const { data: session } = useSession();
  const visibleTenants = session?.user?.role === "ADMIN" ? tenants : tenants.filter((entry) => entry.id === tenant.id);

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground ${className}`}>
      <Globe className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      <select
        value={tenant.slug}
        onChange={(e) => switchTenant(e.target.value)}
        disabled={isPending}
        className="bg-transparent py-1 pr-2 text-xs font-medium text-foreground cursor-pointer outline-none transition-colors hover:text-accent-foreground disabled:opacity-50"
        aria-label="Select Tenant Language"
      >
        {visibleTenants.map((tInfo) => {
          return (
            <option key={tInfo.slug} value={tInfo.slug} className="bg-background text-foreground">
              {tInfo.name} ({tInfo.slug.toUpperCase()})
            </option>
          );
        })}
      </select>
    </div>
  );
}
