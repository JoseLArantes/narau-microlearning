import { prisma, type Prisma } from "@narau/database";

type SelectionArea = Prisma.AreaGetPayload<{
  include: { parent: { include: { parent: { include: { parent: true } } } } };
}>;

const areaInclude = {
  parent: {
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  },
} as const;

export function isEffectivelyActive(area: {
  status: string;
  parent?: {
    status: string;
    parent?: {
      status: string;
      parent?: {
        status: string;
      } | null;
    } | null;
  } | null;
}): boolean {
  let current: typeof area | null | undefined = area;
  while (current) {
    if (current.status !== "ACTIVE") return false;
    current = current.parent;
  }
  return true;
}

function hasSelectedAncestor(
  area: {
    parent?: {
      id: string;
      parent?: {
        id: string;
        parent?: {
          id: string;
        } | null;
      } | null;
    } | null;
  },
  selected: Set<string>,
): boolean {
  let current = area.parent;
  while (current) {
    if (selected.has(current.id)) return true;
    current = current.parent;
  }
  return false;
}

export async function getUserAreas(
  userId: string,
  tenantId: string,
): Promise<Prisma.UserAreaGetPayload<{ include: { area: { include: { parent: { include: { parent: true } } } } } }>[]> {
  return prisma.userArea.findMany({
    where: { userId, tenantId },
    include: { area: { include: areaInclude } },
    orderBy: [{ area: { displayOrder: "asc" } }, { area: { name: "asc" } }],
  });
}

export async function validateSelectedAreaIds(
  tenantId: string,
  selectedNodeIds: string[],
): Promise<SelectionArea[]> {
  const ids = [...new Set(selectedNodeIds)];
  const areas = await prisma.area.findMany({
    where: { id: { in: ids }, tenantId },
    include: areaInclude,
  });
  if (areas.length !== ids.length) throw new Error("One of the selected topics is not available in this tenant.");
  const selected = new Set(ids);
  for (const area of areas) {
    if (!isEffectivelyActive(area)) throw new Error("One of the selected topics is not currently available.");
    if (hasSelectedAncestor(area, selected)) {
      throw new Error("Choose either a broad area or its more specific topics, not both.");
    }
  }
  return areas;
}

export async function setUserAreas(
  userId: string,
  tenantId: string,
  selectedNodeIds: string[],
  assignedBy?: string,
): Promise<void> {
  const areas = await validateSelectedAreaIds(tenantId, selectedNodeIds);
  await prisma.$transaction(async (tx) => {
    await tx.userArea.deleteMany({ where: { userId, tenantId } });
    await tx.userArea.createMany({
      data: areas.map((area) => ({ userId, tenantId, areaId: area.id, assignedBy })),
    });
  });
}

export async function countUserAreas(userId: string, tenantId: string): Promise<number> {
  return prisma.userArea.count({ where: { userId, tenantId } });
}
