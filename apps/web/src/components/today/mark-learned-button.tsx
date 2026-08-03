"use client";

import { Button } from "@dailycurio/ui";
import * as React from "react";
import { useTransition } from "react";
import { markTodayLearned } from "@/server/actions/today";

export function MarkLearnedButton({ itemId }: { itemId: string }): React.ReactElement {
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markTodayLearned(itemId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        {pending ? "Saving…" : "I learned this"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
