"use client";

import { Button } from "@narau/ui";
import { READING_MINUTE_OPTIONS } from "@/lib/reading-time";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { cn } from "@narau/ui";
import { adminUpdateReadingMinutes } from "@/server/actions/admin/settings";

export function ReadingTimeControl({ current }: { current: number }): React.ReactElement {
  const router = useRouter();
  const [selected, setSelected] = React.useState<number>(current);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function save(): void {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateReadingMinutes(selected);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Saved. New cards are sized to this reading time.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {READING_MINUTE_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => setSelected(minutes)}
            className={cn(
              "rounded-[3px] border px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected === minutes
                ? "border-[hsl(var(--primary))] bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {minutes} min
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending || selected === current}>
          {pending ? "Saving…" : "Save reading time"}
        </Button>
        {message ? <p className="font-mono text-xs text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
