"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import * as React from "react";
import { I18nProvider } from "./i18n-context";

function I18nSessionWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const initialTenantId = session?.user?.tenantId ?? "en";
  return <I18nProvider initialTenantId={initialTenantId}>{children}</I18nProvider>;
}

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <I18nSessionWrapper>{children}</I18nSessionWrapper>
      </QueryClientProvider>
    </SessionProvider>
  );
}
