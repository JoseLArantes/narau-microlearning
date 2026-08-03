"use server";

import { ratingSchema, reportSchema } from "@dailycurio/validation";
import { requireUser } from "@/server/guards";
import { createReport } from "@/server/services/reports";
import { TodayService } from "@/server/services/today";
import { errorResult, type ActionResult } from "./types";

export async function markTodayViewed(itemId: string): Promise<ActionResult> {
  try {
    const session = await requireUser();
    await TodayService.markViewed(session.user.id, itemId);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function markTodayLearned(itemId: string): Promise<ActionResult> {
  try {
    const session = await requireUser();
    const item = await TodayService.markLearned(session.user.id, itemId);
    if (!item) return { ok: false, error: "That item is not available." };
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function rateTodayItem(input: {
  itemId: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  try {
    const parsed = ratingSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The rating is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireUser();
    const item = await TodayService.rate(
      session.user.id,
      parsed.data.itemId,
      parsed.data.rating,
      parsed.data.comment,
    );
    if (!item) return { ok: false, error: "You can only rate an item after marking it learned." };
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}

export async function reportTodayItem(input: {
  subjectId: string;
  itemId?: string;
  reason: "INACCURATE" | "OUTDATED" | "OFFENSIVE" | "MISLEADING_SUMMARY" | "BROKEN_SOURCE" | "COPYRIGHT" | "OTHER";
  details?: string;
}): Promise<ActionResult> {
  try {
    const parsed = reportSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The report is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireUser();
    await createReport(session.user.id, parsed.data);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
