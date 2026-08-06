"use server";

import { appSettingsSchema, llmSettingsSchema, type LlmSettingsInput } from "@narau/validation";
import { requireAdmin, requireGlobalAdmin } from "@/server/guards";
import {
  saveLlmSettings,
  setDefaultReadingMinutes,
  testConfiguredLlm,
} from "@/server/services/app-settings";
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

export async function adminSaveLlmSettings(input: LlmSettingsInput): Promise<ActionResult> {
  try {
    const parsed = llmSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Check the LLM connection fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const session = await requireGlobalAdmin();
    await saveLlmSettings(parsed.data);
    await audit(session.user.id, "ADMIN_LLM_SETTINGS_UPDATED", "AppSettings", "1", {
      enabled: parsed.data.enabled,
      provider: parsed.data.provider,
      model: parsed.data.model,
      apiKeyChanged: Boolean(parsed.data.apiKey),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminTestLlmSettings(input: LlmSettingsInput): Promise<ActionResult> {
  try {
    const parsed = llmSettingsSchema.safeParse({ ...input, enabled: true });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Choose a provider and enter a valid model ID before testing.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await requireGlobalAdmin();
    await testConfiguredLlm(parsed.data);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
