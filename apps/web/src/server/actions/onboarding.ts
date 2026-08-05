"use server";

import { prisma } from "@narau/database";
import { onboardingAreasSchema } from "@narau/validation";
import { requireUser } from "@/server/guards";
import { setUserAreas } from "@/server/repositories/user-areas";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "./types";

export async function selectOnboardingAreas(areaIds: string[]): Promise<ActionResult> {
  try {
    const parsed = onboardingAreasSchema.safeParse({ areaIds });
    if (!parsed.success) {
      return { ok: false, error: "Choose at least one area.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireUser();
    const tenantId = session.user.tenantId;
    if (!tenantId) return { ok: false, error: "Your account has no tenant assigned." };

    const activeAreas = await prisma.area.findMany({
      where: { id: { in: parsed.data.areaIds }, tenantId, status: "ACTIVE" },
      select: { id: true },
    });
    if (activeAreas.length !== parsed.data.areaIds.length) {
      return { ok: false, error: "One of the selected areas is not available." };
    }

    await setUserAreas(session.user.id, tenantId, parsed.data.areaIds, session.user.id);
    await track(session.user.id, "ONBOARDING_COMPLETED", { areaIds: parsed.data.areaIds });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
