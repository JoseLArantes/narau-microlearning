import type { ReactElement } from "react";
import { requireAdmin } from "@/server/guards";
import { listUsers } from "@/server/services/users";
import { listActiveAreas } from "@/server/services/areas";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";

export default async function AdminUsersPage(): Promise<ReactElement> {
  await requireAdmin();
  const [users, areas] = await Promise.all([listUsers(), listActiveAreas()]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {users.length} account{users.length === 1 ? "" : "s"}
          </p>
        </div>
        <CreateUserDialog />
      </header>

      <UsersTable users={users} areas={areas} />
    </div>
  );
}
