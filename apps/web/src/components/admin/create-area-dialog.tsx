"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input } from "@narau/ui";
import {
  areaSlugSegment,
  buildWikipediaCategorySuggestions,
  createAreaNodeSchema,
  getChildAreaSlugPrefix,
} from "@narau/validation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminCreateArea } from "@/server/actions/admin/areas";
import { CategoryTagInput } from "./category-tag-input";

export interface AreaParentOption {
  id: string;
  name: string;
  slug: string;
  parent?: { name: string; slug: string } | null;
}

export function CreateAreaDialog({ parent }: { parent?: AreaParentOption | null }): React.ReactElement {
  const router = useRouter();
  const parentNames = parent ? [...(parent.parent ? [parent.parent.name] : []), parent.name] : [];
  const slugPrefix = getChildAreaSlugPrefix(parent ? [parent.slug] : []);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slugSuffix, setSlugSuffix] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>(() => buildWikipediaCategorySuggestions(parentNames));
  const [categoriesTouched, setCategoriesTouched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fullSlug = `${slugPrefix}${slugSuffix}`;

  function reset(): void {
    setName("");
    setSlugSuffix("");
    setSlugTouched(false);
    setCategories(buildWikipediaCategorySuggestions(parentNames));
    setCategoriesTouched(false);
    setError(null);
  }

  function setDialogOpen(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (nextOpen) reset();
  }

  function changeName(nextName: string): void {
    setName(nextName);
    if (!slugTouched) setSlugSuffix(nextName.trim() ? areaSlugSegment(nextName) : "");
    if (!categoriesTouched) setCategories(buildWikipediaCategorySuggestions([...parentNames, nextName]));
  }

  function submit(): void {
    setError(null);
    const parsed = createAreaNodeSchema.safeParse({
      parentId: parent?.id ?? null,
      name,
      slug: fullSlug,
      sourceConfig: { categories },
    });
    if (!parsed.success) {
      setError("Enter a name, use the required slug prefix, and keep at least one Wikipedia category.");
      return;
    }
    startTransition(async () => {
      const result = await adminCreateArea(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={parent ? "outline" : "default"} size={parent ? "sm" : "default"}>
          {parent ? "Add child" : "Create area"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{parent ? `Add a topic under ${parent.name}` : "Create an area"}</DialogTitle>
          <DialogDescription>
            {parent ? `This node will be linked to ${parentNames.join(" / ")} and inherit its research context.` : "Start a new top-level learning area."} The node starts as a draft and must pass a localized Wikipedia preview before activation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Name</span>
            <Input value={name} onChange={(event) => changeName(event.target.value)} placeholder="Physics" autoFocus />
          </label>
          <div className="space-y-2">
            <span className="block text-sm font-medium">Slug</span>
            <div className="flex min-h-9 items-center rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
              {slugPrefix ? <span className="shrink-0 font-mono text-xs text-muted-foreground">{slugPrefix}</span> : null}
              <Input
                value={slugSuffix}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlugSuffix(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                aria-label={slugPrefix ? "Slug suffix" : "Slug"}
                placeholder={slugPrefix ? "quantum-mechanics" : "physics"}
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {slugPrefix ? <>Required full slug: <code className="font-mono text-foreground">{fullSlug || `${slugPrefix}…`}</code></> : "Lowercase letters, numbers, and hyphens only."}
            </p>
          </div>
          <div className="space-y-2">
            <span className="block text-sm font-medium">Wikipedia categories</span>
            <CategoryTagInput
              value={categories}
              suggestions={buildWikipediaCategorySuggestions([...parentNames, name])}
              onChange={(next) => {
                setCategoriesTouched(true);
                setCategories(next);
              }}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !name.trim() || !slugSuffix || categories.length === 0}>{pending ? "Creating…" : "Create draft"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
