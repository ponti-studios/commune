import "~/lib/server/env";
import { db, cases, eq, verdicts } from "~/db";
import { queryCache } from "./cache";

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

type CaseCreateInput = {
  rawSituation: string;
  neutralSituation: string;
  question: string;
  quorumSize: number;
};

type VerdictCreateInput = {
  caseId: string;
  fingerprint: string;
  value: string;
  comment: string;
  updateId?: string | null;
  updateRound?: number;
};

export async function createCase(data: CaseCreateInput): Promise<CaseRow> {
  const id = crypto.randomUUID();
  db.insert(cases)
    .values({ id, ...data })
    .run();
  const inserted = db.select().from(cases).where(eq(cases.id, id)).get();
  if (!inserted) throw new Error("Failed to insert case");
  queryCache.invalidatePattern(/^cases:/);
  return inserted;
}

export async function createVerdict(data: VerdictCreateInput): Promise<VerdictRow> {
  const id = crypto.randomUUID();
  db.insert(verdicts)
    .values({ id, ...data })
    .run();
  const inserted = db.select().from(verdicts).where(eq(verdicts.id, id)).get();
  if (!inserted) throw new Error("Failed to insert verdict");
  queryCache.invalidate(`case:${data.caseId}:stats`);
  queryCache.invalidate(`case:${data.caseId}`);
  return inserted;
}
