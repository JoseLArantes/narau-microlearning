import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/guards";
import { getHistory } from "@/server/services/dashboard";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Card } from "@narau/ui";
import { track } from "@/server/tracking";

export default async function DashboardPage(): Promise<ReactElement> {
  const session = await requireUser();
  if (!session.hasAreas) {
    redirect("/onboarding");
  }
  const history = await getHistory(session.user.id);
  await track(session.user.id, "DASHBOARD_VIEWED");

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12">
        <header className="space-y-2">
          <span className="mono-meta text-muted-foreground">YOUR DRAWER</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Your dashboard</h1>
          <p className="text-muted-foreground">Everything you&apos;ve learned, area by area. Pull a tab to review.</p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2">
          <Card className="px-6 py-6">
            <p className="mono-meta text-muted-foreground">TOTAL · STAMPED</p>
            <p className="mt-3 font-serif text-5xl font-normal tracking-tight">{history.totalLearned}</p>
            <p className="mono-meta mt-3 text-muted-foreground">THINGS LEARNED</p>
          </Card>
          <Card className="px-6 py-6">
            <p className="mono-meta text-muted-foreground">STREAK · CURRENT</p>
            <p className="mt-3 font-serif text-5xl font-normal tracking-tight">{history.currentStreak}</p>
            <p className="mono-meta mt-3 text-muted-foreground">
              DAY{history.currentStreak === 1 ? "" : "S"} IN A ROW
            </p>
          </Card>
        </section>

        <DashboardView history={history} />
      </main>
    </div>
  );
}
