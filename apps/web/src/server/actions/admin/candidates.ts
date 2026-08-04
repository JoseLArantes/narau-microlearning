"use server";

import { requireAdmin } from "@/server/guards";
import { rejectCandidate } from "@/server/services/admin";
import { errorResult, type ActionResult } from "../types";

export async function adminRejectCandidate(candidateId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await rejectCandidate(candidateId, session.user.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
