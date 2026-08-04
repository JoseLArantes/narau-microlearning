import { Badge } from "@narau/ui";
import type { ReactElement } from "react";
import { fitToReadingTime } from "@/lib/reading-time";
import { MarkLearnedButton } from "./mark-learned-button";
import { MarkViewed } from "./mark-viewed";
import { RatingDialog } from "./rating-dialog";
import { ReportDialog } from "./report-dialog";
import { SkipButton } from "./skip-button";

type Item = NonNullable<Awaited<ReturnType<typeof import("@/server/services/today").TodayService.getCurrentItem>>>;

function cardDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export function DailyItem({
  item,
  readingMinutes,
}: {
  item: Item;
  readingMinutes: number;
}): ReactElement {
  const isLearned = item.status === "LEARNED";
  const isViewed = item.status === "VIEWED" || isLearned;
  const fitted = fitToReadingTime(item.subject.summary, readingMinutes);

  return (
    <article className="index-card relative px-6 py-10 sm:px-10 sm:py-12">
      <span className="guide-tab">{item.area.name}</span>

      <MarkViewed itemId={item.id} enabled={item.status === "PENDING"} />

      <header>
        <div className="mono-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          <span>CARD</span>
          <span aria-hidden>·</span>
          <span>{cardDate(item.contentDate)}</span>
          <span aria-hidden>·</span>
          <span>{fitted.minutes} MIN READ</span>
        </div>
        <h1 className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          {item.subject.title}
        </h1>
        {item.subject.hook ? (
          <p className="mt-3 font-serif text-lg italic text-muted-foreground">{item.subject.hook}</p>
        ) : null}
      </header>

      {item.subject.imageUrl ? (
        <figure className="mt-8 overflow-hidden rounded-[calc(var(--radius)+3px)] border border-border bg-background/50">
          <img
            src={item.subject.imageUrl}
            alt={`Illustration for ${item.subject.title}`}
            className="aspect-[16/9] w-full object-cover"
          />
          <figcaption className="border-t border-border px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {item.subject.imageAttribution ?? "Illustration from Wikipedia"}
            {item.subject.imageLicense ? ` · ${item.subject.imageLicense}` : ""}
          </figcaption>
        </figure>
      ) : null}

      <p className="measure mt-8 font-serif text-[1.05rem] leading-7">{fitted.text}</p>

      <footer className="mt-10 space-y-6 border-t border-border pt-6">
        <div className="mono-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          <span>SEE ALSO</span>
          <span aria-hidden>·</span>
          <a
            href={item.subject.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-[hsl(var(--accent))]"
          >
            Read the full article
          </a>
          <span aria-hidden>·</span>
          <span>
            Source: Wikipedia{item.subject.license ? ` · ${item.subject.license}` : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLearned ? (
            <>
              <Badge variant="stamped">LEARNED · {cardDate(item.learnedAt ?? item.contentDate)}</Badge>
              <RatingDialog itemId={item.id} />
            </>
          ) : (
            <>
              <MarkLearnedButton itemId={item.id} contentDate={item.contentDate} />
              <SkipButton itemId={item.id} />
            </>
          )}
          {item.rating ? <Badge variant="muted">RATED {item.rating}/5</Badge> : null}
          <span className="flex-1" />
          <ReportDialog subjectId={item.subjectId} itemId={item.id} />
        </div>
        {isViewed && !isLearned ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            Read it, then stamp it learned — or skip it.
          </p>
        ) : null}
      </footer>
    </article>
  );
}
