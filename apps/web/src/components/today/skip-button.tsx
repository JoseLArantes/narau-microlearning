"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { skipTodayItem } from "@/server/actions/today";

export function SkipButton({ itemId }: { itemId: string }): React.ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await skipTodayItem(itemId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-[3px] border border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Skipping…" : "Skip this card"}
      </button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
