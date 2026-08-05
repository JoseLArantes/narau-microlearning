import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_ROOT_SEGMENTS, isTenantSlugCandidate } from "./server/tenant-routing";

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (!isTenantSlugCandidate(firstSegment) || RESERVED_ROOT_SEGMENTS.has(firstSegment)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-narau-tenant-slug", firstSegment);

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = pathname.slice(firstSegment.length + 1) || "/";

  return NextResponse.rewrite(rewrittenUrl, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

