import { NextResponse } from "next/server";
import { cseProvider } from "@/lib/cse/provider";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // Force refresh market data from CSE
    const summary = await cseProvider.getMarketSummary(true);

    return NextResponse.json({
      success: true,
      job: "refresh-market",
      timestamp: new Date().toISOString(),
      aspi: summary.aspi.value,
      totalStocks: summary.quotes.length,
      freshness: summary.freshness,
    });
  } catch (err: any) {
    console.error("Job refresh-market error:", err);
    return NextResponse.json({ error: "Job execution failed" }, { status: 500 });
  }
}
