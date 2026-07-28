import "~/lib/server/env";
import { db, cases, verdicts, caseUpdates, desc, eq, inArray, sql } from "~/db";

type CaseRow = {
  id: string;
  rawSituation: string;
  neutralSituation: string;
  question: string;
  quorumSize: number;
  status: string;
  createdAt: string;
};

type VerdictRow = {
  id: string;
  caseId: string;
  updateId: string | null;
  updateRound: number;
  fingerprint: string;
  value: string;
  comment: string;
  createdAt: string;
};

type UpdateRow = {
  id: string;
  caseId: string;
  rawContent: string;
  neutralContent: string;
  round: number;
  createdAt: string;
};

export type CaseWithStats = CaseRow & {
  voteStats: {
    total: number;
    agree: number;
    disagree: number;
    agreePercent: number;
    quorumMet: boolean;
  };
};

async function getCases(): Promise<CaseRow[]> {
  return db.select().from(cases).orderBy(desc(cases.createdAt)).all();
}

async function getCase(id: string): Promise<CaseRow | null> {
  return (
    db.select().from(cases).where(eq(cases.id, id)).get() ?? null
  );
}

async function getCaseUpdates(caseId: string): Promise<UpdateRow[]> {
  return db
    .select()
    .from(caseUpdates)
    .where(eq(caseUpdates.caseId, caseId))
    .orderBy(caseUpdates.round)
    .all();
}

export async function getVerdictsByCase(caseId: string): Promise<VerdictRow[]> {
  return db
    .select()
    .from(verdicts)
    .where(eq(verdicts.caseId, caseId))
    .orderBy(desc(verdicts.createdAt))
    .all();
}

async function getVerdictStats(
  caseId: string,
  quorumSize: number,
): Promise<CaseWithStats["voteStats"]> {
  const result = db
    .select({
      total: sql<number>`count(*)`.as("total"),
      agree: sql<number>`sum(case when value = 'agree' then 1 else 0 end)`.as("agree"),
    })
    .from(verdicts)
    .where(eq(verdicts.caseId, caseId))
    .get();

  const total = Number(result?.total) || 0;
  const agree = Number(result?.agree) || 0;
  const disagree = total - agree;
  return {
    total,
    agree,
    disagree,
    agreePercent: total > 0 ? Math.round((agree / total) * 100) : 0,
    quorumMet: total >= quorumSize,
  };
}

export async function getCasesWithStats(): Promise<CaseWithStats[]> {
  const allCases = await getCases();
  if (allCases.length === 0) return [];

  const caseIds = allCases.map((c) => c.id);
  const verdictStats = db
    .select({
      caseId: verdicts.caseId,
      total: sql<number>`count(*)`.as("total"),
      agree: sql<number>`sum(case when value = 'agree' then 1 else 0 end)`.as("agree"),
    })
    .from(verdicts)
    .where(inArray(verdicts.caseId, caseIds))
    .groupBy(verdicts.caseId)
    .all();

  const statsMap = new Map(
    verdictStats.map((s) => [
      s.caseId,
      { total: Number(s.total) || 0, agree: Number(s.agree) || 0 },
    ]),
  );

  return allCases.map((c) => {
    const raw = statsMap.get(c.id) ?? { total: 0, agree: 0 };
    const disagree = raw.total - raw.agree;
    return {
      ...c,
      voteStats: {
        total: raw.total,
        agree: raw.agree,
        disagree,
        agreePercent: raw.total > 0 ? Math.round((raw.agree / raw.total) * 100) : 0,
        quorumMet: raw.total >= c.quorumSize,
      },
    };
  });
}

export async function getCaseWithStats(
  id: string,
): Promise<(CaseWithStats & { updates: UpdateRow[] }) | null> {
  const caseRecord = await getCase(id);
  if (!caseRecord) return null;
  const [stats, updates] = await Promise.all([
    getVerdictStats(id, caseRecord.quorumSize),
    getCaseUpdates(id),
  ]);
  return { ...caseRecord, voteStats: stats, updates };
}
