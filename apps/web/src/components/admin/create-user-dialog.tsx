"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@narau/ui";
import { createUserSchema } from "@narau/validation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminCreateUser } from "@/server/actions/admin/users";

const ROLES = ["USER", "MODERATOR", "ADMIN"] as const;
const STATUSES = ["ACTIVE", "INVITED", "DISABLED"] as const;

export function CreateUserDialog(): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<(typeof ROLES)[number]>("USER");
  const [status, setStatus] = React.useState<(typeof STATUSES)[number]>("ACTIVE");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    const parsed = createUserSchema.safeParse({ name: name || undefined, email, role, status });
    if (!parsed.success) {
      setError("Enter a valid email.");
      return;
    }
    startTransition(async () => {
      const result = await adminCreateUser(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setName("");
      setEmail("");
      setRole("USER");
      setStatus("ACTIVE");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create user</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a user</DialogTitle>
          <DialogDescription>
            The user will sign in with a magic link to this email.
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
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as (typeof ROLES)[number])}
                className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ROLES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof STATUSES)[number])}
                className="flex h-9 w-full rounded-[calc(var(--radius)-2px)] border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUSES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !email}>
            {pending ? "Creating…" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
