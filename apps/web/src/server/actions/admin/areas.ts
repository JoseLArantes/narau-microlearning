"use server";

import { areaSourceConfigSchema, createAreaNodeSchema, updateAreaNodeSchema } from "@narau/validation";
import { requireTenantAdmin } from "@/server/guards";
import { activateArea, createArea, deleteDraftArea, disableArea, listAllAreas, normalizeAreaSourceConfig, updateArea } from "@/server/services/areas";
import { audit } from "@/server/services/admin";
import { previewWikipediaSource } from "@/server/services/wikipedia-preview";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "../types";

export async function adminCreateArea(input: {
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  displayOrder?: number;
  sourceConfig: {
    categories: string[];
    includeSubcategories?: boolean;
    depth?: number;
    maxCandidates?: number;
    excludeCategories?: string[];
  };
}): Promise<ActionResult> {
  try {
    const parsed = createAreaNodeSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The area or topic data is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { session, tenant } = await requireTenantAdmin();
    const area = await createArea(tenant.id, parsed.data);
    await audit(session.user.id, "ADMIN_AREA_NODE_CREATED", "Area", area.id, { parentId: area.parentId, level: area.level, slug: area.slug }, tenant.id);
    await track(session.user.id, "ADMIN_AREA_NODE_CREATED", { areaId: area.id, level: area.level });
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminUpdateArea(areaId: string, input: Partial<{
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  color: string;
  displayOrder: number;
  sourceConfig: {
    categories: string[];
    includeSubcategories?: boolean;
    depth?: number;
    maxCandidates?: number;
    excludeCategories?: string[];
  };
}>): Promise<ActionResult> {
  try {
    const parsed = updateAreaNodeSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The area or topic data is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { session, tenant } = await requireTenantAdmin();
    const area = await updateArea(areaId, tenant.id, parsed.data);
    await audit(session.user.id, "ADMIN_AREA_NODE_UPDATED", "Area", areaId, parsed.data, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminActivateArea(areaId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    const draft = (await listAllAreas(tenant.id)).find((area) => area.id === areaId);
    if (!draft) return { ok: false, error: "Area or topic not found in the current tenant." };
    const config = areaSourceConfigSchema.safeParse(draft.sourceConfig);
    if (!config.success) return { ok: false, error: "The node has an invalid Wikipedia source configuration." };
    const normalizedConfig = normalizeAreaSourceConfig(draft, config.data);
    if (JSON.stringify(normalizedConfig) !== JSON.stringify(config.data)) {
      await updateArea(areaId, tenant.id, { sourceConfig: normalizedConfig });
    }
    await previewWikipediaSource(tenant.language, normalizedConfig);
    const area = await activateArea(areaId, tenant.id);
    await audit(session.user.id, "ADMIN_AREA_NODE_ACTIVATED", "Area", areaId, undefined, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminPreviewArea(areaId: string): Promise<ActionResult<Awaited<ReturnType<typeof previewWikipediaSource>>>> {
  try {
    const { tenant } = await requireTenantAdmin();
    const area = (await listAllAreas(tenant.id)).find((candidate) => candidate.id === areaId);
    if (!area) return { ok: false, error: "Area or topic not found in the current tenant." };
    const config = areaSourceConfigSchema.safeParse(area.sourceConfig);
    if (!config.success) return { ok: false, error: "The node has an invalid Wikipedia source configuration." };
    return { ok: true, data: await previewWikipediaSource(tenant.language, normalizeAreaSourceConfig(area, config.data)) };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDisableArea(areaId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    const area = await disableArea(areaId, tenant.id);
    await audit(session.user.id, "ADMIN_AREA_NODE_DISABLED", "Area", areaId, undefined, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDeleteDraftArea(areaId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    const area = await deleteDraftArea(areaId, tenant.id);
    await audit(session.user.id, "ADMIN_AREA_NODE_DELETED", "Area", areaId, undefined, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}
