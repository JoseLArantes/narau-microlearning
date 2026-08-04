"use client";

import { Button, Input, Label } from "@narau/ui";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/today");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return <main className="min-h-dvh" />;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await signIn("email", { email, redirect: false });
    setPending(false);
    if (result?.error) {
      setError("Could not send the sign-in link. Check the address and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
        <div className="index-card relative px-8 py-10">
          <span className="mono-meta text-muted-foreground">SIGN-IN SLIP</span>
          <h1 className="mt-3 font-serif text-3xl tracking-tight">Check your inbox</h1>
          <p className="mt-4 text-muted-foreground">
            We sent a sign-in link to <strong className="text-foreground">{email}</strong>. It
            expires shortly, so use it soon.
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            In local development, open{" "}
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Mailpit
            </a>{" "}
            to see the message.
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <Button variant="ghost" onClick={() => setSent(false)}>
              Send again
            </Button>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute right-6 top-6 -rotate-6 rounded-[3px] border-[3px] border-[hsl(var(--accent))] px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))]"
          >
            SENT
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="index-card px-8 py-10">
        <div className="space-y-2">
          <span className="mono-meta text-muted-foreground">READER&apos;S SIGN-IN</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Narau</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a magic link to your inbox.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="mono-meta text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending || !email}>
            {pending ? "Sending…" : "Send sign-in link"}
          </Button>
        </form>

        <p className="mt-6 border-t border-border pt-5 font-mono text-xs leading-relaxed text-muted-foreground">
          New here? Request a link with your email and you&apos;ll have an account
          when you return.
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link href="/" className="mono-meta text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Back to the reading room
        </Link>
      </p>
    </main>
  );
}
