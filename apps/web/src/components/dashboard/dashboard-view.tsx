"use client";

import { Card, CardContent, EmptyState } from "@narau/ui";
import * as React from "react";
import { cn } from "@narau/ui";
import Link from "next/link";
import { useI18n } from "../i18n-context";
import { dashboardCardPath } from "@/lib/dashboard-links";

interface HistoryEntry {
  id: string;
  title: string;
  areaName?: string;
  learnedAt: Date | null;
  rating?: number | null;
}

interface AreaHistory {
  area: { id: string; name: string; slug: string; color: string | null };
  learned: HistoryEntry[];
}

interface DashboardHistory {
  totalLearned: number;
  currentStreak: number;
  recent: HistoryEntry[];
  byArea: AreaHistory[];
}

function learnedDate(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

export function DashboardView({ history }: { history: DashboardHistory }): React.ReactElement {
  const [selected, setSelected] = React.useState<string | null>(null);
  const { tenant } = useI18n();
  const active = selected ? history.byArea.find((group) => group.area.id === selected) : null;
  const cardHref = (itemId: string): string => dashboardCardPath(tenant.slug, itemId);

  const areaPills = [
    { id: null, name: "All", count: history.totalLearned },
    ...history.byArea.map((group) => ({
      id: group.area.id,
      name: group.area.name,
      count: group.learned.length,
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {areaPills.map((pill) => (
          <button
            key={pill.id ?? "all"}
            type="button"
            onClick={() => setSelected(pill.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[3px] border px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected === pill.id
                ? "border-[hsl(var(--primary))] bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {pill.name}
            <span className={selected === pill.id ? "opacity-70" : "opacity-60"}>{pill.count}</span>
          </button>
        ))}
      </div>

      {active ? (
        <section className="space-y-4">
          <h2 className="font-serif text-xl tracking-tight">{active.area.name}</h2>
          <Card className="relative px-6 py-5">
            <span className="guide-tab">{active.area.name}</span>
            <div className="pt-2">
              {active.learned.length === 0 ? (
                <p className="py-4 font-mono text-xs text-muted-foreground">NOTHING LEARNED HERE YET.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {active.learned.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                      <Link
                        href={cardHref(entry.id)}
                        className="min-w-0 truncate font-serif text-[0.98rem] underline-offset-4 hover:underline"
                      >
                        {entry.title}
                      </Link>
                      <span className="mono-meta shrink-0 text-muted-foreground">
                        {entry.rating ? `★ ${entry.rating}/5 · ` : ""}
                        {learnedDate(entry.learnedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </section>
      ) : history.totalLearned === 0 ? (
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
                    <Link
                      key={entry.id}
                      href={cardHref(entry.id)}
                      className="group flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[1.02rem] group-hover:underline group-hover:underline-offset-4">
                          {entry.title}
                        </p>
                        <p className="mono-meta mt-0.5 text-muted-foreground">
                          {entry.areaName}
                          {entry.learnedAt ? ` · ${learnedDate(entry.learnedAt)}` : ""}
                        </p>
                      </div>
                      <span className="mono-meta shrink-0 text-foreground underline underline-offset-4">
                        READ CARD
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </section>
          ) : null}

          <section className="space-y-6">
            <h2 className="font-serif text-xl tracking-tight">By area</h2>
            {history.byArea.map((group) => (
              <Card key={group.area.id} className="relative px-6 py-5">
                <span className="guide-tab">{group.area.name}</span>
                <div className="flex items-baseline justify-between pt-2">
                  <p className="font-serif text-lg tracking-tight">{group.area.name}</p>
                  <span className="mono-meta text-muted-foreground">{group.learned.length} LEARNED</span>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {group.learned.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                      <Link
                        href={cardHref(entry.id)}
                        className="min-w-0 truncate font-serif text-[0.98rem] underline-offset-4 hover:underline"
                      >
                        {entry.title}
                      </Link>
                      <span className="mono-meta shrink-0 text-muted-foreground">
                        {entry.rating ? `★ ${entry.rating}/5 · ` : ""}
                        {learnedDate(entry.learnedAt)}
                      </span>
                    </div>
                  ))}
                  {group.learned.length === 0 ? (
                    <p className="py-4 font-mono text-xs text-muted-foreground">NOTHING YET.</p>
                  ) : null}
                </div>
              </Card>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
