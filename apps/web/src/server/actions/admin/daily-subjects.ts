"use server";

import { overrideDailySubjectSchema } from "@dailycurio/validation";
import { requireAdmin } from "@/server/guards";
import { overrideDailySubject } from "@/server/services/admin";
import { parseUtcDate } from "@/lib/date";
import { errorResult, type ActionResult } from "../types";

export async function adminOverrideDailySubject(input: {
  contentDate: string;
  areaId: string;
  subjectId: string;
}): Promise<ActionResult> {
  try {
    const parsed = overrideDailySubjectSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The override is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireAdmin();
    const daily = await overrideDailySubject(
      {
        contentDate: parseUtcDate(parsed.data.contentDate),
        areaId: parsed.data.areaId,
        subjectId: parsed.data.subjectId,
      },
      session.user.id,
    );
    return { ok: true, data: daily };
  } catch (error) {
    return errorResult(error);
  }
}
