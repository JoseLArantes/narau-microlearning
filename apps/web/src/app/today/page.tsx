import { requireUser } from "@/server/guards";
import { TodayService } from "@/server/services/today";
import { AppHeader } from "@/components/layout/app-header";
import { DailyItem } from "@/components/today/daily-item";
import { EmptyState } from "@dailycurio/ui";
import type { ReactElement } from "react";

export default async function TodayPage(): Promise<ReactElement> {
  const session = await requireUser();
  const item = await TodayService.getCurrentItem(session.user.id);

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        {item ? (
          <DailyItem item={item} />
        ) : (
          <EmptyState
            title="Nothing in today’s stack"
            description="The daily item for your areas has not been generated yet. The worker usually creates it early in the morning — check back later, or ask an administrator to run the jobs."
          />
        )}
      </main>
    </div>
  );
}
