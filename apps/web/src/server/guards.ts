import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "./auth";
import { getRequestTenant, getTenantById, getRequestTenantPath, type TenantRecord } from "./tenant";
import { tenantPath } from "./tenant-routing";

export type AuthenticatedSession = Session & {
  user: { id: string; role: "ADMIN" | "MODERATOR" | "USER"; tenantId?: string };
};

export async function requireUser(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(await getRequestTenantPath("/login"));
  }
  const tenant = await getRequestTenant();
  if (session.user.role === "USER" && session.user.tenantId && session.user.tenantId !== tenant.id) {
    const userTenant = await getTenantById(session.user.tenantId);
    redirect(tenantPath(userTenant?.slug ?? "en", "/today"));
  }
  return session as AuthenticatedSession;
}

export async function requireAdmin(): Promise<AuthenticatedSession> {
  const session = await requireUser();
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect(await getRequestTenantPath("/dashboard"));
  }
  return session;
}

export async function requireTenantAdmin(): Promise<{ session: AuthenticatedSession; tenant: TenantRecord }> {
  const session = await requireAdmin();
  const tenant = await getRequestTenant();
  if (session.user.role === "MODERATOR" && session.user.tenantId !== tenant.id) {
    const ownTenant = session.user.tenantId ? await getTenantById(session.user.tenantId) : null;
    redirect(tenantPath(ownTenant?.slug ?? tenant.slug, "/admin"));
  }
  return { session, tenant };
}

export async function requireGlobalAdmin(): Promise<AuthenticatedSession> {
  const session = await requireAdmin();
  if (session.user.role !== "ADMIN") redirect(await getRequestTenantPath("/admin"));
  return session;
}
