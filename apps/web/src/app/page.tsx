import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@narau/ui";
import { Logo } from "@/components/layout/logo";
import { translate } from "@/lib/i18n";
import { getRequestTenant } from "@/server/tenant";
import { tenantPath } from "@/server/tenant-routing";

function LandingCard({ locale }: { locale: string }): ReactElement {
  const t = (key: string, params?: Record<string, string | number>): string => translate(locale, key, params);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div aria-hidden className="absolute inset-0 rotate-[-5deg] translate-x-3 translate-y-2 rounded-[calc(var(--radius)+5px)] border border-border bg-card/70" />
      <div aria-hidden className="absolute inset-0 rotate-[4deg] -translate-x-2 translate-y-1 rounded-[calc(var(--radius)+5px)] border border-border bg-card/80" />
      <div className="index-card relative -rotate-1 px-6 py-8">
        <span className="guide-tab">{t("system.sampleArea")}</span>
        <div className="mono-meta flex items-center justify-between gap-2 text-muted-foreground">
          <span>{t("system.sampleCard")}</span>
          <span>{t("system.minutesRead", { minutes: 3 })}</span>
        </div>
        <h3 className="mt-4 font-serif text-2xl leading-tight tracking-tight">
          {t("landing.sampleTitle")}
        </h3>
        <p className="mt-3 font-serif text-[0.95rem] leading-6 text-muted-foreground">
          {t("landing.sampleBody")}
        </p>
        <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
          <span className="mono-meta text-muted-foreground">
            {t("system.seeAlso")} · {t("system.sourceWikipedia")}
          </span>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 top-8 -rotate-12 rounded-[3px] border-[3px] border-[hsl(var(--accent))] bg-background/60 px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))]"
        >
          {t("system.learnedStamp", { date: t("landing.sampleLearnedDate") })}
        </span>
      </div>
    </div>
  );
}

export default async function LandingPage(): Promise<ReactElement> {
  const tenant = await getRequestTenant();
  const locale = tenant.language || "en";
  const t = (key: string, params?: Record<string, string | number>): string => translate(locale, key, params);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-secondary/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-3">
            <Logo className="w-[80%] max-w-[140px] h-auto" />
            <p className="mono-meta text-muted-foreground hidden sm:block">
              <span aria-hidden>·</span> {t("system.masthead")} <span aria-hidden>·</span> {t("system.tagline")}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={tenantPath(tenant.slug, "/login")}>{t("system.signIn")}</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="max-w-xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="measure mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("landing.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={tenantPath(tenant.slug, "/login")}>
                {t("system.startLearning")} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how">{t("system.howItWorks")}</Link>
            </Button>
          </div>
        </div>
        <LandingCard locale={locale} />
      </section>

      <section id="how" className="border-t border-border bg-background/60">
        <div className="mx-auto w-full max-w-5xl px-6 pt-14">
          <h2 className="font-serif text-3xl tracking-tight">{t("landing.howTitle")}</h2>
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-5 px-6 pb-14 pt-6 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: t("landing.step1Title"),
              body: t("landing.step1Body"),
            },
            {
              n: "02",
              title: t("landing.step2Title"),
              body: t("landing.step2Body"),
            },
            {
              n: "03",
              title: t("landing.step3Title"),
              body: t("landing.step3Body"),
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
            {t("system.licenseNotice")}
          </p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            className="mono-meta text-foreground underline underline-offset-4 hover:text-[hsl(var(--accent))]"
          >
            {t("system.readLicense")}
          </a>
        </div>
      </footer>
    </main>
  );
}
