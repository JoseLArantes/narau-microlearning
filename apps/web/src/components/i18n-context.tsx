"use client";

import React, { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { DEFAULT_LOCALE, translate, type TenantInfo } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { tenantPath } from "@/server/tenant-routing";

interface I18nContextType {
  locale: string;
  tenantId: string;
  tenant: TenantInfo;
  tenants: TenantInfo[];
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
  switchTenant: (newTenantSlug: string) => void;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  initialTenant,
  tenants,
  children,
}: {
  initialTenant: TenantInfo;
  tenants: TenantInfo[];
  children: ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const [tenant, setTenant] = useState<TenantInfo>(initialTenant);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTenant(initialTenant);
  }, [initialTenant]);

  const locale = tenant.language || DEFAULT_LOCALE;

  const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    return translate(locale, key, params, fallback);
  };

  const handleSwitchTenant = (newTenantSlug: string): void => {
    const nextTenant = tenants.find((entry) => entry.slug === newTenantSlug);
    if (!nextTenant) return;
    startTransition(async () => {
      setTenant(nextTenant);
      window.location.assign(tenantPath(newTenantSlug, pathname));
    });
  };

  return (
    <I18nContext.Provider value={{ locale, tenantId: tenant.id, tenant, tenants, t, switchTenant: handleSwitchTenant, isPending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: DEFAULT_LOCALE,
      tenantId: DEFAULT_LOCALE,
      tenant: { id: "en", slug: "en", name: "English", language: DEFAULT_LOCALE },
      tenants: [],
      t: (key: string, params?: Record<string, string | number>, fallback?: string) =>
        translate(DEFAULT_LOCALE, key, params, fallback),
      switchTenant: () => {},
      isPending: false,
    };
  }
  return context;
}
