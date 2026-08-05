import { prisma, type Prisma } from "@narau/database";
import type { Role, UserStatus } from "@narau/database";
import { setUserAreas } from "@/server/repositories/user-areas";

export interface AdminCreateUserInput {
  name?: string;
  email: string;
  role?: Role;
  status?: UserStatus;
}

export type AdminUserRow = Prisma.UserGetPayload<{
  include: { userAreas: { include: { area: true } }; _count: { select: { userAreas: true } } };
}>;

export async function listUsers(tenantId: string): Promise<AdminUserRow[]> {
  return prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { userAreas: { include: { area: true } }, _count: { select: { userAreas: true } } },
  });
}

export async function createUser(tenantId: string, input: AdminCreateUserInput): Promise<Awaited<ReturnType<typeof prisma.user.create>>> {
  return prisma.user.create({
    data: {
      tenantId,
      name: input.name,
      email: input.email,
      role: input.role ?? "USER",
      status: input.status ?? "ACTIVE",
    },
  });
}

export async function updateUser(
  id: string,
  tenantId: string,
  input: { name?: string; role?: Role; status?: UserStatus },
): Promise<Awaited<ReturnType<typeof prisma.user.update>>> {
  const existing = await prisma.user.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existing) throw new Error("User not found in the current tenant.");
  return prisma.user.update({
    where: { id },
    data: {
      name: input.name,
      role: input.role,
      status: input.status,
    },
  });
}

export async function assignAreas(
  userId: string,
  tenantId: string,
  areaIds: string[],
  assignedBy?: string,
): Promise<Awaited<ReturnType<typeof listUsers>>> {
  await setUserAreas(userId, tenantId, areaIds, assignedBy);
  return listUsers(tenantId);
}
