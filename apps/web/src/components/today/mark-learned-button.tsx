"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { markTodayLearned } from "@/server/actions/today";

function stampDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export function MarkLearnedButton({
  itemId,
  contentDate,
}: {
  itemId: string;
  contentDate: Date;
}): React.ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [stamped, setStamped] = React.useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markTodayLearned(itemId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setStamped(true);
            setTimeout(() => router.refresh(), 720);
          });
        }}
        className="-rotate-2 inline-flex items-center gap-2 rounded-[3px] border-[3px] border-[hsl(var(--accent))] bg-transparent px-4 py-2 font-mono text-sm font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))] shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.3)] transition-transform hover:-rotate-1 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Stamping…" : "I learned this"}
      </button>

      {stamped ? (
        <div role="status" aria-live="assertive">
          <span className="rubber-stamp whitespace-pre-line text-emerald-600 border-emerald-600">
            {`LEARNED\n${stampDate(contentDate)}`}
          </span>
        </div>
      ) : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
