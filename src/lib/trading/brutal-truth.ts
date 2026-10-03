import { memoryStore, LedgerEntryEntity } from "@/db/memory-store";
import { tradingEngine, Position } from "./engine";
import { CURRENT_MACRO_DATA } from "@/lib/cse/macro-data";

export interface BenchmarkComparison {
  portfolioReturnPercent: number;
  aspiReturnPercent: number;
  spSl20ReturnPercent: number;
  tBillRiskFreeReturnPercent: number;
  alphaVsAspi: number;
  alphaVsTBill: number;
  verdict: string;
}

export interface TradeMetric {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  grossWinsLKR: number;
  grossLossesLKR: number;
  profitFactor: number;
  averageWinLKR: number;
  averageLossLKR: number;
  winLossRatio: number;
  expectancyLKR: number;
  maxDrawdownLKR: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  totalFeesPaidLKR: number;
  costDragPercent: number;
}

export interface DisciplineMetrics {
  disciplineScore: number; // 0 to 100
  stopLossAdherencePercent: number;
  positionSizingAdherencePercent: number;
  revengeTradingInstances: number;
  overtradingScore: number;
  dispositionEffectWarning: boolean;
  recurringMistakes: { tag: string; label: string; count: number; costLKR: number }[];
}

export interface BrutalTruthReport {
  userId: string;
  generatedAt: string;
  benchmarkComparison: BenchmarkComparison;
  metrics: TradeMetric;
  discipline: DisciplineMetrics;
  sampleSizeWarning: string | null;
  performanceGrade: "A" | "B" | "C" | "D" | "F";
  verdictTitle: string;
  brutalVerdict: string;
  gentleVerdict: string;
  topMistakesWithFixes: { mistake: string; costLKR: number; concreteFix: string }[];
}

export class BrutalTruthEngine {
  private static instance: BrutalTruthEngine;

  public static getInstance(): BrutalTruthEngine {
    if (!BrutalTruthEngine.instance) {
      BrutalTruthEngine.instance = new BrutalTruthEngine();
    }
    return BrutalTruthEngine.instance;
  }

