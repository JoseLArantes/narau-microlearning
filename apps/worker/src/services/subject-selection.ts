import { prisma } from "@narau/database";

export interface SelectionAreaCandidate {
  id: string;
  subjectId: string;
  candidateScore: number;
}

export interface SubjectSelectionRepository {
  loadActiveAreas(): Promise<Array<{ id: string; tenantId: string }>>;
  loadCandidates(areaId: string, tenantId: string, contentDate: Date): Promise<SelectionAreaCandidate[]>;
  loadRecentlySelectedSubjectIds(areaId: string, tenantId: string, since: Date): Promise<string[]>;
  findExisting(areaId: string, tenantId: string, contentDate: Date): Promise<{ id: string; selectedBy: string | null } | null>;
  upsertDailySubject(input: {
    tenantId: string;
    contentDate: Date;
    areaId: string;
    subjectId: string;
    selectedBy: string;
    id?: string;
  }): Promise<unknown>;
  markSelected(candidateId: string): Promise<unknown>;
  markRejected(candidateId: string): Promise<unknown>;
}

export interface SelectionResult {
  areas: number;
  selected: number;
  skipped: string[];
}

export const prismaSubjectSelectionRepository: SubjectSelectionRepository = {
  async loadActiveAreas() {
    return prisma.area.findMany({ where: { status: "ACTIVE", tenant: { status: "ACTIVE" } }, select: { id: true, tenantId: true } });
  },

  async loadCandidates(areaId, tenantId, contentDate) {
    return prisma.areaSubjectCandidate.findMany({
      where: { areaId, tenantId, generatedForDate: contentDate, status: "CANDIDATE", subject: { status: "ACTIVE" } },
      select: { id: true, subjectId: true, candidateScore: true },
    });
  },

  async loadRecentlySelectedSubjectIds(areaId, tenantId, since) {
    const items = await prisma.dailyAreaSubject.findMany({
      where: { areaId, tenantId, contentDate: { gte: since } },
      select: { subjectId: true },
    });
    return items.map((item) => item.subjectId);
  },

  findExisting(areaId, tenantId, contentDate) {
    return prisma.dailyAreaSubject.findUnique({
      where: { contentDate_areaId_tenantId: { contentDate, areaId, tenantId } },
      select: { id: true, selectedBy: true },
    });
  },

  upsertDailySubject(input) {
    return prisma.dailyAreaSubject.upsert({
      where: input.id
        ? { id: input.id }
        : { contentDate_areaId_tenantId: { contentDate: input.contentDate, areaId: input.areaId, tenantId: input.tenantId } },
      update: { subjectId: input.subjectId, selectedBy: input.selectedBy, status: "PUBLISHED" },
      create: {
        tenantId: input.tenantId,
        contentDate: input.contentDate,
        areaId: input.areaId,
        subjectId: input.subjectId,
        selectedBy: input.selectedBy,
      },
    });
  },

  markSelected(candidateId) {
    return prisma.areaSubjectCandidate.update({ where: { id: candidateId }, data: { status: "SELECTED" } });
  },

  markRejected(candidateId) {
    return prisma.areaSubjectCandidate.update({ where: { id: candidateId }, data: { status: "REJECTED" } });
  },
};

const RECENT_WINDOW_DAYS = 30;
const WORKER_ACTOR = "worker";

/**
 * Selects one subject per active area for the given content date.
 * Admin overrides (selectedBy starting with "admin:") are never overwritten.
 */
export async function selectDailySubjects(date: Date, repo: SubjectSelectionRepository): Promise<SelectionResult> {
  const result: SelectionResult = { areas: 0, selected: 0, skipped: [] };
  const areas = await repo.loadActiveAreas();
  result.areas = areas.length;
  const since = new Date(date.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  for (const area of areas) {
    const existing = await repo.findExisting(area.id, area.tenantId, date);
    if (existing && existing.selectedBy?.startsWith("admin:")) {
      result.skipped.push(area.id);
      continue;
    }

    const recentlyUsed = new Set(await repo.loadRecentlySelectedSubjectIds(area.id, area.tenantId, since));
    const candidates = (await repo.loadCandidates(area.id, area.tenantId, date)).filter(
      (candidate) => !recentlyUsed.has(candidate.subjectId),
    );
    if (candidates.length === 0) {
      result.skipped.push(area.id);
      continue;
    }

    const pick = candidates[0];
    if (!pick) continue;
    const shuffled = [...candidates].sort((a, b) => {
      const byScore = b.candidateScore - a.candidateScore;
      if (byScore !== 0) return byScore;
      return Math.random() - 0.5;
    });
    const winner = shuffled[0] ?? pick;

    await repo.upsertDailySubject({
      tenantId: area.tenantId,
      contentDate: date,
      areaId: area.id,
      subjectId: winner.subjectId,
      selectedBy: WORKER_ACTOR,
      id: existing?.id,
    });
    await repo.markSelected(winner.id);
    await Promise.all(
      candidates.filter((candidate) => candidate.id !== winner.id).map((candidate) => repo.markRejected(candidate.id)),
    );
    result.selected += 1;
  }

  return result;
}
