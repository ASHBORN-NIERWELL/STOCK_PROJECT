import React from "react";
import { brutalTruthEngine } from "@/lib/trading/brutal-truth";
import { getCurrentUser } from "@/lib/auth/session";
import { BrutalReportClient } from "./BrutalReportClient";

export const dynamic = "force-dynamic";

export default async function BrutalReportPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";

  const report = await brutalTruthEngine.generateReport(userId);

  return <BrutalReportClient report={report} userName={user?.name || "Student Trader"} />;
}
