import { prisma, type Prisma } from "@narau/database";
import {
  buildWikipediaCategorySuggestions,
  getChildAreaSlugPrefix,
  hasHierarchicalAreaSlug,
  type AreaSourceConfig,
  type CreateAreaNodeInput,
  type UpdateAreaNodeInput,
} from "@narau/validation";

type AreaWithParents = Prisma.AreaGetPayload<{
  include: { parent: { include: { parent: true } } };
}>;

type ActiveAreaHierarchy = {
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  level: "AREA" | "TOPIC" | "SPECIALTY";
  parent?: {
    status: "DRAFT" | "ACTIVE" | "DISABLED";
    level: "AREA" | "TOPIC" | "SPECIALTY";
    parent?: ActiveAreaHierarchy["parent"] | null;
  } | null;
};

export type AreaTreeNode = {
  id: string;
  parentId: string | null;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  color: string | null;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  effectiveActive: boolean;
  displayOrder: number;
  sourceConfig: AreaSourceConfig;
  children: AreaTreeNode[];
};

export type AdminAreaRow = Prisma.AreaGetPayload<{
  include: {
    parent: { include: { parent: true } };
    _count: { select: { userAreas: true; candidates: true } };
  };
}>;

const parentInclude = { include: { parent: true } } as const;

export function isAreaEffectivelyActive(area: ActiveAreaHierarchy): boolean {
  if (area.status !== "ACTIVE") return false;
  if (area.level === "AREA") return true;
  if (!area.parent || area.parent.status !== "ACTIVE") return false;
  return area.level !== "SPECIALTY" || Boolean(area.parent.parent && area.parent.parent.status === "ACTIVE");
}

type AreaHierarchy = {
  id: string;
  name: string;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  parent?: { id: string; name: string; parent?: { id: string; name: string } | null } | null;
};

export function getRootAreaId(area: Pick<AreaHierarchy, "id" | "level" | "parent">): string {
  if (area.level === "AREA") return area.id;
  if (area.level === "TOPIC") return area.parent?.id ?? area.id;
  return area.parent?.parent?.id ?? area.parent?.id ?? area.id;
}

export function getAreaBreadcrumb(area: Pick<AreaHierarchy, "name" | "level" | "parent">): string {
  const names = [area.name];
  if (area.parent) {
    names.unshift(area.parent.name);
    if (area.parent.parent) names.unshift(area.parent.parent.name);
  }
  return names.join(" › ");
}

function toTreeNode(area: AreaWithParents, children: AreaTreeNode[] = []): AreaTreeNode {
  return {
    id: area.id,
    parentId: area.parentId,
    level: area.level,
    name: area.name,
    slug: area.slug,
    description: area.description,
    iconUrl: area.iconUrl,
    color: area.color,
    status: area.status,
    effectiveActive: isAreaEffectivelyActive(area),
    displayOrder: area.displayOrder,
    sourceConfig: area.sourceConfig as unknown as AreaSourceConfig,
    children,
  };
}

export function buildAreaTree(areas: AreaWithParents[]): AreaTreeNode[] {
  const nodes = new Map<string, AreaTreeNode>();
  for (const area of areas) nodes.set(area.id, toTreeNode(area));

  const roots: AreaTreeNode[] = [];
  for (const node of nodes.values()) {
    if (!node.parentId) {
      roots.push(node);
      continue;
    }
    const parent = nodes.get(node.parentId);
    if (parent) parent.children.push(node);
  }

  const sort = (items: AreaTreeNode[]) => {
    items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    for (const item of items) sort(item.children);
  };
  sort(roots);
  return roots;
}

async function findAreas(tenantId: string): Promise<AreaWithParents[]> {
  return prisma.area.findMany({
    where: { tenantId, tenant: { status: "ACTIVE" } },
    include: { parent: parentInclude },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function listActiveAreas(tenantId: string): Promise<AreaWithParents[]> {
  const areas = await findAreas(tenantId);
  return areas.filter((area) => isAreaEffectivelyActive(area));
}

export async function listActiveAreaTree(tenantId: string): Promise<AreaTreeNode[]> {
  return buildAreaTree(await listActiveAreas(tenantId));
}

export async function listAllAreas(tenantId: string): Promise<AdminAreaRow[]> {
  return prisma.area.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      parent: parentInclude,
      _count: { select: { userAreas: true, candidates: true } },
    },
  });
}

type AreaParentContext = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  parent: { slug: string; name: string; level: "AREA" | "TOPIC" | "SPECIALTY"; status: "DRAFT" | "ACTIVE" | "DISABLED" } | null;
};

