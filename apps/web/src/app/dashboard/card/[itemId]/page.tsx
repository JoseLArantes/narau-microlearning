import type { ReactElement } from "react";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DailyItem } from "@/components/today/daily-item";
import { getDefaultReadingMinutes } from "@/server/services/app-settings";
import { requireUser } from "@/server/guards";
import { findUserItem } from "@/server/repositories/user-items";
import { getRequestTenant } from "@/server/tenant";
import { tenantPath } from "@/server/tenant-routing";

export default async function DashboardCardPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}): Promise<ReactElement> {
  const session = await requireUser();
  const tenant = await getRequestTenant();
  if (!session.hasAreas) {
    redirect(tenantPath(tenant.slug, "/onboarding"));
  }

  const { itemId } = await params;
  const [item, readingMinutes] = await Promise.all([
    findUserItem(itemId, session.user.id, tenant.id),
    getDefaultReadingMinutes(),
  ]);

  if (!item || item.status !== "LEARNED") notFound();

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <DailyItem
          item={item}
          readingMinutes={readingMinutes}
          locale={tenant.language || "en"}
          readOnly
        />
      </main>
    </div>
  );
}
