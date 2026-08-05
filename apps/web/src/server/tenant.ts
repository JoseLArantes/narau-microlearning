import { prisma, type Tenant } from "@narau/database";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { tenantPath } from "./tenant-routing";

export type TenantRecord = Pick<
  Tenant,
  "id" | "slug" | "name" | "language" | "domain" | "isDefault" | "status" | "createdAt" | "updatedAt"
>;

const tenantSelect = {
  id: true,
  slug: true,
  name: true,
  language: true,
  domain: true,
  isDefault: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listTenants(includeDisabled = false): Promise<TenantRecord[]> {
  return prisma.tenant.findMany({
    where: includeDisabled ? undefined : { status: "ACTIVE" },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: tenantSelect,
  });
}

export async function getTenantBySlug(slug: string, includeDisabled = false): Promise<TenantRecord | null> {
  return prisma.tenant.findFirst({
    where: { slug, ...(includeDisabled ? {} : { status: "ACTIVE" }) },
    select: tenantSelect,
  });
}

export async function getTenantById(id: string, includeDisabled = false): Promise<TenantRecord | null> {
  return prisma.tenant.findFirst({
    where: { id, ...(includeDisabled ? {} : { status: "ACTIVE" }) },
    select: tenantSelect,
  });
}

export async function getDefaultTenant(): Promise<TenantRecord> {
  const tenant = await prisma.tenant.findFirst({
    where: { status: "ACTIVE" },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: tenantSelect,
  });
  if (!tenant) notFound();
  return tenant;
}

export async function getRequestTenant(): Promise<TenantRecord> {
  const requestHeaders = await headers();
  const requestedSlug = requestHeaders.get("x-narau-tenant-slug") ?? (await cookies()).get("narau_tenant")?.value;
  const tenant = requestedSlug ? await getTenantBySlug(requestedSlug) : await getDefaultTenant();
  if (!tenant) notFound();
  return tenant;
}

export async function getRequestTenantPath(pathname: string): Promise<string> {
  const tenant = await getRequestTenant();
  return tenantPath(tenant.slug, pathname);
}
