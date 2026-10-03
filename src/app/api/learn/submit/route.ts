import { NextResponse } from "next/server";
import { evaluateActivitySubmission } from "@/lib/learning/scoring";
import { getCurrentUser } from "@/lib/auth/session";
import { memoryStore, UserProgressEntity } from "@/db/memory-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "demo-user-1";

    const body = await request.json();
    const { lessonId, scoringKey, userAnswer, solutionCriteria, confidenceRating } = body;

    // Deterministically evaluate score on server
    const result = evaluateActivitySubmission(scoringKey, userAnswer, solutionCriteria || {});

    // Update user progress in DB / memory store
    const existing = memoryStore.getProgress(userId, lessonId);
    const progress: UserProgressEntity = {
      id: `prog-${userId}-${lessonId}`,
      userId,
      lessonId,
      completed: result.passed || (existing ? existing.completed : false),
      score: result.score,
      attempts: (existing?.attempts || 0) + 1,
      confidenceRating: confidenceRating || 3,
      skillsMastery: result.skillsDelta,
      submittedAnswers: userAnswer,
      feedback: result.feedback,
      lastAttemptAt: new Date().toISOString(),
      nextReviewDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      reviewIntervalDays: 2,
    };
    memoryStore.upsertProgress(progress);

    // If passed and user mastery level is equal to this lesson level, check for level up
    if (result.passed && user) {
      // Calculate total passed lessons
      const allProg = memoryStore.getProgressByUserId(userId);
      const passedCount = allProg.filter((p) => p.completed).length;
      if (passedCount >= (user.masteryLevel + 1) * 2) {
        user.masteryLevel = Math.min(10, user.masteryLevel + 1);
        memoryStore.upsertUser(user);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      userMasteryLevel: user?.masteryLevel || 0,
    });
  } catch (err: any) {
    console.error("API /api/learn/submit error:", err);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
