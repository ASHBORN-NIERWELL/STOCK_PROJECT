import { pgTable, text, timestamp, numeric, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"),
  masteryLevel: integer("mastery_level").notNull().default(0),
  startingLevel: integer("starting_level").notNull().default(0),
  goal: text("goal").default("active_swing"),
  settings: jsonb("settings").default({
    theme: "dark",
    preferredTone: "brutal",
    beginnerMode: false,
    byoApiKey: "",
    aiProvider: "gemini",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Portfolios / Mock Accounts
export const portfolios = pgTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mode: text("mode").notNull().default("LIVE_MOCK"), // 'LIVE_MOCK' | 'REPLAY'
  initialCash: numeric("initial_cash", { precision: 18, scale: 2 }).notNull().default("1000000.00"),
  cash: numeric("cash", { precision: 18, scale: 2 }).notNull().default("1000000.00"),
  settledCash: numeric("settled_cash", { precision: 18, scale: 2 }).notNull().default("1000000.00"),
  resetCount: integer("reset_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Append-only Ledger of all trades, fills, fees, cash movements
export const ledgerEntries = pgTable("ledger_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id, { onDelete: "cascade" }),
  orderId: text("order_id"),
  type: text("type").notNull(), // 'DEPOSIT' | 'WITHDRAW' | 'BUY_FILL' | 'SELL_FILL' | 'FEE' | 'DIVIDEND' | 'RESET'
  symbol: text("symbol"),
  shares: integer("shares"),
  price: numeric("price", { precision: 14, scale: 2 }),
  grossAmount: numeric("gross_amount", { precision: 18, scale: 2 }).notNull(),
  feeAmount: numeric("fee_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  netAmount: numeric("net_amount", { precision: 18, scale: 2 }).notNull(),
  cashBalanceAfter: numeric("cash_balance_after", { precision: 18, scale: 2 }).notNull(),
  settlementDate: timestamp("settlement_date", { withTimezone: true }),
  isSettled: boolean("is_settled").notNull().default(true),
  idempotencyKey: text("idempotency_key").unique(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'BUY' | 'SELL'
  type: text("type").notNull(), // 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT'
  limitPrice: numeric("limit_price", { precision: 14, scale: 2 }),
  stopPrice: numeric("stop_price", { precision: 14, scale: 2 }),
  shares: integer("shares").notNull(),
  filledShares: integer("filled_shares").notNull().default(0),
  averageFillPrice: numeric("average_fill_price", { precision: 14, scale: 2 }),
  status: text("status").notNull().default("PENDING"), // 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED'
  journalId: text("journal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }),
  filledAt: timestamp("filled_at", { withTimezone: true }),
});

// Trade Journals (Mandatory before trade execution)
export const tradeJournals = pgTable("trade_journals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: text("order_id"),
  symbol: text("symbol").notNull(),
  side: text("side").notNull().default("BUY"),
  thesis: text("thesis").notNull(),
  entryReason: text("entry_reason").notNull(), // 'BREAKOUT' | 'VALUE' | 'EARNINGS' | 'MOMENTUM' | 'REBOUND' | 'DIVIDEND' | 'OTHER'
  targetPrice: numeric("target_price", { precision: 14, scale: 2 }),
  stopLossPrice: numeric("stop_loss_price", { precision: 14, scale: 2 }),
  riskRewardRatio: numeric("risk_reward_ratio", { precision: 8, scale: 2 }),
  plannedRiskLKR: numeric("planned_risk_lkr", { precision: 18, scale: 2 }),
  expectedHoldingDays: integer("expected_holding_days").default(5),
  confidenceLevel: integer("confidence_level").notNull().default(3), // 1 to 5
  checklistCompleted: boolean("checklist_completed").notNull().default(true),
  devilsAdvocateCritique: text("devils_advocate_critique"),
  devilsAdvocateAcknowledged: boolean("devils_advocate_acknowledged").default(false),
  postTradeReview: text("post_trade_review"),
  mistakeTags: jsonb("mistake_tags").default([]),
  lessonsLearned: text("lessons_learned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// Curriculum Lessons
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  level: integer("level").notNull(), // 0 to 10
  moduleIndex: integer("module_index").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  spec: jsonb("spec").notNull(),
  isPublished: boolean("is_published").notNull().default(true),
});

// User Learning Progress & Mastery
export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  score: numeric("score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  attempts: integer("attempts").notNull().default(0),
  confidenceRating: integer("confidence_rating").default(3),
  skillsMastery: jsonb("skills_mastery").default({}),
  submittedAnswers: jsonb("submitted_answers").default({}),
  feedback: text("feedback"),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).notNull().defaultNow(),
  nextReviewDue: timestamp("next_review_due", { withTimezone: true }),
  reviewIntervalDays: integer("review_interval_days").default(1),
});

// Shared Daily Content (Generated once per day after market close)
export const sharedDailyContent = pgTable("shared_daily_content", {
  id: text("id").primaryKey(), // 'daily-YYYY-MM-DD'
  date: text("date").notNull().unique(), // 'YYYY-MM-DD'
  marketPulse: jsonb("market_pulse").notNull(),
  liveCaseOfTheDay: jsonb("live_case_of_the_day").notNull(),
  conceptOfTheDay: jsonb("concept_of_the_day").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  validated: boolean("validated").notNull().default(true),
});

// Market Cache for serverless single-flight reuse
export const marketCache = pgTable("market_cache", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  source: text("source").notNull().default("CSE_LIVE"),
});

// Scheduled Jobs Execution Tracking
export const jobsLog = pgTable("jobs_log", {
  id: text("id").primaryKey(),
  jobName: text("job_name").notNull(),
  status: text("status").notNull(), // 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  step: text("step").default("init"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  metadata: jsonb("metadata").default({}),
});