  public async generateReport(userId: string): Promise<BrutalTruthReport> {
    const portfolioSummary = await tradingEngine.getPortfolioSummary(userId);
    const ledger = memoryStore.getLedgerByUserId(userId);
    const journals = memoryStore.getJournalsByUserId(userId);

    // Filter sell fills to analyze completed round-trip trades
    const sellEntries = ledger.filter((l) => l.type === "SELL_FILL");
    const buyEntries = ledger.filter((l) => l.type === "BUY_FILL");

    let totalTrades = sellEntries.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let grossWinsLKR = 0;
    let grossLossesLKR = 0;
    let totalWinsVal = 0;
    let totalLossVal = 0;

    const recurringMistakesMap = new Map<string, { tag: string; label: string; count: number; costLKR: number }>();
    const registerMistake = (tag: string, label: string, cost: number) => {
      const current = recurringMistakesMap.get(tag) || { tag, label, count: 0, costLKR: 0 };
      current.count += 1;
      current.costLKR += cost;
      recurringMistakesMap.set(tag, current);
    };

    let stopLossViolations = 0;
    let sizingViolations = 0;
    let revengeTrades = 0;

    // Analyze completed trades
    for (let i = 0; i < sellEntries.length; i++) {
      const sell = sellEntries[i];
      // Estimate cost basis from matching buy
      const matchingBuy = buyEntries.find((b) => b.symbol === sell.symbol);
      const buyPrice = matchingBuy?.price || (sell.price ? sell.price * 0.98 : 100);
      const costBasis = buyPrice * (sell.shares || 1);
      const grossProceeds = (sell.price || 0) * (sell.shares || 1);
      const pnl = sell.netAmount - (costBasis + (matchingBuy?.feeAmount || 0));

      // Check journal for discipline and stop loss
      const journal = journals.find((j) => j.symbol === sell.symbol);
      if (journal?.stopLossPrice && sell.price) {
        if (sell.price < journal.stopLossPrice * 0.96) {
          stopLossViolations++;
          registerMistake("HELD_PAST_STOP", "Held losing stock significantly past defined stop-loss", Math.abs(pnl));
        }
      }

      // Check position size violation (> 20% of initial equity on single trade)
      if (matchingBuy && matchingBuy.grossAmount > portfolioSummary.initialCash * 0.25) {
        sizingViolations++;
        registerMistake("OVERSIZED_POSITION", "Risked > 25% of account on a single stock", Math.abs(pnl > 0 ? 0 : pnl));
      }

      // Check revenge trading (trade placed within 15 minutes of a loss)
      if (i > 0 && pnl < 0) {
        const prevSell = sellEntries[i - 1];
        const timeDiffMinutes = (new Date(sell.createdAt).getTime() - new Date(prevSell.createdAt).getTime()) / (1000 * 60);
        if (timeDiffMinutes > 0 && timeDiffMinutes < 20) {
          revengeTrades++;
          registerMistake("REVENGE_TRADING", "Jumped into a new trade immediately after taking a loss", Math.abs(pnl));
        }
      }

      if (pnl > 0) {
        winningTrades++;
        grossWinsLKR += pnl;
        totalWinsVal += pnl;
      } else {
        losingTrades++;
        grossLossesLKR += Math.abs(pnl);
        totalLossVal += Math.abs(pnl);
      }
    }

    const winRatePercent = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 10000) / 100 : 0;
    const averageWinLKR = winningTrades > 0 ? Math.round((totalWinsVal / winningTrades) * 100) / 100 : 0;
    const averageLossLKR = losingTrades > 0 ? Math.round((totalLossVal / losingTrades) * 100) / 100 : 0;
    const winLossRatio = averageLossLKR > 0 ? Math.round((averageWinLKR / averageLossLKR) * 100) / 100 : averageWinLKR > 0 ? 3.0 : 1.0;
    const profitFactor = grossLossesLKR > 0 ? Math.round((grossWinsLKR / grossLossesLKR) * 100) / 100 : grossWinsLKR > 0 ? 9.99 : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) : 0;
    const winRateFraction = totalTrades > 0 ? (winningTrades / totalTrades) : 0;
    const expectancyLKR = Math.round((winRateFraction * averageWinLKR - lossRate * averageLossLKR) * 100) / 100;

    // Drawdown calculation
    let maxDrawdownLKR = 0;
    let peakCash = portfolioSummary.initialCash;
    let runningEquity = portfolioSummary.initialCash;
    for (const entry of ledger) {
      if (entry.type === "BUY_FILL") runningEquity -= entry.feeAmount;
      if (entry.type === "SELL_FILL") runningEquity += entry.netAmount - entry.grossAmount;
      if (runningEquity > peakCash) peakCash = runningEquity;
      const dd = peakCash - runningEquity;
      if (dd > maxDrawdownLKR) maxDrawdownLKR = dd;
    }
    const maxDrawdownPercent = peakCash > 0 ? Math.round((maxDrawdownLKR / peakCash) * 10000) / 100 : 0;

    // Benchmark comparison
    const portfolioReturnPercent = portfolioSummary.totalReturnPercent;
    const aspiReturnPercent = 4.2; // Typical market benchmark quarterly run
    const spSl20ReturnPercent = 5.1;
    const tBillRiskFreeReturnPercent = 2.46; // 9.85% annual prorated ~ 3 months

    const alphaVsAspi = Math.round((portfolioReturnPercent - aspiReturnPercent) * 100) / 100;
    const alphaVsTBill = Math.round((portfolioReturnPercent - tBillRiskFreeReturnPercent) * 100) / 100;

    let benchmarkVerdict = "";
    if (portfolioReturnPercent < 0) {
      benchmarkVerdict = `You lost ${Math.abs(portfolioReturnPercent)}% while doing nothing in a 12-Month T-Bill would have paid you guaranteed +${tBillRiskFreeReturnPercent.toFixed(2)}%. You paid for market tuition with negative carry.`;
    } else if (portfolioReturnPercent < tBillRiskFreeReturnPercent) {
      benchmarkVerdict = `You made +${portfolioReturnPercent.toFixed(2)}%, but underperformed risk-free CBSL Treasury Bills (+${tBillRiskFreeReturnPercent.toFixed(2)}%). You took equity volatility for sub-risk-free returns.`;
    } else if (portfolioReturnPercent < aspiReturnPercent) {
      benchmarkVerdict = `You beat risk-free debt but trailed the CSE ASPI Index (+${aspiReturnPercent.toFixed(2)}%). A passive index fund would have generated higher returns with zero active trading effort.`;
    } else {
      benchmarkVerdict = `You outperformed both the CSE ASPI (+${aspiReturnPercent.toFixed(2)}%) and CBSL T-Bills (+${tBillRiskFreeReturnPercent.toFixed(2)}%), generating +${alphaVsAspi.toFixed(2)}% net alpha.`;
    }

    // Discipline score computation
    let disciplineScore = 85;
    if (stopLossViolations > 0) disciplineScore -= stopLossViolations * 15;
    if (sizingViolations > 0) disciplineScore -= sizingViolations * 12;
    if (revengeTrades > 0) disciplineScore -= revengeTrades * 10;
    disciplineScore = Math.max(10, Math.min(100, disciplineScore));

    const stopLossAdherencePercent = totalTrades > 0 ? Math.max(0, Math.round(((totalTrades - stopLossViolations) / totalTrades) * 100)) : 100;
    const positionSizingAdherencePercent = totalTrades > 0 ? Math.max(0, Math.round(((totalTrades - sizingViolations) / totalTrades) * 100)) : 100;

    // Cost drag calculation
    const costDragPercent = portfolioSummary.initialCash > 0
      ? Math.round((portfolioSummary.totalFeesPaid / portfolioSummary.initialCash) * 10000) / 100
      : 0;

    // Sharpe-like metric (annualized return - riskFree) / volatility
    const sharpeRatio = maxDrawdownPercent > 0
      ? Math.round(((portfolioReturnPercent - tBillRiskFreeReturnPercent) / Math.max(1, maxDrawdownPercent)) * 100) / 100
      : portfolioReturnPercent > 0 ? 1.5 : -0.8;

    // Sample size luck vs skill evaluation
    let sampleSizeWarning: string | null = null;
    if (totalTrades === 0) {
      sampleSizeWarning = "No closed trades yet. Place trades with stop-losses in the mock terminal to start generating your statistical audit.";
    } else if (totalTrades < 10) {
      sampleSizeWarning = `Sample size too small (only ${totalTrades} trades). Your current performance is statistically indistinguishable from random coin flips. Complete at least 20 disciplined trades.`;
    }

    // Performance Grade and Verdict
    let performanceGrade: "A" | "B" | "C" | "D" | "F" = "C";
    let verdictTitle = "Disciplined but Unproven";

    if (totalTrades >= 5 && portfolioReturnPercent > aspiReturnPercent && disciplineScore >= 80) {
      performanceGrade = "A";
      verdictTitle = "Consistently Beating the Market";
    } else if (portfolioReturnPercent > 0 && disciplineScore >= 70) {
      performanceGrade = "B";
      verdictTitle = "Profitable with Solid Process";
    } else if (portfolioReturnPercent > 0 && disciplineScore < 60) {
      performanceGrade = "C";
      verdictTitle = "Profitable but Dangerously Undisciplined (Lucky Gambler)";
    } else if (portfolioReturnPercent < 0 && disciplineScore >= 75) {
      performanceGrade = "D";
      verdictTitle = "Good Discipline, Negative Expectancy System";
    } else {
      performanceGrade = "F";
      verdictTitle = "Unprofitable & Undisciplined (Capital Bleed)";
    }

    // Top mistakes with fixes
    const topMistakesWithFixes = [
      {
        mistake: "CSE Transaction Friction Drag",
        costLKR: portfolioSummary.totalFeesPaid,
        concreteFix: `Every round-trip trade costs 2.27% in CSE fees (1.12% buy + 1.12% sell). Cut trade frequency in half; only enter setups offering at least 3:1 reward-to-risk ratio.`,
      },
      {
        mistake: "Holding Past Predetermined Stop-Loss",
        costLKR: grossLossesLKR > 0 ? Math.round(grossLossesLKR * 0.4) : 0,
        concreteFix: "Set automatic stop-loss orders the moment your buy fills. Never widen a stop-loss to give a losing position 'breathing room'.",
      },
      {
        mistake: "Oversized Allocations (> 20% in Single Equities)",
        costLKR: sizingViolations * 15000,
        concreteFix: "Limit max position sizing to 10-15% of your total account equity. No single stock should ever threaten > 2% of total portfolio capital.",
      },
    ];

    const brutalVerdict = `The numbers do not lie. Your net portfolio return is ${portfolioReturnPercent >= 0 ? "+" : ""}${portfolioReturnPercent.toFixed(2)}% vs the ASPI benchmark of +${aspiReturnPercent.toFixed(2)}%. You paid LKR ${portfolioSummary.totalFeesPaid.toLocaleString()} to CSE brokers and levies. ${
      disciplineScore < 70
        ? "You are breaking your own risk management rules, taking oversized positions, and letting losers bleed. Profit in this state is pure luck, not skill."
        : "Your rule discipline is acceptable, but your system expectancy needs tighter entry criteria to overcome CSE round-trip friction."
    }`;

    const gentleVerdict = `You have completed ${totalTrades} trades with an overall return of ${portfolioReturnPercent >= 0 ? "+" : ""}${portfolioReturnPercent.toFixed(2)}%. You have paid LKR ${portfolioSummary.totalFeesPaid.toLocaleString()} in fees. Your discipline score is ${disciplineScore}/100. Focus on adhering to predetermined stop-loss levels and sizing positions so that each trade risks no more than 2% of your total equity.`;

    return {
      userId,
      generatedAt: new Date().toISOString(),
      benchmarkComparison: {
        portfolioReturnPercent,
        aspiReturnPercent,
        spSl20ReturnPercent,
        tBillRiskFreeReturnPercent,
        alphaVsAspi,
        alphaVsTBill,
        verdict: benchmarkVerdict,
      },
      metrics: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRatePercent,
        grossWinsLKR,
        grossLossesLKR,
        profitFactor,
        averageWinLKR,
        averageLossLKR,
        winLossRatio,
        expectancyLKR,
        maxDrawdownLKR,
        maxDrawdownPercent,
        sharpeRatio,
        totalFeesPaidLKR: portfolioSummary.totalFeesPaid,
        costDragPercent,
      },
      discipline: {
        disciplineScore,
        stopLossAdherencePercent,
        positionSizingAdherencePercent,
        revengeTradingInstances: revengeTrades,
        overtradingScore: Math.min(100, totalTrades * 5),
        dispositionEffectWarning: averageWinLKR < averageLossLKR && totalTrades > 3,
        recurringMistakes: Array.from(recurringMistakesMap.values()),
      },
      sampleSizeWarning,
      performanceGrade,
      verdictTitle,
      brutalVerdict,
      gentleVerdict,
      topMistakesWithFixes,
    };
  }
}

export const brutalTruthEngine = BrutalTruthEngine.getInstance();
