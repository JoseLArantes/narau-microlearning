"use client";

import React, { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { DEFAULT_LOCALE, getTranslation, SUPPORTED_LOCALES, TENANTS, translate, type SupportedLocale, type TenantInfo } from "@/lib/i18n";
import { switchTenantAction } from "@/server/actions/tenant";

interface I18nContextType {
  locale: SupportedLocale;
  tenantId: string;
  tenant: TenantInfo;
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
  switchTenant: (newTenantId: string) => Promise<void>;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  initialTenantId = DEFAULT_LOCALE,
  children,
}: {
  initialTenantId?: string;
  children: ReactNode;
}) {
  const [tenantId, setTenantId] = useState<string>(
    SUPPORTED_LOCALES.includes(initialTenantId as SupportedLocale) ? initialTenantId : DEFAULT_LOCALE,
  );
  const [isPending, startTransition] = useTransition();

  const locale = (SUPPORTED_LOCALES.includes(tenantId as SupportedLocale) ? tenantId : DEFAULT_LOCALE) as SupportedLocale;
  const tenant: TenantInfo = TENANTS[locale] ?? TENANTS[DEFAULT_LOCALE] ?? { id: "en", name: "English", language: "en" };

  const t = (key: string, params?: Record<string, string | number>, fallback?: string) => {
    return translate(locale, key, params, fallback);
  };

  const handleSwitchTenant = async (newTenantId: string) => {
    if (!SUPPORTED_LOCALES.includes(newTenantId as SupportedLocale)) return;
    startTransition(async () => {
      setTenantId(newTenantId);
      await switchTenantAction(newTenantId);
      window.location.reload();
    });
  };

  return (
    <I18nContext.Provider value={{ locale, tenantId, tenant, t, switchTenant: handleSwitchTenant, isPending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: DEFAULT_LOCALE,
      tenantId: DEFAULT_LOCALE,
      tenant: TENANTS[DEFAULT_LOCALE]!,
      t: (key: string, params?: Record<string, string | number>, fallback?: string) =>
        translate(DEFAULT_LOCALE, key, params, fallback),
      switchTenant: async () => {},
      isPending: false,
    };
  }
  return context;
}
