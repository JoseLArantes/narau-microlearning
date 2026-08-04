"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@narau/ui";
import { Star } from "lucide-react";
import * as React from "react";
import { useTransition } from "react";
import { cn } from "@narau/ui";
import { rateTodayItem } from "@/server/actions/today";

export function RatingDialog({ itemId }: { itemId: string }): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    startTransition(async () => {
      const result = await rateTodayItem({ itemId, rating, comment: comment || undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setDone(false); setRating(0); setComment(""); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="secondary">Rate it</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{done ? "Thank you" : "How was it?"}</DialogTitle>
          <DialogDescription>
            {done
              ? "Your rating is saved. It helps us pick better readings."
              : "Your honest opinion helps us choose what to read to you next."}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setRating(value)}
                  className={cn(
                    "rounded-sm p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    rating >= value ? "text-[hsl(var(--primary))]" : "text-muted-foreground/40",
                  )}
                >
                  <Star className="size-6 fill-current" />
                </button>
              ))}
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Comment (optional)</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="What worked, what didn't?"
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={pending || rating === 0}>
                {pending ? "Saving…" : "Submit rating"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
