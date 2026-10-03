import { NextResponse } from "next/server";
import { tradingEngine } from "@/lib/trading/engine";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await tradingEngine.placeOrder({
      userId: user.id,
      symbol: body.symbol,
      side: body.side,
      type: body.type,
      shares: parseInt(body.shares, 10),
      limitPrice: body.limitPrice ? parseFloat(body.limitPrice) : undefined,
      stopPrice: body.stopPrice ? parseFloat(body.stopPrice) : undefined,
      thesis: body.thesis || "Technical price action setup",
      entryReason: body.entryReason || "MOMENTUM",
      targetPrice: body.targetPrice ? parseFloat(body.targetPrice) : undefined,
      stopLossPrice: body.stopLossPrice ? parseFloat(body.stopLossPrice) : undefined,
      confidenceLevel: body.confidenceLevel || 3,
      devilsAdvocateAcknowledged: body.devilsAdvocateAcknowledged ?? true,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/trade/order error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
