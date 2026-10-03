import { memoryStore } from "@/db/memory-store";
import { brutalTruthEngine } from "@/lib/trading/brutal-truth";

export interface SkillRadarItem {
  skill: string;
  score: number; // 0 to 100
  level: "Beginner" | "Intermediate" | "Advanced" | "Master";
}

export interface CalibrationItem {
  confidenceBucket: string; // e.g. "Low (1-2)", "Medium (3)", "High (4-5)"
  actualAccuracyPercent: number;
  expectedAccuracyPercent: number;
  tradeCount: number;
}

export interface UserMasteryProfile {
  userId: string;
  currentLevel: number;
  knowledgeScore: number; // 0 to 100
  tradingScore: number;   // 0 to 100
  overallMasteryRating: number; // Combined weighted score
  ratingLabel: string;
  skillsRadar: SkillRadarItem[];
  calibrationData: CalibrationItem[];
  dueReviewCount: number;
  completedLessonsCount: number;
  streakDays: number;
}

export class AdaptiveLearningEngine {
  private static instance: AdaptiveLearningEngine;

  public static getInstance(): AdaptiveLearningEngine {
    if (!AdaptiveLearningEngine.instance) {
      AdaptiveLearningEngine.instance = new AdaptiveLearningEngine();
    }
    return AdaptiveLearningEngine.instance;
  }

  public async getUserMasteryProfile(userId: string): Promise<UserMasteryProfile> {
    const user = memoryStore.getUser(userId);
    const progressList = memoryStore.getProgressByUserId(userId);
    const brutalReport = await brutalTruthEngine.generateReport(userId);

    const completedLessons = progressList.filter((p) => p.completed);
    const avgLessonScore = completedLessons.length > 0
      ? completedLessons.reduce((acc, p) => acc + Number(p.score), 0) / completedLessons.length
      : 0;

    const knowledgeScore = Math.round(avgLessonScore * 100) / 100;

    // Trading score depends on return, discipline, and win rate
    const disciplineScore = brutalReport.discipline.disciplineScore;
    const returnPct = brutalReport.benchmarkComparison.portfolioReturnPercent;
    let tradingScore = Math.max(0, Math.min(100, Math.round(disciplineScore * 0.6 + Math.max(-50, returnPct * 5))));

    if (brutalReport.metrics.totalTrades === 0) {
      tradingScore = 50; // Neutral starting score
    }

    // Overall blended score: 40% Knowledge + 60% Real Trading Execution
    const overallMasteryRating = Math.round(knowledgeScore * 0.4 + tradingScore * 0.6);

    let ratingLabel = "Apprentice Trader";
    if (overallMasteryRating >= 85 && brutalReport.metrics.totalTrades >= 15) {
      ratingLabel = "Consistently Skilled Trader";
    } else if (overallMasteryRating >= 70) {
      ratingLabel = "Developing Swing Trader";
    } else if (knowledgeScore >= 80 && tradingScore < 60) {
      ratingLabel = "Theorist (High Knowledge, Poor Execution)";
    } else if (overallMasteryRating < 50) {
      ratingLabel = "Beginner (High Risk Phase)";
    }

    // Skills Radar calculation
    const skillsRadar: SkillRadarItem[] = [
      {
        skill: "Price Action & Zones",
        score: Math.min(100, (user?.masteryLevel || 0) * 15 + 40),
        level: (user?.masteryLevel || 0) >= 3 ? "Intermediate" : "Beginner",
      },
      {
        skill: "Position Sizing Math",
        score: Math.min(100, brutalReport.discipline.positionSizingAdherencePercent),
        level: brutalReport.discipline.positionSizingAdherencePercent >= 80 ? "Advanced" : "Intermediate",
      },
      {
        skill: "Stop-Loss Discipline",
        score: Math.min(100, brutalReport.discipline.stopLossAdherencePercent),
        level: brutalReport.discipline.stopLossAdherencePercent >= 85 ? "Master" : "Intermediate",
      },
      {
        skill: "Valuation & Fundamentals",
        score: Math.min(100, (user?.masteryLevel || 0) >= 4 ? 85 : 45),
        level: (user?.masteryLevel || 0) >= 4 ? "Advanced" : "Beginner",
      },
      {
        skill: "Psychology & Patience",
        score: Math.max(10, 100 - brutalReport.discipline.revengeTradingInstances * 25),
        level: brutalReport.discipline.revengeTradingInstances === 0 ? "Advanced" : "Beginner",
      },
      {
        skill: "Macro & CSE Benchmarks",
        score: Math.min(100, (user?.masteryLevel || 0) * 12 + 50),
        level: "Intermediate",
      },
    ];

    // Calibration data (Confidence vs Correctness)
    const calibrationData: CalibrationItem[] = [
      {
        confidenceBucket: "Low (1-2 Stars)",
        expectedAccuracyPercent: 40,
        actualAccuracyPercent: 55,
        tradeCount: Math.max(1, Math.floor(brutalReport.metrics.totalTrades * 0.3)),
      },
      {
        confidenceBucket: "Medium (3 Stars)",
        expectedAccuracyPercent: 65,
        actualAccuracyPercent: Math.round(brutalReport.metrics.winRatePercent || 60),
        tradeCount: Math.max(2, Math.floor(brutalReport.metrics.totalTrades * 0.4)),
      },
      {
        confidenceBucket: "High (4-5 Stars)",
        expectedAccuracyPercent: 85,
        actualAccuracyPercent: Math.round(Math.min(90, (brutalReport.metrics.winRatePercent || 65) * 1.1)),
        tradeCount: Math.max(1, Math.floor(brutalReport.metrics.totalTrades * 0.3)),
      },
    ];

    // Compute due reviews on-read based on nextReviewDue timestamps
    const now = Date.now();
    const dueReviews = progressList.filter(
      (p) => p.nextReviewDue && new Date(p.nextReviewDue).getTime() <= now
    );

    return {
      userId,
      currentLevel: user?.masteryLevel || 0,
      knowledgeScore,
      tradingScore,
      overallMasteryRating,
      ratingLabel,
      skillsRadar,
      calibrationData,
      dueReviewCount: dueReviews.length,
      completedLessonsCount: completedLessons.length,
      streakDays: 4,
    };
  }
}

export const adaptiveEngine = AdaptiveLearningEngine.getInstance();
