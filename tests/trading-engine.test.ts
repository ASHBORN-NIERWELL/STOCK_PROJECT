import { describe, it, expect, beforeEach } from "vitest";
import { tradingEngine } from "../src/lib/trading/engine";
import { memoryStore } from "../src/db/memory-store";

describe("Mock Trading Engine & Ledger Integration", () => {
  const testUserId = "test-trader-1";

  beforeEach(() => {
    // Reset or seed test user
    memoryStore.upsertUser({
      id: testUserId,
      email: "test@trader.lk",
      name: "Nimal Perera",
      role: "student",
      masteryLevel: 3, // Level 3 allowed higher position sizes
      startingLevel: 0,
      goal: "active_swing",
      settings: {
        theme: "dark",
        preferredTone: "brutal",
        beginnerMode: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    tradingEngine.resetAccount(testUserId);
  });

  it("should initialize account with LKR 1,000,000 cash", async () => {
    const summary = await tradingEngine.getPortfolioSummary(testUserId);
    expect(summary.cash).toBe(1000000);
    expect(summary.stockValue).toBe(0);
    expect(summary.totalEquity).toBe(1000000);
    expect(summary.positions.length).toBe(0);
  });

  it("should execute a MARKET BUY order, deduct cash and fees, and write to ledger", async () => {
    const buyResult = await tradingEngine.placeOrder({
      userId: testUserId,
      symbol: "COMB.N0000",
      side: "BUY",
      type: "MARKET",
      shares: 1000,
      thesis: "Bullish divergence on banking recovery and falling NPLs.",
      entryReason: "VALUE",
      targetPrice: 140,
      stopLossPrice: 115,
      confidenceLevel: 4,
    });

    expect(buyResult.success).toBe(true);
    expect(buyResult.status).toBe("FILLED");
    expect(buyResult.fees).toBeDefined();
    expect(buyResult.fees?.totalFees).toBeGreaterThan(0);

    const summary = await tradingEngine.getPortfolioSummary(testUserId);
    expect(summary.positions.length).toBe(1);
    expect(summary.positions[0].symbol).toBe("COMB.N0000");
    expect(summary.positions[0].shares).toBe(1000);
    expect(summary.cash).toBeLessThan(1000000);

    // Verify ledger has deposit and buy_fill
    const ledger = memoryStore.getLedgerByUserId(testUserId);
    expect(ledger.some((e) => e.type === "BUY_FILL")).toBe(true);
  });

  it("should reject SELL order if user does not own sufficient shares", async () => {
    const sellResult = await tradingEngine.placeOrder({
      userId: testUserId,
      symbol: "JKH.N0000",
      side: "SELL",
      type: "MARKET",
      shares: 500,
      thesis: "Shorting",
      entryReason: "MOMENTUM",
      confidenceLevel: 2,
    });

    expect(sellResult.success).toBe(false);
    expect(sellResult.status).toBe("REJECTED");
    expect(sellResult.message).toContain("Insufficient shares");
  });
});
