import { requireUser } from "@/server/guards";
import { TodayService } from "@/server/services/today";
import { getDefaultReadingMinutes } from "@/server/services/app-settings";
import { AppHeader } from "@/components/layout/app-header";
import { DailyItem } from "@/components/today/daily-item";
import { EmptyState } from "@narau/ui";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function TodayPage(): Promise<ReactElement> {
  const session = await requireUser();
  if (!session.hasAreas) {
    redirect("/onboarding");
  }
  const item = await TodayService.getCurrentItem(session.user.id);
  const readingMinutes = await getDefaultReadingMinutes();

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        {!item ? (
          <EmptyState
            title="Nothing in today’s stack"
            description="The daily item for your areas has not been generated yet. The worker usually creates it early in the morning — check back later, or ask an administrator to run the jobs."
          />
        ) : item.status === "SKIPPED" ? (
          <div className="index-card relative px-6 py-12 text-center sm:px-10">
            <span className="mono-meta text-muted-foreground">CARD SET ASIDE</span>
            <h1 className="mt-3 font-serif text-2xl tracking-tight">You skipped today&apos;s card.</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              No problem — nothing is counted against you. Tomorrow&apos;s card is
              already being pulled for your areas.
            </p>
          </div>
        ) : (
          <DailyItem item={item} readingMinutes={readingMinutes} />
        )}
      </main>
    </div>
  );
}
