"use client";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@narau/ui";
import { AssignAreasDialog } from "./assign-areas-dialog";
import type { AreaTreeOption } from "@/components/forms/learning-interest-selector";

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  status: "INVITED" | "ACTIVE" | "DISABLED";
  userAreas: Array<{ areaId: string; area: { name: string; parent: { name: string; parent: { name: string } | null } | null } }>;
}

export function UsersTable({ users, areas }: { users: UserRow[]; areas: AreaTreeOption[] }): React.ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Areas</TableHead>
          <TableHead className="text-right">Manage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="space-y-0.5">
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.role === "ADMIN" ? "default" : "muted"}>{user.role}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === "ACTIVE" ? "secondary" : "outline"}>{user.status}</Badge>
            </TableCell>
            <TableCell className="max-w-[220px]">
              <p className="truncate text-xs text-muted-foreground">
                {user.userAreas.map((entry) => {
                  const parent = entry.area.parent;
                  const root = parent?.parent?.name ?? parent?.name;
                  return root && root !== entry.area.name ? `${root} › ${parent?.name === root ? entry.area.name : `${parent?.name} › ${entry.area.name}`}` : entry.area.name;
                }).join(", ") || "None"}
              </p>
            </TableCell>
            <TableCell className="text-right">
              <AssignAreasDialog user={user} areas={areas} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
