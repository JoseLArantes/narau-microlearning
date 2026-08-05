"use client";

import { Button, Input } from "@narau/ui";
import { normalizeWikipediaCategoryTitle } from "@narau/validation";
import { Plus, X } from "lucide-react";
import * as React from "react";

function categoryName(category: string): string {
  return normalizeWikipediaCategoryTitle(category).replace(/^Category:/, "");
}

function addCategories(current: string[], rawValue: string): string[] {
  const incoming = rawValue
    .split(",")
    .map((value) => normalizeWikipediaCategoryTitle(value))
    .filter((value) => value !== "Category:");
  const result = [...current];
  for (const category of incoming) {
    if (!result.some((existing) => existing.toLocaleLowerCase() === category.toLocaleLowerCase())) result.push(category);
  }
  return result;
}

export function CategoryTagInput({
  value,
  suggestions,
  onChange,
}: {
  value: string[];
  suggestions: string[];
  onChange: (categories: string[]) => void;
}): React.ReactElement {
  const [draft, setDraft] = React.useState("");
  const availableSuggestions = suggestions.filter(
    (suggestion) => !value.some((category) => category.toLocaleLowerCase() === suggestion.toLocaleLowerCase()),
  );

  function commitDraft(): void {
    const next = addCategories(value, draft);
    if (next.length !== value.length) onChange(next);
    setDraft("");
  }

  function removeCategory(category: string): void {
    onChange(value.filter((current) => current !== category));
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-10 flex-wrap gap-2 rounded-[calc(var(--radius)-2px)] border border-input bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        {value.map((category) => (
          <span key={category} className="inline-flex max-w-full items-center gap-1 rounded-[2px] border border-border bg-secondary px-2 py-1 font-mono text-[0.68rem] leading-tight text-foreground">
            <span className="truncate">{category}</span>
            <button
              type="button"
              onClick={() => removeCategory(category)}
              aria-label={`Remove ${category}`}
              className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex min-w-48 flex-1 items-center gap-2 px-1">
          <span className="font-mono text-xs font-bold text-muted-foreground">Category:</span>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                commitDraft();
              }
            }}
            onBlur={commitDraft}
            placeholder="Physics"
            aria-label="Add Wikipedia category"
            className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Button type="button" variant="ghost" size="sm" onClick={commitDraft} disabled={!draft.trim()} aria-label="Add Wikipedia category">
            <Plus aria-hidden className="size-4" />
            <span className="sr-only">Add category</span>
          </Button>
        </div>
      </div>
      {availableSuggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-meta text-muted-foreground">Suggested</span>
          {availableSuggestions.map((suggestion) => (
            <Button key={suggestion} type="button" variant="outline" size="sm" onClick={() => onChange(addCategories(value, suggestion))}>
              <Plus aria-hidden className="mr-1 size-3" />
              {categoryName(suggestion)}
            </Button>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">Type a category name and press Enter. The Category: prefix is added automatically.</p>
    </div>
  );
}
