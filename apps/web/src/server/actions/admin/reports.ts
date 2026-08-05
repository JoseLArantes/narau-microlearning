"use server";

import { requireTenantAdmin } from "@/server/guards";
import { dismissReport, hideSubject, resolveReport } from "@/server/services/admin";
import { errorResult, type ActionResult } from "../types";

export async function adminResolveReport(reportId: string, note?: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    await resolveReport(reportId, session.user.id, tenant.id, note);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDismissReport(reportId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    await dismissReport(reportId, session.user.id, tenant.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminHideSubject(subjectId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    await hideSubject(subjectId, session.user.id, tenant.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
