import { NextResponse } from "next/server";
import { tradingEngine } from "@/lib/trading/engine";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = tradingEngine.resetAccount(user.id);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("API /api/trade/reset error:", err);
    return NextResponse.json({ error: "Failed to reset portfolio" }, { status: 500 });
  }
}
