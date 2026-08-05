"use server";

import { assignLearningInterestsSchema, createUserSchema } from "@narau/validation";
import { prisma } from "@narau/database";
import { requireTenantAdmin } from "@/server/guards";
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
    const { session, tenant } = await requireTenantAdmin();
    const user = await createUser(tenant.id, parsed.data);
    await audit(session.user.id, "ADMIN_USER_CREATED", "User", user.id, { email: user.email }, tenant.id);
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
    const { session, tenant } = await requireTenantAdmin();
    const user = await updateUser(userId, tenant.id, input);
    await audit(session.user.id, "ADMIN_USER_UPDATED", "User", userId, input, tenant.id);
    return { ok: true, data: user };
  } catch (error) {
    return errorResult(error);
  }
}

export async function adminAssignLearningInterests(input: { userId: string; selectedNodeIds: string[] }): Promise<ActionResult> {
  try {
    const parsed = assignLearningInterestsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Choose at least one area or topic.", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { session, tenant } = await requireTenantAdmin();
    const user = await prisma.user.findFirst({ where: { id: parsed.data.userId, tenantId: tenant.id }, select: { id: true } });
    if (!user) {
      return { ok: false, error: "The user and areas must belong to the current tenant." };
    }
    await assignAreas(parsed.data.userId, tenant.id, parsed.data.selectedNodeIds, session.user.id);
    await audit(session.user.id, "ADMIN_USER_INTERESTS_ASSIGNED", "User", parsed.data.userId, {
      selectedNodeIds: parsed.data.selectedNodeIds,
    }, tenant.id);
    return { ok: true, data: undefined };
  } catch (error) {
    return errorResult(error);
  }
}
