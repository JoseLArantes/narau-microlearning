import { Badge } from "@dailycurio/ui";
import type { ReactElement } from "react";
import { MarkLearnedButton } from "./mark-learned-button";
import { MarkViewed } from "./mark-viewed";
import { RatingDialog } from "./rating-dialog";
import { ReportDialog } from "./report-dialog";

type Item = NonNullable<Awaited<ReturnType<typeof import("@/server/services/today").TodayService.getCurrentItem>>>;

function readingMinutes(summary: string): number {
  const words = summary.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function DailyItem({ item }: { item: Item }): ReactElement {
  const isLearned = item.status === "LEARNED";
  const isViewed = item.status === "VIEWED" || isLearned;

  return (
    <article className="space-y-8">
      <MarkViewed itemId={item.id} enabled={item.status === "PENDING"} />

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{item.area.name}</Badge>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {readingMinutes(item.subject.summary)} min read
          </span>
        </div>
        <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          {item.subject.title}
        </h1>
        {item.subject.hook ? (
          <p className="font-serif text-lg italic text-muted-foreground">{item.subject.hook}</p>
        ) : null}
      </header>

      {item.subject.imageUrl ? (
        <figure className="overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-card">
          <img
            src={item.subject.imageUrl}
            alt={`Illustration for ${item.subject.title}`}
            className="aspect-[16/9] w-full object-cover"
          />
          <figcaption className="px-4 py-2 text-xs text-muted-foreground">
            {item.subject.imageAttribution ?? "Illustration from Wikipedia"}
            {item.subject.imageLicense ? ` · ${item.subject.imageLicense}` : ""}
          </figcaption>
        </figure>
      ) : null}

      <p className="measure text-[1.05rem] leading-7">{item.subject.summary}</p>

      <footer className="space-y-6 border-t border-border pt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <a
            href={item.subject.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Read the full article
          </a>
          <span aria-hidden>·</span>
          <span>
            Source: Wikipedia{item.subject.license ? ` (${item.subject.license})` : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLearned ? (
            <>
              <Badge variant="secondary">Learned</Badge>
              <RatingDialog itemId={item.id} />
            </>
          ) : (
            <MarkLearnedButton itemId={item.id} />
          )}
          {item.rating ? <Badge variant="muted">Rated {item.rating}/5</Badge> : null}
          <span className="flex-1" />
          <ReportDialog subjectId={item.subjectId} itemId={item.id} />
        </div>
        {isViewed && !isLearned ? (
          <p className="text-sm text-muted-foreground">Mark it learned once you&apos;ve read it.</p>
        ) : null}
      </footer>
    </article>
  );
}
