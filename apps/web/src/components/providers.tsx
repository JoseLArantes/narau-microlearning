"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import * as React from "react";
import { I18nProvider } from "./i18n-context";

export function Providers({
  children,
  initialTenant,
  tenants,
}: {
  children: React.ReactNode;
  initialTenant: Parameters<typeof I18nProvider>[0]["initialTenant"];
  tenants: Parameters<typeof I18nProvider>[0]["tenants"];
}): React.ReactElement {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialTenant={initialTenant} tenants={tenants}>{children}</I18nProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
