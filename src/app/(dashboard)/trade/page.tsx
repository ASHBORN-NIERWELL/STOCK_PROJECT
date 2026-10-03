import React from "react";
import { cseProvider } from "@/lib/cse/provider";
import { tradingEngine } from "@/lib/trading/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { MockTerminalClient } from "./MockTerminalClient";

export const dynamic = "force-dynamic";

export default async function TradeTerminalPage({
  searchParams,
}: {
  searchParams: { symbol?: string };
}) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";

  const [marketSummary, portfolioSummary] = await Promise.all([
    cseProvider.getMarketSummary(),
    tradingEngine.getPortfolioSummary(userId),
  ]);

  const defaultSymbol = searchParams.symbol || "JKH.N0000";

  return (
    <MockTerminalClient
      quotes={marketSummary.quotes}
      portfolio={portfolioSummary}
      defaultSymbol={defaultSymbol}
      userId={userId}
      userMasteryLevel={user?.masteryLevel || 0}
    />
  );
}
