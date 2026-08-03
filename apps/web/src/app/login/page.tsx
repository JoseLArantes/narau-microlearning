"use client";

import { Button, Input, Label } from "@dailycurio/ui";
import { signIn } from "next-auth/react";
import Link from "next/link";
import * as React from "react";

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

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
        <div className="space-y-4">
          <h1 className="font-serif text-3xl tracking-tight">Check your inbox</h1>
          <p className="text-muted-foreground">
            We sent a sign-in link to <strong className="text-foreground">{email}</strong>. It
            expires shortly, so use it soon.
          </p>
          <p className="text-sm text-muted-foreground">
            In local development, open{" "}
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Mailpit
            </a>{" "}
            to see the message.
          </p>
          <div>
            <Button variant="ghost" onClick={() => setSent(false)}>
              Send again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="font-serif text-lg tracking-tight">Daily Curio</p>
          <h1 className="font-serif text-3xl tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a magic link.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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

        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            Request a link with your email
          </Link>{" "}
          and you&apos;ll have an account when you return.
        </p>
      </div>
    </main>
  );
}
