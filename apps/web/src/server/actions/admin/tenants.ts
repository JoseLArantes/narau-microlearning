"use server";

import { createTenantSchema, updateTenantSchema } from "@narau/validation";
import { requireGlobalAdmin } from "@/server/guards";
import { audit } from "@/server/services/admin";
import { activateTenant, createTenant, disableTenant, updateTenant } from "@/server/services/tenants";
import { errorResult, type ActionResult } from "../types";

export async function adminCreateTenant(input: {
  name: string;
  slug: string;
  language: string;
  domain?: string;
  isDefault?: boolean;
}): Promise<ActionResult> {
  try {
    const parsed = createTenantSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a name, route slug, and language tag." };
    const session = await requireGlobalAdmin();
    const tenant = await createTenant(parsed.data);
    await audit(session.user.id, "ADMIN_TENANT_CREATED", "Tenant", tenant.id, { slug: tenant.slug });
    return { ok: true, data: tenant };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminUpdateTenant(
  tenantId: string,
  input: { name?: string; slug?: string; language?: string; domain?: string; isDefault?: boolean },
): Promise<ActionResult> {
  try {
    const parsed = updateTenantSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "The tenant data is invalid." };
    const session = await requireGlobalAdmin();
    const tenant = await updateTenant(tenantId, parsed.data);
    await audit(session.user.id, "ADMIN_TENANT_UPDATED", "Tenant", tenant.id, { slug: tenant.slug }, tenant.id);
    return { ok: true, data: tenant };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDisableTenant(tenantId: string): Promise<ActionResult> {
  try {
    const session = await requireGlobalAdmin();
    const tenant = await disableTenant(tenantId);
    await audit(session.user.id, "ADMIN_TENANT_DISABLED", "Tenant", tenant.id, undefined, tenant.id);
    return { ok: true, data: tenant };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminActivateTenant(tenantId: string): Promise<ActionResult> {
  try {
    const session = await requireGlobalAdmin();
    const tenant = await activateTenant(tenantId);
    await audit(session.user.id, "ADMIN_TENANT_ACTIVATED", "Tenant", tenant.id, undefined, tenant.id);
    return { ok: true, data: tenant };
  } catch (error) {
    return errorResult(error);
  }
}
