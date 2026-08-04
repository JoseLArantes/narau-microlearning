"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "./i18n-context";
import { SUPPORTED_LOCALES, TENANTS } from "@/lib/i18n";

export function TenantSwitcher({ className = "" }: { className?: string }) {
  const { tenantId, switchTenant, isPending } = useI18n();

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground ${className}`}>
      <Globe className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      <select
        value={tenantId}
        onChange={(e) => switchTenant(e.target.value)}
        disabled={isPending}
        className="bg-transparent py-1 pr-2 text-xs font-medium text-foreground cursor-pointer outline-none transition-colors hover:text-accent-foreground disabled:opacity-50"
        aria-label="Select Tenant Language"
      >
        {SUPPORTED_LOCALES.map((locale) => {
          const tInfo = TENANTS[locale];
          return (
            <option key={locale} value={locale} className="bg-background text-foreground">
              {tInfo?.name ?? locale.toUpperCase()} ({locale.toUpperCase()})
            </option>
          );
        })}
      </select>
    </div>
  );
}
