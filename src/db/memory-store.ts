import { CSE_COMPANIES, HISTORICAL_ANNOUNCEMENTS } from "./seed-data";

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  masteryLevel: number;
  startingLevel: number;
  goal: string;
  settings: {
    theme: string;
    preferredTone: "brutal" | "firm";
    beginnerMode: boolean;
    byoApiKey?: string;
    aiProvider?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioEntity {
  id: string;
  userId: string;
  mode: "LIVE_MOCK" | "REPLAY";
  initialCash: number;
  cash: number;
  settledCash: number;
  resetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntryEntity {
  id: string;
  userId: string;
  portfolioId: string;
  orderId?: string;
  type: "DEPOSIT" | "WITHDRAW" | "BUY_FILL" | "SELL_FILL" | "FEE" | "DIVIDEND" | "RESET";
  symbol?: string;
  shares?: number;
  price?: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  cashBalanceAfter: number;
  settlementDate?: string;
  isSettled: boolean;
  idempotencyKey?: string;
  metadata?: any;
  createdAt: string;
}

export interface OrderEntity {
  id: string;
  userId: string;
  portfolioId: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP_LOSS" | "TAKE_PROFIT";
  limitPrice?: number;
  stopPrice?: number;
  shares: number;
  filledShares: number;
  averageFillPrice?: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "EXPIRED";
  journalId?: string;
  createdAt: string;
  evaluatedAt?: string;
  filledAt?: string;
}

export interface TradeJournalEntity {
  id: string;
  userId: string;
  orderId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  thesis: string;
  entryReason: string;
  targetPrice?: number;
  stopLossPrice?: number;
  riskRewardRatio?: number;
  plannedRiskLKR?: number;
  expectedHoldingDays: number;
  confidenceLevel: number;
  checklistCompleted: boolean;
  devilsAdvocateCritique?: string;
  devilsAdvocateAcknowledged: boolean;
  postTradeReview?: string;
  mistakeTags: string[];
  lessonsLearned?: string;
  createdAt: string;
  closedAt?: string;
}

export interface UserProgressEntity {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  confidenceRating: number;
  skillsMastery: Record<string, number>;
  submittedAnswers: any;
  feedback?: string;
  lastAttemptAt: string;
  nextReviewDue?: string;
  reviewIntervalDays: number;
}

class MemoryDataStore {
  public users: Map<string, UserEntity> = new Map();
  public portfolios: Map<string, PortfolioEntity> = new Map();
  public ledger: Map<string, LedgerEntryEntity> = new Map();
  public orders: Map<string, OrderEntity> = new Map();
  public journals: Map<string, TradeJournalEntity> = new Map();
  public progress: Map<string, UserProgressEntity> = new Map();
  public marketCache: Map<string, { data: any; expiresAt: number; source: string }> = new Map();
  public jobs: Map<string, any> = new Map();

  constructor() {
    this.initDefaultDemoUser();
  }

  private initDefaultDemoUser() {
    const demoUserId = "demo-user-1";
    const demoUser: UserEntity = {
      id: demoUserId,
      email: "trader@csemastery.lk",
      name: "Kasun Perera",
      role: "student",
      masteryLevel: 2,
      startingLevel: 0,
      goal: "active_swing",
      settings: {
        theme: "dark",
        preferredTone: "brutal",
        beginnerMode: false,
        aiProvider: "gemini",
      },
      createdAt: new Date("2026-09-01T00:00:00Z").toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(demoUserId, demoUser);

    const portfolioId = "demo-portfolio-1";
    const portfolio: PortfolioEntity = {
      id: portfolioId,
      userId: demoUserId,
      mode: "LIVE_MOCK",
      initialCash: 1000000,
      cash: 1000000,
      settledCash: 1000000,
      resetCount: 0,
      createdAt: new Date("2026-09-01T00:00:00Z").toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.portfolios.set(portfolioId, portfolio);

    // Initial deposit ledger entry
    this.ledger.set("demo-deposit-1", {
      id: "demo-deposit-1",
      userId: demoUserId,
      portfolioId: portfolioId,
      type: "DEPOSIT",
      grossAmount: 1000000,
      feeAmount: 0,
      netAmount: 1000000,
      cashBalanceAfter: 1000000,
      isSettled: true,
      createdAt: new Date("2026-09-01T00:00:00Z").toISOString(),
    });
  }

  // User methods
  public getUser(id: string): UserEntity | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): UserEntity | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public upsertUser(user: UserEntity): UserEntity {
    this.users.set(user.id, user);
    return user;
  }

  // Portfolio methods
  public getPortfolioByUserId(userId: string, mode: "LIVE_MOCK" | "REPLAY" = "LIVE_MOCK"): PortfolioEntity {
    let p = Array.from(this.portfolios.values()).find((item) => item.userId === userId && item.mode === mode);
    if (!p) {
      p = {
        id: `portfolio-${userId}-${mode.toLowerCase()}`,
        userId,
        mode,
        initialCash: 1000000,
        cash: 1000000,
        settledCash: 1000000,
        resetCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.portfolios.set(p.id, p);
    }
    return p;
  }

  public updatePortfolio(portfolio: PortfolioEntity): PortfolioEntity {
    portfolio.updatedAt = new Date().toISOString();
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  // Ledger methods
  public getLedgerByUserId(userId: string, portfolioId?: string): LedgerEntryEntity[] {
    return Array.from(this.ledger.values())
      .filter((l) => l.userId === userId && (!portfolioId || l.portfolioId === portfolioId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addLedgerEntry(entry: LedgerEntryEntity): LedgerEntryEntity {
    this.ledger.set(entry.id, entry);
    return entry;
  }

  // Orders
  public getOrdersByUserId(userId: string, portfolioId?: string): OrderEntity[] {
    return Array.from(this.orders.values())
      .filter((o) => o.userId === userId && (!portfolioId || o.portfolioId === portfolioId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPendingOrders(userId?: string): OrderEntity[] {
    return Array.from(this.orders.values()).filter(
      (o) => o.status === "PENDING" && (!userId || o.userId === userId)
    );
  }

  public upsertOrder(order: OrderEntity): OrderEntity {
    this.orders.set(order.id, order);
    return order;
  }

  // Journals
  public getJournalsByUserId(userId: string): TradeJournalEntity[] {
    return Array.from(this.journals.values())
      .filter((j) => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public upsertJournal(journal: TradeJournalEntity): TradeJournalEntity {
    this.journals.set(journal.id, journal);
    return journal;
  }

  // User Progress
  public getProgressByUserId(userId: string): UserProgressEntity[] {
    return Array.from(this.progress.values()).filter((p) => p.userId === userId);
  }

  public getProgress(userId: string, lessonId: string): UserProgressEntity | undefined {
    return this.progress.get(`${userId}-${lessonId}`);
  }

  public upsertProgress(prog: UserProgressEntity): UserProgressEntity {
    this.progress.set(`${prog.userId}-${prog.lessonId}`, prog);
    return prog;
  }

  // Cache
  public getCache(key: string): any | null {
    const item = this.marketCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.marketCache.delete(key);
      return null;
    }
    return item.data;
  }

  public setCache(key: string, data: any, ttlSeconds = 60, source = "CSE_LIVE"): void {
    this.marketCache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      source,
    });
  }
}

// Global singleton instance for memory data store
const globalStoreKey = Symbol.for("cse_mastery.memory_store");
const globalObj = global as any;

if (!globalObj[globalStoreKey]) {
  globalObj[globalStoreKey] = new MemoryDataStore();
}

export const memoryStore: MemoryDataStore = globalObj[globalStoreKey];
