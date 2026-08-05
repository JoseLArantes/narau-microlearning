const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_ROOT_SEGMENTS = new Set([
  "api",
  "admin",
  "dashboard",
  "login",
  "onboarding",
  "settings",
  "today",
]);

export function isTenantSlugCandidate(value: string): boolean {
  return TENANT_SLUG_PATTERN.test(value) && !RESERVED_ROOT_SEGMENTS.has(value);
}

export function tenantPath(slug: string, pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const firstSegment = normalizedPath.split("/")[1] ?? "";
  const pathWithoutTenant = isTenantSlugCandidate(firstSegment)
    ? normalizedPath.slice(firstSegment.length + 1) || "/"
    : normalizedPath;
  return `/${slug}${pathWithoutTenant === "/" ? "" : pathWithoutTenant}`;
}

export function stripTenantPath(pathname: string): { slug: string | null; pathname: string } {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const firstSegment = normalizedPath.split("/")[1] ?? "";
  if (!isTenantSlugCandidate(firstSegment)) return { slug: null, pathname: normalizedPath };
  return {
    slug: firstSegment,
    pathname: normalizedPath.slice(firstSegment.length + 1) || "/",
  };
}
