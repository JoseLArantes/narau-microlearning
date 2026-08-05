import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@narau/ui";
import { Logo } from "@/components/layout/logo";
import { getRequestTenant } from "@/server/tenant";
import { tenantPath } from "@/server/tenant-routing";

function LandingCard(): ReactElement {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div aria-hidden className="absolute inset-0 rotate-[-5deg] translate-x-3 translate-y-2 rounded-[calc(var(--radius)+5px)] border border-border bg-card/70" />
      <div aria-hidden className="absolute inset-0 rotate-[4deg] -translate-x-2 translate-y-1 rounded-[calc(var(--radius)+5px)] border border-border bg-card/80" />
      <div className="index-card relative -rotate-1 px-6 py-8">
        <span className="guide-tab">Science</span>
        <div className="mono-meta flex items-center justify-between gap-2 text-muted-foreground">
          <span>SAMPLE CARD</span>
          <span>3 MIN READ</span>
        </div>
        <h3 className="mt-4 font-serif text-2xl leading-tight tracking-tight">
          The quiet invention of the card catalogue
        </h3>
        <p className="mt-3 font-serif text-[0.95rem] leading-6 text-muted-foreground">
          Before search, before the web, a librarian&apos;s drawer held every
          subject in the world — one card, one idea, one careful cross-reference
          at a time.
        </p>
        <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
          <span className="mono-meta text-muted-foreground">SEE ALSO · Source: Wikipedia</span>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 top-8 -rotate-12 rounded-[3px] border-[3px] border-[hsl(var(--accent))] bg-background/60 px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))]"
        >
          LEARNED · AUG 3
        </span>
      </div>
    </div>
  );
}

export default async function LandingPage(): Promise<ReactElement> {
  const tenant = await getRequestTenant();
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-secondary/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-3">
            <Logo className="w-[80%] max-w-[140px] h-auto" />
            <p className="mono-meta text-muted-foreground hidden sm:block">
              <span aria-hidden>·</span> THE DAILY CARD <span aria-hidden>·</span> ONE WELL-SOURCED THING A DAY
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={tenantPath(tenant.slug, "/login")}>Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="max-w-xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            What did you learn today?
          </h1>
          <p className="measure mt-6 text-lg leading-relaxed text-muted-foreground">
            Narau helps you answer that, every day. Each morning a curator files
            one well-sourced card on your desk — a single Wikipedia reading from
            the areas you care about. Read it, stamp it learned, and watch your
            drawer of learning grow, one new thing at a time.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={tenantPath(tenant.slug, "/login")}>
                Start learning <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how">How it works</Link>
            </Button>
          </div>
        </div>
        <LandingCard />
      </section>

      <section id="how" className="border-t border-border bg-background/60">
        <div className="mx-auto w-full max-w-5xl px-6 pt-14">
          <h2 className="font-serif text-3xl tracking-tight">How it works</h2>
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-5 px-6 pb-14 pt-6 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Pull your tabs",
              body: "Choose the areas you want to read about — science, history, art, and more.",
            },
            {
              n: "02",
              title: "A card arrives each morning",
              body: "One carefully selected reading per day, curated and attributed from Wikipedia.",
            },
            {
              n: "03",
              title: "Read, stamp, move on",
              body: "Finish the card, stamp it learned, and watch your drawer of learning grow.",
            },
          ].map((step) => (
            <div key={step.n} className="index-card px-6 py-7">
              <p className="mono-meta text-muted-foreground">{step.n}</p>
              <h3 className="mt-3 font-serif text-xl tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-meta text-muted-foreground">
            Content from Wikipedia, licensed under CC BY-SA 4.0 — nothing fabricated.
          </p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            className="mono-meta text-foreground underline underline-offset-4 hover:text-[hsl(var(--accent))]"
          >
            Read the license
          </a>
        </div>
      </footer>
    </main>
  );
}
