"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@narau/ui";
import { createTenantSchema } from "@narau/validation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminCreateTenant } from "@/server/actions/admin/tenants";

export function CreateTenantDialog(): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    const parsed = createTenantSchema.safeParse({ name, slug, language, isDefault });
    if (!parsed.success) {
      setError("Use a URL-safe slug and a language tag such as pt-br.");
      return;
    }
    startTransition(async () => {
      const result = await adminCreateTenant(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setName("");
      setSlug("");
      setLanguage("");
      setIsDefault(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add tenant</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a tenant</DialogTitle>
          <DialogDescription>Each tenant gets its own language content boundary and public route.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-2"><span className="text-sm font-medium">Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Português do Brasil" className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Route slug</span><input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} placeholder="pt-br" className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Language tag</span><input value={language} onChange={(event) => setLanguage(event.target.value.toLowerCase())} placeholder="pt-br" className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} /> Use as the default route</label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !name || !slug || !language}>{pending ? "Adding…" : "Add tenant"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

