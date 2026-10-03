import { NextResponse } from "next/server";
import { cseProvider } from "@/lib/cse/provider";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") as any) || "6M";

    const [quote, history, announcements] = await Promise.all([
      cseProvider.getStockQuote(symbol),
      cseProvider.getStockHistory(symbol, timeframe),
      cseProvider.getAnnouncements(symbol),
    ]);

    if (!quote) {
      return NextResponse.json({ error: "Stock symbol not found" }, { status: 404 });
    }

    return NextResponse.json({
      quote,
      history,
      announcements,
    });
  } catch (err: any) {
    console.error("API quote error:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
