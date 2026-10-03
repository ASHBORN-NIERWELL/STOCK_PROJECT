import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { tradingEngine } from "@/lib/trading/engine";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";
  const portfolio = await tradingEngine.getPortfolioSummary(userId);

  return (
    <SettingsClient
      user={{
        name: user?.name || "Kasun Perera",
        email: user?.email || "trader@csemastery.lk",
        masteryLevel: user?.masteryLevel || 0,
        goal: user?.goal || "active_swing",
      }}
      portfolio={portfolio}
    />
  );
}
