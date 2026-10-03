import { NextResponse } from "next/server";
import { aiClient } from "@/lib/ai/client";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "demo-user-1";

    const body = await request.json();
    const { query, currentPage, symbol } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const response = await aiClient.getTutorResponse(
      userId,
      query,
      {
        currentPage,
        symbol,
        masteryLevel: user?.masteryLevel || 0,
      }
    );

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error("API /api/ai/tutor error:", err);
    return NextResponse.json({ error: "Failed to generate AI tutor response" }, { status: 500 });
  }
}
