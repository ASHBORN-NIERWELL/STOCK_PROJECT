import { NextResponse } from "next/server";
import { dailySessionEngine } from "@/lib/learning/daily-session-generator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // Generate daily shared content
    const session = await dailySessionEngine.getTodaySession("demo-user-1");

    return NextResponse.json({
      success: true,
      job: "daily-learning",
      date: session.date,
      marketPulseGenerated: Boolean(session.marketPulse),
      liveCase: session.liveCase.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Job daily-learning error:", err);
    return NextResponse.json({ error: "Daily learning job failed" }, { status: 500 });
  }
}
