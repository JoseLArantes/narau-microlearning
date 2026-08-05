"use server";

import { createAreaSchema, updateAreaSchema } from "@narau/validation";
import { requireTenantAdmin } from "@/server/guards";
import { createArea, updateArea, disableArea } from "@/server/services/areas";
import { audit } from "@/server/services/admin";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "../types";

export async function adminCreateArea(input: {
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
    const parsed = createAreaSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The area data is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { session, tenant } = await requireTenantAdmin();
    const area = await createArea(tenant.id, parsed.data);
    await audit(session.user.id, "ADMIN_AREA_CREATED", "Area", area.id, { slug: area.slug }, tenant.id);
    await track(session.user.id, "ADMIN_AREA_CREATED", { slug: area.slug });
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminUpdateArea(
  areaId: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string;
    iconUrl: string;
    color: string;
    displayOrder: number;
    status: "ACTIVE" | "DISABLED";
    sourceConfig: {
      categories: string[];
      includeSubcategories?: boolean;
      depth?: number;
      maxCandidates?: number;
      excludeCategories?: string[];
    };
  }>,
): Promise<ActionResult> {
  try {
    const parsed = updateAreaSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The area data is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { session, tenant } = await requireTenantAdmin();
    const area = await updateArea(areaId, tenant.id, parsed.data);
    await audit(session.user.id, "ADMIN_AREA_UPDATED", "Area", areaId, undefined, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDisableArea(areaId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    const area = await disableArea(areaId, tenant.id);
    await audit(session.user.id, "ADMIN_AREA_DISABLED", "Area", areaId, undefined, tenant.id);
    return { ok: true, data: area };
  } catch (error) {
    return errorResult(error);
  }
}
