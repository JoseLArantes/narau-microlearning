"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Textarea } from "@narau/ui";
import { areaSlugSegment, areaSourceConfigSchema, buildWikipediaCategorySuggestions, getChildAreaSlugPrefix, updateAreaNodeSchema } from "@narau/validation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminUpdateArea } from "@/server/actions/admin/areas";
import { CategoryTagInput } from "./category-tag-input";
import type { AreaParentOption } from "./create-area-dialog";

export interface EditableArea {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  displayOrder: number;
  sourceConfig: unknown;
  parent?: AreaParentOption | null;
}

function slugSuffix(slug: string, prefix: string): string {
  return prefix && slug.startsWith(prefix) ? slug.slice(prefix.length) : slug;
}

export function EditAreaDialog({ area }: { area: EditableArea }): React.ReactElement {
  const router = useRouter();
  const parentNames = area.parent ? [...(area.parent.parent ? [area.parent.parent.name] : []), area.parent.name] : [];
  const slugPrefix = getChildAreaSlugPrefix(area.parent ? [area.parent.slug] : []);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(area.name);
  const [slugSuffixValue, setSlugSuffixValue] = React.useState(slugSuffix(area.slug, slugPrefix));
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [description, setDescription] = React.useState(area.description ?? "");
  const [color, setColor] = React.useState(area.color ?? "");
  const [displayOrder, setDisplayOrder] = React.useState(String(area.displayOrder));
  const [categories, setCategories] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fullSlug = `${slugPrefix}${slugSuffixValue}`;

  function openEditor(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) return;
    const source = areaSourceConfigSchema.safeParse(area.sourceConfig);
    setName(area.name);
    setSlugSuffixValue(slugSuffix(area.slug, slugPrefix));
    setSlugTouched(false);
    setDescription(area.description ?? "");
    setColor(area.color ?? "");
    setDisplayOrder(String(area.displayOrder));
    setCategories(source.success ? source.data.categories : buildWikipediaCategorySuggestions([...parentNames, area.name]));
    setError(null);
  }

  function changeName(nextName: string): void {
    setName(nextName);
    if (!slugTouched) setSlugSuffixValue(nextName.trim() ? areaSlugSegment(nextName) : "");
  }

  function submit(): void {
    setError(null);
    const parsed = updateAreaNodeSchema.safeParse({
      name,
      slug: fullSlug,
      description: description || undefined,
      color: color || undefined,
      displayOrder: Number(displayOrder),
      sourceConfig: { categories },
    });
    if (!parsed.success) {
      setError("Enter a valid name, use the required slug prefix, and keep at least one Wikipedia category.");
      return;
    }
    startTransition(async () => {
      const result = await adminUpdateArea(area.id, parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={openEditor}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {area.name}</DialogTitle>
          <DialogDescription>
            {area.parent ? `Linked path: ${[...parentNames, area.name].join(" / ")}.` : "This is a top-level area."} Changing its Wikipedia categories returns the node to draft review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Name</span>
            <Input value={name} onChange={(event) => changeName(event.target.value)} />
          </label>
          <div className="space-y-2">
            <span className="block text-sm font-medium">Slug</span>
            <div className="flex min-h-9 items-center rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
              {slugPrefix ? <span className="shrink-0 font-mono text-xs text-muted-foreground">{slugPrefix}</span> : null}
              <Input
                value={slugSuffixValue}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlugSuffixValue(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                aria-label={slugPrefix ? "Slug suffix" : "Slug"}
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {slugPrefix ? <p className="text-xs text-muted-foreground">Required full slug: <code className="font-mono text-foreground">{fullSlug}</code></p> : null}
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Order</span>
              <Input type="number" min={0} max={999} value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Color</span>
              <Input placeholder="#9b2c2c" value={color} onChange={(event) => setColor(event.target.value)} />
            </label>
          </div>
          <div className="space-y-2">
            <span className="block text-sm font-medium">Wikipedia categories</span>
            <CategoryTagInput
              value={categories}
              suggestions={buildWikipediaCategorySuggestions([...parentNames, name])}
              onChange={setCategories}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !name.trim() || !slugSuffixValue || categories.length === 0}>{pending ? "Saving…" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
