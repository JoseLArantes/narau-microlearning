"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@dailycurio/ui";
import { reportReasonSchema } from "@dailycurio/validation";
import * as React from "react";
import { useTransition } from "react";
import { reportTodayItem } from "@/server/actions/today";

const REASON_LABELS: Record<string, string> = {
  INACCURATE: "The summary is inaccurate",
  OUTDATED: "The information is outdated",
  OFFENSIVE: "The content is offensive",
  MISLEADING_SUMMARY: "The summary is misleading",
  BROKEN_SOURCE: "The source link is broken",
  COPYRIGHT: "Copyright concern",
  OTHER: "Something else",
};

export function ReportDialog({ subjectId, itemId }: { subjectId: string; itemId?: string }): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string>("");
  const [details, setDetails] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    const parsed = reportReasonSchema.safeParse(reason);
    if (!parsed.success) {
      setError("Choose a reason.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reportTodayItem({
        subjectId,
        itemId,
        reason: parsed.data,
        details: details || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDone(false);
          setReason("");
          setDetails("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Report a problem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{done ? "Report sent" : "Report a problem"}</DialogTitle>
          <DialogDescription>
            {done
              ? "Thanks — a human will take a look."
              : "Help us keep the readings accurate and respectful."}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        ) : (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Reason</legend>
              {Object.entries(REASON_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Details (optional)</span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={4}
                maxLength={2000}
                className="flex min-h-[80px] w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="What's wrong, and where?"
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={submit} disabled={pending || !reason}>
                {pending ? "Sending…" : "Send report"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
