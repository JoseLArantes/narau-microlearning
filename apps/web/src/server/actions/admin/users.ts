"use server";

import { assignUserAreasSchema, createUserSchema } from "@narau/validation";
import { requireAdmin } from "@/server/guards";
import { createUser, updateUser, assignAreas } from "@/server/services/users";
import { audit } from "@/server/services/admin";
import { track } from "@/server/tracking";
import { errorResult, type ActionResult } from "../types";

export async function adminCreateUser(input: {
  name?: string;
  email: string;
  role?: "USER" | "ADMIN" | "MODERATOR";
  status?: "INVITED" | "ACTIVE" | "DISABLED";
}): Promise<ActionResult> {
  try {
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "The user data is invalid.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireAdmin();
    const user = await createUser(parsed.data);
    await audit(session.user.id, "ADMIN_USER_CREATED", "User", user.id, { email: user.email });
    await track(session.user.id, "ADMIN_USER_CREATED", { email: user.email });
    return { ok: true, data: user };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminUpdateUser(
  userId: string,
  input: { name?: string; role?: "USER" | "ADMIN" | "MODERATOR"; status?: "INVITED" | "ACTIVE" | "DISABLED" },
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const user = await updateUser(userId, input);
    await audit(session.user.id, "ADMIN_USER_UPDATED", "User", userId, input);
    return { ok: true, data: user };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminAssignAreas(input: { userId: string; areaIds: string[] }): Promise<ActionResult> {
  try {
    const parsed = assignUserAreasSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Choose at least one area.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const session = await requireAdmin();
    await assignAreas(parsed.data.userId, parsed.data.areaIds, session.user.id);
    await audit(session.user.id, "ADMIN_USER_AREAS_ASSIGNED", "User", parsed.data.userId, {
      areaIds: parsed.data.areaIds,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
