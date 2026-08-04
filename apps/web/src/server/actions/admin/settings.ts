"use server";

import { appSettingsSchema } from "@narau/validation";
import { requireAdmin } from "@/server/guards";
import { setDefaultReadingMinutes } from "@/server/services/app-settings";
import { audit } from "@/server/services/admin";
import { errorResult, type ActionResult } from "../types";

export async function adminUpdateReadingMinutes(minutes: number): Promise<ActionResult> {
  try {
    const parsed = appSettingsSchema.safeParse({ defaultReadingMinutes: minutes });
    if (!parsed.success) {
      return { ok: false, error: "Reading time must be between 1 and 10 minutes." };
    }
    const session = await requireAdmin();
    await setDefaultReadingMinutes(parsed.data.defaultReadingMinutes);
    await audit(session.user.id, "ADMIN_SETTINGS_UPDATED", "AppSettings", "1", {
      defaultReadingMinutes: parsed.data.defaultReadingMinutes,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
