import React from "react";
import { cseProvider } from "@/lib/cse/provider";
import { StockScreenerClient } from "./StockScreenerClient";

export const dynamic = "force-dynamic";

export default async function ScreenerPage() {
  const marketSummary = await cseProvider.getMarketSummary();

  return <StockScreenerClient quotes={marketSummary.quotes} />;
}
