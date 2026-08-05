"use server";

import { requireTenantAdmin } from "@/server/guards";
import { rejectCandidate } from "@/server/services/admin";
import { errorResult, type ActionResult } from "../types";

export async function adminRejectCandidate(candidateId: string): Promise<ActionResult> {
  try {
    const { session, tenant } = await requireTenantAdmin();
    await rejectCandidate(candidateId, session.user.id, tenant.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
