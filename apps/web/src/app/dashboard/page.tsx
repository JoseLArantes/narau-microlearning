import type { ReactElement } from "react";
import { requireUser } from "@/server/guards";
import { getHistory } from "@/server/services/dashboard";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@dailycurio/ui";
import { track } from "@/server/tracking";

export default async function DashboardPage(): Promise<ReactElement> {
  const session = await requireUser();
  const history = await getHistory(session.user.id);
  await track(session.user.id, "DASHBOARD_VIEWED");

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12">
        <header className="space-y-2">
          <h1 className="font-serif text-3xl tracking-tight">Your dashboard</h1>
          <p className="text-muted-foreground">Everything you&apos;ve learned, area by area.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-normal">{history.totalLearned}</CardTitle>
              <CardTitle className="text-base">things learned</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-normal">{history.currentStreak}</CardTitle>
              <CardTitle className="text-base">day{history.currentStreak === 1 ? "" : "s"} in a row</CardTitle>
            </CardHeader>
          </Card>
        </section>

        {history.totalLearned === 0 ? (
          <EmptyState
            title="Nothing learned yet"
            description="Finish today's reading and it will show up here, grouped by area."
          />
        ) : (
          <>
            {history.recent.length > 0 ? (
              <section className="space-y-4">
                <h2 className="font-serif text-xl tracking-tight">Recent</h2>
                <Card>
                  <CardContent className="divide-y divide-border p-0">
                    {history.recent.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-4 px-6 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{entry.title}</p>
                          <p className="text-sm text-muted-foreground">{entry.areaName}</p>
                        </div>
                        <a
                          href={entry.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-sm underline underline-offset-2 hover:text-foreground"
                        >
                          Source
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <section className="space-y-6">
              <h2 className="font-serif text-xl tracking-tight">By area</h2>
              {history.byArea.map((group) => (
                <Card key={group.area.id}>
                  <CardHeader className="flex-row items-baseline justify-between">
                    <CardTitle className="text-lg">{group.area.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {group.learned.length} learned
                    </span>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                    {group.learned.slice(0, 20).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-4 py-3">
                        <a
                          href={entry.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 truncate hover:underline underline-offset-2"
                        >
                          {entry.title}
                        </a>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {entry.rating ? `★ ${entry.rating}/5` : ""}
                        </span>
                      </div>
                    ))}
                    {group.learned.length === 0 ? (
                      <p className="py-4 text-sm text-muted-foreground">Nothing yet.</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
