import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@dailycurio/ui";

export default function LandingPage(): ReactElement {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <p className="font-serif text-lg tracking-tight">Daily Curio</p>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24 pt-12">
        <h1 className="max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
          One small, well-sourced thing to learn every day.
        </h1>
        <p className="measure mt-6 text-lg leading-relaxed text-muted-foreground">
          Choose the subjects that hold your attention. Each morning you get a single
          Wikipedia reading, carefully selected, attributed, and brief enough to finish
          with your coffee.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">
              Start learning <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10 text-xs text-muted-foreground">
        <p>
          Content from Wikipedia, licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            className="underline underline-offset-2 hover:text-foreground"
          >
            CC BY-SA 4.0
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
