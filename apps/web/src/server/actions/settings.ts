"use server";

import { prisma } from "@dailycurio/database";
import { onboardingAreasSchema } from "@dailycurio/validation";
import { requireUser } from "@/server/guards";
import { setUserAreas } from "@/server/repositories/user-areas";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "./types";

export async function updateUserAreas(areaIds: string[]): Promise<ActionResult> {
  try {
    const parsed = onboardingAreasSchema.safeParse({ areaIds });
    if (!parsed.success) {
      return { ok: false, error: "Choose at least one area.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireUser();

    const activeAreas = await prisma.area.findMany({
      where: { id: { in: parsed.data.areaIds }, status: "ACTIVE" },
      select: { id: true },
    });
    if (activeAreas.length !== parsed.data.areaIds.length) {
      return { ok: false, error: "One of the selected areas is not available." };
    }

    await setUserAreas(session.user.id, parsed.data.areaIds, session.user.id);
    await track(session.user.id, "AREA_SELECTED", { areaIds: parsed.data.areaIds });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
