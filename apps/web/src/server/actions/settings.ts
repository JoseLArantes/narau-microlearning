"use server";

import { learningInterestSelectionSchema } from "@narau/validation";
import { requireUser } from "@/server/guards";
import { setUserAreas } from "@/server/repositories/user-areas";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "./types";

export async function updateUserLearningInterests(selectedNodeIds: string[]): Promise<ActionResult> {
  try {
    const parsed = learningInterestSelectionSchema.safeParse({ selectedNodeIds });
    if (!parsed.success) {
      return { ok: false, error: "Choose at least one area or topic.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireUser();
    const tenantId = session.user.tenantId;
    if (!tenantId) return { ok: false, error: "Your account has no tenant assigned." };

    await setUserAreas(session.user.id, tenantId, parsed.data.selectedNodeIds, session.user.id);
    await track(session.user.id, "LEARNING_INTERESTS_UPDATED", { selectedNodeIds: parsed.data.selectedNodeIds });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
