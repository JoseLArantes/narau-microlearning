import { NextResponse } from "next/server";
import { prisma } from "@narau/database";
import { auth } from "@/server/auth";

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get("areaId");
  const contentDate = searchParams.get("date");

  const subjects = await prisma.subject.findMany({
    where: { status: "ACTIVE" },
    orderBy: { title: "asc" },
    select: { id: true, title: true, canonicalUrl: true },
    take: 500,
  });

  const dailyForArea = areaId && contentDate
    ? await prisma.dailyAreaSubject.findUnique({
        where: { contentDate_areaId: { contentDate: new Date(`${contentDate}T00:00:00.000Z`), areaId } },
        select: { subjectId: true },
      })
    : null;

  return NextResponse.json({ subjects, currentSubjectId: dailyForArea?.subjectId ?? null });
}
