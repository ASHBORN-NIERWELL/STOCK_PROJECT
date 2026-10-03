import { NextResponse } from "next/server";
import { memoryStore } from "@/db/memory-store";
import { cseProvider } from "@/lib/cse/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let cseStatus = "healthy";
  let dbStatus = "healthy";

  try {
    const summary = await cseProvider.getMarketSummary();
    if (!summary) cseStatus = "degraded";
  } catch (e) {
    cseStatus = "offline";
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    responseTimeMs,
    services: {
      cseFeed: cseStatus,
      database: dbStatus,
      aiQuota: "operational",
    },
    version: "1.0.0",
  });
}
