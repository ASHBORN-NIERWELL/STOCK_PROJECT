import { describe, it, expect, beforeEach } from "vitest";
import { brutalTruthEngine } from "../src/lib/trading/brutal-truth";
import { memoryStore } from "../src/db/memory-store";
import { tradingEngine } from "../src/lib/trading/engine";

describe("Brutal Truth Performance Analytics Engine", () => {
  const userId = "test-brutal-user";

  beforeEach(() => {
    memoryStore.upsertUser({
      id: userId,
      email: "brutal@trader.lk",
      name: "Suresh Silva",
      role: "student",
      masteryLevel: 1,
      startingLevel: 0,
      goal: "career_trader",
      settings: {
        theme: "dark",
        preferredTone: "brutal",
        beginnerMode: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    tradingEngine.resetAccount(userId);
  });

  it("should generate report comparing against ASPI and T-Bill benchmarks", async () => {
    const report = await brutalTruthEngine.generateReport(userId);

    expect(report.benchmarkComparison).toBeDefined();
    expect(report.benchmarkComparison.tBillRiskFreeReturnPercent).toBeGreaterThan(0);
    expect(report.benchmarkComparison.aspiReturnPercent).toBeGreaterThan(0);
    expect(report.verdictTitle).toBeDefined();
    expect(report.brutalVerdict).toBeDefined();
    expect(report.topMistakesWithFixes.length).toBeGreaterThan(0);
  });

  it("should accurately track fee drag and discipline violations", async () => {
    // Execute a buy and sell trade
    await tradingEngine.placeOrder({
      userId,
      symbol: "JKH.N0000",
      side: "BUY",
      type: "MARKET",
      shares: 500,
      thesis: "Support bounce test",
      entryReason: "REBOUND",
      targetPrice: 240,
      stopLossPrice: 200,
      confidenceLevel: 3,
    });

    await tradingEngine.placeOrder({
      userId,
      symbol: "JKH.N0000",
      side: "SELL",
      type: "MARKET",
      shares: 500,
      thesis: "Take profit test",
      entryReason: "REBOUND",
      confidenceLevel: 3,
    });

    const report = await brutalTruthEngine.generateReport(userId);
    expect(report.metrics.totalTrades).toBe(1);
    expect(report.metrics.totalFeesPaidLKR).toBeGreaterThan(0);
    expect(report.discipline.disciplineScore).toBeGreaterThanOrEqual(0);
  });
});
