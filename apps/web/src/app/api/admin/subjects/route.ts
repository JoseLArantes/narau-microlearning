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

  const parsedDate = contentDate ? new Date(`${contentDate}T00:00:00.000Z`) : null;
  const candidates = areaId && parsedDate && !Number.isNaN(parsedDate.valueOf())
    ? await prisma.areaSubjectCandidate.findMany({
        where: {
          tenantId: tenant.id,
          areaId,
          generatedForDate: parsedDate,
          status: { in: ["CANDIDATE", "SELECTED"] },
          subject: { status: "ACTIVE" },
        },
        orderBy: { candidateScore: "desc" },
        select: { subject: { select: { id: true, title: true, canonicalUrl: true } } },
        take: 500,
      })
    : [];
  const subjects = candidates.map((candidate) => candidate.subject);

  const dailyForArea = areaId && parsedDate && !Number.isNaN(parsedDate.valueOf())
    ? await prisma.dailyAreaSubject.findUnique({
        where: { contentDate_areaId_tenantId: { contentDate: parsedDate, areaId, tenantId: tenant.id } },
        select: { subjectId: true },
      })
    : null;

  return NextResponse.json({ subjects, currentSubjectId: dailyForArea?.subjectId ?? null });
}
