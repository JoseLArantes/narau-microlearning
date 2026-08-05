"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@narau/ui";
import { tenantNameSchema, tenantSlugSchema, tenantLanguageSchema } from "@narau/validation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminUpdateTenant } from "@/server/actions/admin/tenants";
import { tenantPath } from "@/server/tenant-routing";

export function EditTenantDialog({
  tenant,
}: {
  tenant: { id: string; name: string; slug: string; language: string; isDefault: boolean };
}): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(tenant.name);
  const [slug, setSlug] = React.useState(tenant.slug);
  const [language, setLanguage] = React.useState(tenant.language);
  const [isDefault, setIsDefault] = React.useState(tenant.isDefault);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    if (!tenantNameSchema.safeParse(name).success || !tenantSlugSchema.safeParse(slug).success || !tenantLanguageSchema.safeParse(language).success) {
      setError("Use a name, URL-safe slug, and language tag such as pt-br.");
      return;
    }
    startTransition(async () => {
      const result = await adminUpdateTenant(tenant.id, { name, slug, language, isDefault });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      const updatedTenant = result.data as { slug: string };
      if (updatedTenant.slug !== tenant.slug) {
        window.location.assign(tenantPath(updatedTenant.slug, "/admin/tenants"));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="sm">Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit {tenant.name}</DialogTitle><DialogDescription>Changing the slug changes the public route for this tenant.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-2"><span className="text-sm font-medium">Name</span><input value={name} onChange={(event) => setName(event.target.value)} className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Route slug</span><input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Language tag</span><input value={language} onChange={(event) => setLanguage(event.target.value.toLowerCase())} className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} /> Use as the default route</label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button><Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
