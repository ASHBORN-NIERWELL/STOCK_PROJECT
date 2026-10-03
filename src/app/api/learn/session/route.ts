import { NextResponse } from "next/server";
import { dailySessionEngine } from "@/lib/learning/daily-session-generator";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "demo-user-1";

    const session = await dailySessionEngine.getTodaySession(userId);
    return NextResponse.json(session);
  } catch (err: any) {
    console.error("API /api/learn/session error:", err);
    return NextResponse.json({ error: "Failed to load daily session" }, { status: 500 });
  }
}
