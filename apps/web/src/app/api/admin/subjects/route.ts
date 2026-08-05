import { NextResponse } from "next/server";
import { prisma } from "@narau/database";
import { requireTenantAdmin } from "@/server/guards";
import type { TenantRecord } from "@/server/tenant";

export async function GET(request: Request): Promise<NextResponse> {
  let tenant: TenantRecord;
  try {
    ({ tenant } = await requireTenantAdmin());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get("areaId");
  const contentDate = searchParams.get("date");

  const subjects = await prisma.subject.findMany({
    where: { tenantId: tenant.id, status: "ACTIVE" },
    orderBy: { title: "asc" },
    select: { id: true, title: true, canonicalUrl: true },
    take: 500,
  });

  const dailyForArea = areaId && contentDate
    ? await prisma.dailyAreaSubject.findUnique({
        where: { contentDate_areaId_tenantId: { contentDate: new Date(`${contentDate}T00:00:00.000Z`), areaId, tenantId: tenant.id } },
        select: { subjectId: true },
      })
    : null;

  return NextResponse.json({ subjects, currentSubjectId: dailyForArea?.subjectId ?? null });
}
