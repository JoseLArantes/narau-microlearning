"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState, useTransition } from "react";
import { adminOverrideDailySubject } from "@/server/actions/admin/daily-subjects";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

interface SubjectOption {
  id: string;
  title: string;
  canonicalUrl: string;
}

export function OverrideDialog({
  contentDate,
  areaId,
  areas,
  currentTitle,
  onError,
}: {
  contentDate: Date;
  areaId: string;
  areas: Array<{ id: string; name: string; status: "ACTIVE" | "DISABLED" }>;
  currentTitle: string | null;
  onError: (message: string | null) => void;
}): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { tenant } = useI18n();
  const area = areas.find((entry) => entry.id === areaId);

  const subjects = useQuery({
    queryKey: ["admin-subjects", areaId],
    queryFn: async () => {
      const response = await fetch(
        `${tenantPath(tenant.slug, "/api/admin/subjects")}?areaId=${encodeURIComponent(areaId)}&date=${contentDate.toISOString().slice(0, 10)}`,
      );
      if (!response.ok) throw new Error("Failed to load subjects");
      return (await response.json()) as { subjects: SubjectOption[]; currentSubjectId: string | null };
    },
    enabled: open,
  });

  const filtered = (subjects.data?.subjects ?? []).filter((subject) =>
    subject.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function submit(): void {
    if (!selected) return;
    onError(null);
    startTransition(async () => {
      const result = await adminOverrideDailySubject({
        contentDate: contentDate.toISOString().slice(0, 10),
        areaId,
        subjectId: selected,
      });
      if (!result.ok) {
        onError(result.error);
        return;
      }
      setOpen(false);
      setSelected(null);
      setQuery("");
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSelected(null);
          setQuery("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{currentTitle ? "Replace" : "Pick"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Override {area?.name ?? ""} for this date</DialogTitle>
          <DialogDescription>
            {currentTitle ? `Currently: ${currentTitle}` : "No subject picked yet."} The worker will never touch an admin pick.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search candidates…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {subjects.isPending ? (
          <p className="text-sm text-muted-foreground">Loading subjects…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subjects yet — run <code className="font-mono text-xs">bun run job:ingest</code> first.
          </p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {filtered.map((subject) => (
              <li key={subject.id}>
                <button
                  type="button"
                  onClick={() => setSelected(subject.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-left text-sm transition-colors ${
                    selected === subject.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card hover:bg-secondary/50"
                  }`}
                >
                  <span>{subject.title}</span>
                  <span aria-hidden className="shrink-0 text-muted-foreground">
                    {selected === subject.id ? "✓" : "↗"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !selected}>
            {pending ? "Saving…" : "Override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
