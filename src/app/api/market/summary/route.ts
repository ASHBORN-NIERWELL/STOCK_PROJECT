import { NextResponse } from "next/server";
import { cseProvider } from "@/lib/cse/provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const data = await cseProvider.getMarketSummary(refresh);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err: any) {
    console.error("API /api/market/summary error:", err);
    return NextResponse.json({ error: "Failed to fetch market summary" }, { status: 500 });
  }
}
