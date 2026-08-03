"use client";

import { Button, Label } from "@dailycurio/ui";
import * as React from "react";
import { useTransition } from "react";
import { updateUserAreas } from "@/server/actions/settings";

interface AreaOption {
  id: string;
  name: string;
  description: string | null;
}

export function AreasForm({
  areas,
  currentAreaIds,
}: {
  areas: AreaOption[];
  currentAreaIds: string[];
}): React.ReactElement {
  const [selected, setSelected] = React.useState<string[]>(currentAreaIds);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(areaId: string): void {
    setSelected((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
    );
  }

  function submit(): void {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updateUserAreas(selected);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Areas updated.");
    });
  }

  return (
    <form
      action={submit}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {areas.map((area) => {
          const checked = selected.includes(area.id);
          return (
            <Label
              key={area.id}
              className="flex cursor-pointer items-center gap-3 rounded-[calc(var(--radius)-2px)] border border-border bg-card px-3 py-2.5 text-sm shadow-sm transition-colors hover:bg-secondary/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(area.id)}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              {area.name}
            </Label>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || selected.length === 0}>
          {pending ? "Saving…" : "Save areas"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
