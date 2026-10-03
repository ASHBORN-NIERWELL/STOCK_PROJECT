import { cseProvider } from "@/lib/cse/provider";
import { ALL_LESSONS, LessonSpec } from "./curriculum";
import { memoryStore } from "@/db/memory-store";
import { tradingEngine } from "@/lib/trading/engine";
import { brutalTruthEngine } from "@/lib/trading/brutal-truth";

export interface MarketPulseBrief {
  date: string;
  aspiMove: string;
  breadthSummary: string;
  turnoverSummary: string;
  topGainerNote: string;
  keyAnnouncement: string;
  macroTakeaway: string;
}

export interface LiveCaseExercise {
  id: string;
  symbol: string;
  companyName: string;
  setupSummary: string;
  catalystPrompt: string;
  options: { id: string; label: string; isCorrect: boolean; explanation: string }[];
  actualOutcome: string;
  keyTakeaway: string;
}

export interface ConceptOfTheDay {
  title: string;
  tag: string;
  summary: string;
  cseExample: string;
  glossaryTerm: string;
}

export interface DailySessionData {
  date: string;
  marketPulse: MarketPulseBrief;
  todayLesson: LessonSpec;
  liveCase: LiveCaseExercise;
  conceptOfTheDay: ConceptOfTheDay;
  reviewItems: { lessonId: string; title: string; skill: string }[];
  accountCheckIn: {
    portfolioEquity: number;
    dailyPnLLKR: number;
    dailyPnLPercent: number;
    behaviorObservation: string;
    actionForTomorrow: string;
  };
}

export class DailySessionEngine {
  private static instance: DailySessionEngine;

  public static getInstance(): DailySessionEngine {
    if (!DailySessionEngine.instance) {
      DailySessionEngine.instance = new DailySessionEngine();
    }
    return DailySessionEngine.instance;
  }

