"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@narau/database";
import { auth } from "@/server/auth";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n";
import { errorResult, type ActionResult } from "./types";

export async function switchTenantAction(tenantId: string): Promise<ActionResult<{ tenantId: string }>> {
  try {
    if (!SUPPORTED_LOCALES.includes(tenantId as SupportedLocale)) {
      return { ok: false, error: "Unsupported tenant language." };
    }

    const session = await auth();
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { tenantId },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("narau_tenant", tenantId, { path: "/", maxAge: 60 * 60 * 24 * 365 });

    revalidatePath("/", "layout");
    return { ok: true, data: { tenantId } };
  } catch (error) {
    return errorResult(error);
  }
}