type AreaParentResult = {
  level: "AREA" | "TOPIC" | "SPECIALTY";
  parent: AreaParentContext | null;
  parentSlugs: string[];
  parentNames: string[];
};

async function getParentAndLevel(tenantId: string, parentId: string | null): Promise<AreaParentResult> {
  if (!parentId) return { level: "AREA", parent: null, parentSlugs: [], parentNames: [] };
  const parent = await prisma.area.findFirst({
    where: { id: parentId, tenantId },
    select: {
      id: true,
      tenantId: true,
      slug: true,
      name: true,
      level: true,
      status: true,
      parent: { select: { slug: true, name: true, level: true, status: true } },
    },
  });
  if (!parent) throw new Error("The parent topic was not found in the current tenant.");
  if (parent.level === "SPECIALTY") throw new Error("Specialties cannot contain more topics.");
  const parentSlugs = [parent.slug];
  const parentNames = parent.parent ? [parent.parent.name, parent.name] : [parent.name];
  return { level: parent.level === "AREA" ? "TOPIC" : "SPECIALTY", parent, parentSlugs, parentNames };
}

function sourceConfigForNode(input: { name: string; sourceConfig: AreaSourceConfig }, parentNames: string[]): AreaSourceConfig {
  return {
    ...input.sourceConfig,
    categories: buildWikipediaCategorySuggestions([
      ...parentNames,
      input.name,
      ...input.sourceConfig.categories,
    ]),
  };
}

export async function createArea(tenantId: string, input: CreateAreaNodeInput) {
  const { level, parent, parentSlugs, parentNames } = await getParentAndLevel(tenantId, input.parentId);
  if (parent && !hasHierarchicalAreaSlug(input.slug, parentSlugs)) {
    throw new Error(`Child slugs must start with "${getChildAreaSlugPrefix(parentSlugs)}".`);
  }
  const sourceConfig = sourceConfigForNode(input, parentNames);
  return prisma.area.create({
    data: {
      tenantId,
      parentId: input.parentId,
      level,
      status: "DRAFT",
      name: input.name,
      slug: input.slug,
      description: input.description,
      iconUrl: input.iconUrl,
      color: input.color,
      displayOrder: input.displayOrder,
      sourceConfig: sourceConfig as unknown as AreaSourceConfig,
    },
  });
}

export async function updateArea(id: string, tenantId: string, input: UpdateAreaNodeInput) {
  const existing = await prisma.area.findFirst({
    where: { id, tenantId },
    include: { parent: { include: { parent: true } } },
  });
  if (!existing) throw new Error("Area or topic not found in the current tenant.");
  const parentSlugs = existing.parent ? [existing.parent.slug] : [];
  if (existing.parent && input.slug && !hasHierarchicalAreaSlug(input.slug, parentSlugs)) {
    throw new Error(`Child slugs must start with "${getChildAreaSlugPrefix(parentSlugs)}".`);
  }
  const sourceConfig = input.sourceConfig
    ? sourceConfigForNode({ name: input.name ?? existing.name, sourceConfig: input.sourceConfig }, existing.parent ? [
      ...(existing.parent.parent ? [existing.parent.parent.name] : []),
      existing.parent.name,
    ] : [])
    : undefined;
  return prisma.area.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      iconUrl: input.iconUrl,
      color: input.color,
      displayOrder: input.displayOrder,
      sourceConfig: sourceConfig as unknown as AreaSourceConfig | undefined,
      ...(input.sourceConfig ? { status: "DRAFT" as const } : {}),
    },
  });
}

export async function activateArea(id: string, tenantId: string) {
  const areas = await findAreas(tenantId);
  const area = areas.find((candidate) => candidate.id === id);
  if (!area) throw new Error("Area or topic not found in the current tenant.");
  if (area.parent && !isAreaEffectivelyActive(area.parent)) {
    throw new Error("Activate the parent area or topic first.");
  }
  if (area.level === "SPECIALTY" && (!area.parent?.parent || !isAreaEffectivelyActive(area.parent.parent))) {
    throw new Error("Activate the root area first.");
  }
  return prisma.area.update({ where: { id }, data: { status: "ACTIVE" } });
}

export async function disableArea(id: string, tenantId: string) {
  const existing = await prisma.area.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existing) throw new Error("Area or topic not found in the current tenant.");
  return prisma.area.update({ where: { id }, data: { status: "DISABLED" } });
}

export async function deleteDraftArea(id: string, tenantId: string) {
  const existing = await prisma.area.findFirst({ where: { id, tenantId, status: "DRAFT" }, select: { id: true } });
  if (!existing) throw new Error("Only an existing draft can be deleted.");
  return prisma.area.delete({ where: { id } });
}
