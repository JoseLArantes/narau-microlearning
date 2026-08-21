"use client";

import { Button, Input, Label } from "@narau/ui";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Logo } from "@/components/layout/logo";
import { useI18n } from "@/components/i18n-context";
import { tenantPath } from "@/server/tenant-routing";

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { tenant } = useI18n();
  const { status } = useSession();
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [socialPending, setSocialPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace(tenantPath(tenant.slug, "/today"));
    }
  }, [status, router, tenant.slug]);

  if (status === "authenticated") {
    return <main className="min-h-dvh" />;
  }

  async function handleSocialSignIn(provider: string): Promise<void> {
    setSocialPending(provider);
    setError(null);
    document.cookie = `narau_tenant=${tenant.slug}; Path=/; Max-Age=31536000; SameSite=Lax`;
    await signIn(provider, {
      callbackUrl: tenantPath(tenant.slug, "/today"),
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    document.cookie = `narau_tenant=${tenant.slug}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: tenantPath(tenant.slug, "/today"),
    });
    setPending(false);
    if (result?.error) {
      setError("Could not send the sign-in link. Check the address and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    const isLocalDev = process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_APP_URL;

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
        <div className="index-card relative px-8 py-10">
          <div className="space-y-2">
            <span className="mono-meta text-muted-foreground">SIGN-IN SLIP</span>
            <div className="mt-2">
              <Logo className="w-[80%] max-w-[200px] h-auto" />
            </div>
          </div>
          <h1 className="mt-4 font-serif text-3xl tracking-tight">Check your inbox</h1>
          <p className="mt-4 text-muted-foreground">
            We sent a sign-in link to <strong className="text-foreground">{email}</strong>. It
            expires shortly, so use it soon.
          </p>
          {isLocalDev ? (
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
          ) : null}
          <div className="mt-6 border-t border-border pt-6">
            <Button variant="ghost" onClick={() => setSent(false)}>
              Send again
            </Button>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute right-6 top-6 -rotate-6 rounded-[3px] border-[3px] border-[#16A34A] px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#16A34A]"
          >
            SENT
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="index-card px-8 py-10">
        <div className="space-y-2">
          <span className="mono-meta text-muted-foreground">LEARNER&apos;S SIGN-IN</span>
          <div className="mt-2">
            <Logo className="w-[80%] max-w-[200px] h-auto" />
          </div>
          <p className="text-sm text-muted-foreground">
          </p>
        </div>

        {/* Social Sign In Options */}
        <div className="mt-6 space-y-2.5">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 font-mono text-xs uppercase tracking-wider"
            disabled={Boolean(socialPending || pending)}
            onClick={() => handleSocialSignIn("google")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {socialPending === "google" ? "Connecting Google…" : "Continue with Google"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 font-mono text-xs uppercase tracking-wider"
            disabled={Boolean(socialPending || pending)}
            onClick={() => handleSocialSignIn("facebook")}
          >
            <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {socialPending === "facebook" ? "Connecting Facebook…" : "Continue with Facebook / IG"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 font-mono text-xs uppercase tracking-wider"
            disabled={Boolean(socialPending || pending)}
            onClick={() => handleSocialSignIn("twitter")}
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {socialPending === "twitter" ? "Connecting Twitter…" : "Continue with Twitter"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 font-mono text-xs uppercase tracking-wider"
            disabled={Boolean(socialPending || pending)}
            onClick={() => handleSocialSignIn("linkedin")}
          >
            <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
            </svg>
            {socialPending === "linkedin" ? "Connecting LinkedIn…" : "Continue with LinkedIn"}
          </Button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-[#F9F7F0] px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            OR SIGN IN WITH EMAIL
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="mono-meta text-muted-foreground">
              Email Address
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
          New here? Sign in with your social account or email and your account will be created automatically.
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link href={tenantPath(tenant.slug, "/")} className="mono-meta text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Back to the reading room
        </Link>
      </p>
    </main>
  );
}
