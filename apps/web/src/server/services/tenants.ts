import { prisma, type Tenant } from "@narau/database";
import type { CreateTenantInput, UpdateTenantInput } from "@narau/validation";
import { RESERVED_ROOT_SEGMENTS } from "@/server/tenant-routing";

function assertTenantSlugIsAvailable(slug: string): void {
  if (RESERVED_ROOT_SEGMENTS.has(slug)) {
    throw new Error(`The tenant slug "${slug}" is reserved by the application.`);
  }
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  assertTenantSlugIsAvailable(input.slug);
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.tenant.updateMany({ data: { isDefault: false } });
    }
    return tx.tenant.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.slug,
        language: input.language,
        domain: input.domain || null,
        isDefault: input.isDefault,
      },
    });
  });
}

export async function updateTenant(id: string, input: UpdateTenantInput): Promise<Tenant> {
  if (input.slug) assertTenantSlugIsAvailable(input.slug);
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.tenant.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });
    }
    return tx.tenant.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
        ...(input.domain !== undefined ? { domain: input.domain || null } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  });
}

export async function disableTenant(id: string): Promise<Tenant> {
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { id: true, isDefault: true, status: true } });
  if (!tenant) throw new Error("Tenant not found.");
  if (tenant.isDefault) throw new Error("Set another default tenant before disabling this tenant.");
  return prisma.tenant.update({ where: { id }, data: { status: "DISABLED" } });
}

export async function activateTenant(id: string): Promise<Tenant> {
  return prisma.tenant.update({ where: { id }, data: { status: "ACTIVE" } });
}
