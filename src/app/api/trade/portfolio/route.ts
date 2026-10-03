import { NextResponse } from "next/server";
import { tradingEngine } from "@/lib/trading/engine";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await tradingEngine.getPortfolioSummary(user.id);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("API /api/trade/portfolio error:", err);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
