"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Label } from "@dailycurio/ui";
import * as React from "react";
import { useTransition } from "react";
import { adminAssignAreas } from "@/server/actions/admin/users";
import type { AreaOption, UserRow } from "./users-table";

export function AssignAreasDialog({ user, areas }: { user: UserRow; areas: AreaOption[] }): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(user.userAreas.map((entry) => entry.areaId));
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(areaId: string): void {
    setSelected((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
    );
  }

  function submit(): void {
    setError(null);
    startTransition(async () => {
      const result = await adminAssignAreas({ userId: user.id, areaIds: selected });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Areas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Areas for {user.email}</DialogTitle>
          <DialogDescription>
            The user receives one item from a randomly chosen area each day.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {areas.map((area) => (
            <Label
              key={area.id}
              className="flex cursor-pointer items-center gap-3 rounded-[calc(var(--radius)-2px)] border border-border bg-card px-3 py-2 text-sm shadow-sm has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                checked={selected.includes(area.id)}
                onChange={() => toggle(area.id)}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              {area.name}
            </Label>
          ))}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || selected.length === 0}>
            {pending ? "Saving…" : "Save areas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
