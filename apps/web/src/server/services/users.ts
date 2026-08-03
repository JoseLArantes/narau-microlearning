import { prisma, type Prisma } from "@dailycurio/database";
import type { Role, UserStatus } from "@dailycurio/database";
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

export async function listUsers(): Promise<AdminUserRow[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { userAreas: { include: { area: true } }, _count: { select: { userAreas: true } } },
  });
}

export async function createUser(input: AdminCreateUserInput): Promise<Awaited<ReturnType<typeof prisma.user.create>>> {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role ?? "USER",
      status: input.status ?? "ACTIVE",
    },
  });
}

export async function updateUser(
  id: string,
  input: { name?: string; role?: Role; status?: UserStatus },
): Promise<Awaited<ReturnType<typeof prisma.user.update>>> {
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
  areaIds: string[],
  assignedBy?: string,
): Promise<Awaited<ReturnType<typeof listUsers>>> {
  await setUserAreas(userId, areaIds, assignedBy);
  return listUsers();
}
