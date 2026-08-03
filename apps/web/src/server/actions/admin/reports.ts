"use server";

import { requireAdmin } from "@/server/guards";
import { dismissReport, hideSubject, resolveReport } from "@/server/services/admin";
import { errorResult, type ActionResult } from "../types";

export async function adminResolveReport(reportId: string, note?: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await resolveReport(reportId, session.user.id, note);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminDismissReport(reportId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await dismissReport(reportId, session.user.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminHideSubject(subjectId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await hideSubject(subjectId, session.user.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
