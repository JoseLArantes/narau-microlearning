import { prisma, type Prisma } from "@narau/database";
import type { AreaSourceConfig, CreateAreaInput, UpdateAreaInput } from "@narau/validation";

export type AdminAreaRow = Prisma.AreaGetPayload<{
  include: { _count: { select: { userAreas: true; candidates: true } } };
}>;

export async function listActiveAreas(tenantId: string): Promise<Prisma.AreaGetPayload<Record<string, never>>[]> {
  return prisma.area.findMany({
    where: { status: "ACTIVE", tenantId, tenant: { status: "ACTIVE" } },
    orderBy: { displayOrder: "asc" },
  });
}

export async function listAllAreas(tenantId: string): Promise<AdminAreaRow[]> {
  return prisma.area.findMany({
    where: { tenantId },
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { userAreas: true, candidates: true } } },
  });
}

export async function createArea(tenantId: string, input: CreateAreaInput): Promise<Awaited<ReturnType<typeof prisma.area.create>>> {
  return prisma.area.create({
    data: {
      tenantId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      iconUrl: input.iconUrl,
      color: input.color,
      displayOrder: input.displayOrder,
      sourceConfig: input.sourceConfig as unknown as AreaSourceConfig,
    },
  });
}

export async function updateArea(id: string, tenantId: string, input: UpdateAreaInput): Promise<Awaited<ReturnType<typeof prisma.area.update>>> {
  const existing = await prisma.area.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existing) throw new Error("Area not found in the current tenant.");
  return prisma.area.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      iconUrl: input.iconUrl,
      color: input.color,
      displayOrder: input.displayOrder,
      status: input.status,
      sourceConfig: input.sourceConfig as unknown as AreaSourceConfig | undefined,
    },
  });
}

export async function disableArea(id: string, tenantId: string): Promise<Awaited<ReturnType<typeof prisma.area.update>>> {
  const existing = await prisma.area.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existing) throw new Error("Area not found in the current tenant.");
  return prisma.area.update({ where: { id }, data: { status: "DISABLED" } });
}
