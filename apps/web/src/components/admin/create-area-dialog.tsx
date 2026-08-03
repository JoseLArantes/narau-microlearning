"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@dailycurio/ui";
import { createAreaSchema } from "@dailycurio/validation";
import * as React from "react";
import { useTransition } from "react";
import { adminCreateArea } from "@/server/actions/admin/areas";

export function CreateAreaDialog(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [categories, setCategories] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    const parsed = createAreaSchema.safeParse({
      name,
      slug,
      categories: categories.split(",").map((item) => item.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      setError("Enter a name, a slug, and at least one category.");
      return;
    }
    startTransition(async () => {
      const result = await adminCreateArea(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setName("");
      setSlug("");
      setCategories("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create area</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an area</DialogTitle>
          <DialogDescription>
            Categories are Wikipedia category names, comma separated.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Categories</span>
            <input
              type="text"
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
              placeholder="Category: Science, Category: Physics"
              className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !name || !slug || !categories}>
            {pending ? "Creating…" : "Create area"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
