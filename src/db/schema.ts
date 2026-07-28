import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  rawSituation: text("raw_situation").notNull(),
  neutralSituation: text("neutral_situation").notNull(),
  question: text("question").notNull(),
  quorumSize: integer("quorum_size").notNull().default(3),
  status: text("status").notNull().default("open"),
  createdAt: text("created_at").default(sql`(current_timestamp)`).notNull(),
});

export const caseUpdates = sqliteTable("case_updates", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  rawContent: text("raw_content").notNull(),
  neutralContent: text("neutral_content").notNull(),
  round: integer("round").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`).notNull(),
});

export const verdicts = sqliteTable("verdicts", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  updateId: text("update_id").references(() => caseUpdates.id, { onDelete: "cascade" }),
  updateRound: integer("update_round").notNull().default(0),
  fingerprint: text("fingerprint").notNull(),
  value: text("value").notNull(),
  comment: text("comment").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`).notNull(),
});