  public async getTodaySession(userId: string): Promise<DailySessionData> {
    const today = new Date().toISOString().split("T")[0];
    const user = memoryStore.getUser(userId);
    const summary = await cseProvider.getMarketSummary();
    const portfolioSummary = await tradingEngine.getPortfolioSummary(userId);
    const brutalReport = await brutalTruthEngine.generateReport(userId);

    // 1. Market Pulse
    const topGainer = summary.topGainers[0] || summary.quotes[0];
    const marketPulse: MarketPulseBrief = {
      date: today,
      aspiMove: `ASPI closed at ${summary.aspi.value.toLocaleString()} (${summary.aspi.change >= 0 ? "+" : ""}${summary.aspi.change.toFixed(2)} pts / ${summary.aspi.percentageChange >= 0 ? "+" : ""}${summary.aspi.percentageChange.toFixed(2)}%)`,
      breadthSummary: `Market breadth showed ${summary.advances} gainers vs ${summary.declines} decliners across ${summary.quotes.length} traded counters.`,
      turnoverSummary: `Total market turnover recorded LKR ${(summary.totalTurnover / 1_000_000).toFixed(1)} Million across ${summary.totalTrades.toLocaleString()} trades.`,
      topGainerNote: topGainer ? `Top mover: ${topGainer.symbol} gained ${topGainer.percentageChange >= 0 ? "+" : ""}${topGainer.percentageChange.toFixed(2)}% on LKR ${(topGainer.turnover / 1_000_000).toFixed(1)}M turnover.` : "Active trading across banking and manufacturing heavyweights.",
      keyAnnouncement: "John Keells Holdings (JKH) reported strong gaming and hospitality revenues at Cinnamon Life integrated resort.",
      macroTakeaway: "CBSL SDFR policy rate holds at 8.25% with 12M T-Bills at 9.85%, sustaining single-digit market P/E (9.4x) valuations.",
    };

    // 2. Today's Lesson (next uncompleted lesson on student's path)
    const progressList = memoryStore.getProgressByUserId(userId);
    const completedIds = new Set(progressList.filter((p) => p.completed).map((p) => p.lessonId));
    let nextLesson = ALL_LESSONS.find((l) => !completedIds.has(l.id) && l.level <= (user?.masteryLevel || 0) + 1);
    if (!nextLesson) nextLesson = ALL_LESSONS[0];

    // 3. Live Case of the Day
    const liveCase: LiveCaseExercise = {
      id: `case-${today}-comb`,
      symbol: "COMB.N0000",
      companyName: "Commercial Bank of Ceylon PLC",
      setupSummary: "Commercial Bank declared a LKR 4.50 interim cash dividend with the XD date falling next week. The stock is currently consolidating at 124.00 LKR.",
      catalystPrompt: "What typically happens to the share price of a high-yield CSE banking stock on the Ex-Dividend (XD) morning?",
      options: [
        {
          id: "opt-1",
          label: "Price opens roughly lower by the dividend amount (LKR 4.50) as cash leaves the company.",
          isCorrect: true,
          explanation: "Correct! On the XD date, buyers no longer receive the LKR 4.50 cash dividend, so market price mechanically adjusts downward by ~LKR 4.50 at open.",
        },
        {
          id: "opt-2",
          label: "Price surges 10% because the dividend is free extra money.",
          isCorrect: false,
          explanation: "Incorrect. Dividends are not free extra money; they represent capital distributed out of the company's balance sheet to existing shareholders.",
        },
        {
          id: "opt-3",
          label: "The stock gets halted from trading for 3 days.",
          isCorrect: false,
          explanation: "Incorrect. CSE does not halt trading on XD dates; trading proceeds normally with an adjusted reference price.",
        },
      ],
      actualOutcome: "On XD day, COMB adjusted from 124.00 LKR down to 119.50 LKR reference price, before institutional dip buyers bid it back up to 121.00 LKR.",
      keyTakeaway: "Never buy a stock on the day before XD purely for the dividend payout without factoring in the mechanical XD price adjustment and 1.12% round-trip transaction costs.",
    };

    // 4. Concept of the Day
    const conceptOfTheDay: ConceptOfTheDay = {
      title: "The XD (Ex-Dividend) Date",
      tag: "CSE Mechanics",
      summary: "The Ex-Dividend (XD) date is the cutoff date established by the Colombo Stock Exchange on which a stock starts trading without the value of the declared dividend.",
      cseExample: "If you purchase COMB voting shares before the XD date, you receive the LKR 4.50 cash dividend in your bank account on the payment date. If you buy on or after the XD date, the seller keeps the dividend.",
      glossaryTerm: "Ex-Dividend Date (XD)",
    };

    // 5. Review Round
    const reviewItems = [
      { lessonId: "lvl0-m1-inflation-benchmark", title: "12M T-Bill Benchmark Calculation", skill: "Financial Math" },
      { lessonId: "lvl2-m1-cse-fees-settlement", title: "CSE 1.12% Fee Breakdown & Break-Even", skill: "Fee Calculation" },
      { lessonId: "lvl3-m1-support-resistance", title: "Support & Demand Zone Identification", skill: "Price Action" },
    ];

    // 6. Mock Account Check-in
    const dailyPnLLKR = portfolioSummary.totalUnrealizedPnL;
    const dailyPnLPercent = portfolioSummary.totalReturnPercent;
    const observation = brutalReport.discipline.disciplineScore < 70
      ? "Warning: Your recent trade entries show missing stop-loss definitions. Protect your capital."
      : "Process is steady. Keep position sizes strictly within the 2% risk rule.";
    const action = "Review pending orders before market open at 09:30 SLST; check that all positions have valid stop-loss orders.";

    return {
      date: today,
      marketPulse,
      todayLesson: nextLesson,
      liveCase,
      conceptOfTheDay,
      reviewItems,
      accountCheckIn: {
        portfolioEquity: portfolioSummary.totalEquity,
        dailyPnLLKR,
        dailyPnLPercent,
        behaviorObservation: observation,
        actionForTomorrow: action,
      },
    };
  }
}

export const dailySessionEngine = DailySessionEngine.getInstance();
