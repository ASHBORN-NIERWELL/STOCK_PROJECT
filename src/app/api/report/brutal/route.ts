import { NextResponse } from "next/server";
import { brutalTruthEngine } from "@/lib/trading/brutal-truth";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "demo-user-1";

    const report = await brutalTruthEngine.generateReport(userId);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error("API /api/report/brutal error:", err);
    return NextResponse.json({ error: "Failed to generate brutal report" }, { status: 500 });
  }
}
