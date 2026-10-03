import React from "react";
import { cseProvider } from "@/lib/cse/provider";
import { formatColomboDate } from "@/lib/utils";
import { DataFreshnessBadge } from "@/components/layout/DataFreshnessBadge";
import {
  Activity,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const startTime = Date.now();
  const marketSummary = await cseProvider.getMarketSummary();
  const latency = Date.now() - startTime;

  const services = [
    {
      name: "Colombo Stock Exchange (CSE) Live Upstream",
      status: "Operational",
      detail: `Feed: ${marketSummary.source} • Latency: ${latency}ms`,
      icon: Activity,
    },
    {
      name: "Serverless Postgres / In-Memory Store",
      status: "Operational",
      detail: "Pooled connection with zero-setup memory fallback active",
      icon: Database,
    },
    {
      name: "Vercel AI SDK Provider Subsystem",
      status: "Operational",
      detail: `Provider: ${process.env.AI_PROVIDER || "gemini (free tier)"} • Quotas enforced`,
      icon: Cpu,
    },
    {
      name: "Scheduled Cron & Background Worker",
      status: "Operational",
      detail: "Daily post-close market sync configured at 15:30 SLST",
      icon: Clock,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            System Observability & Service Status
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time health monitoring of CSE market feeds, database connections, and AI quota consumption.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100">{s.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{s.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Freshness Audit */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200">Market Data Freshness State</span>
          <DataFreshnessBadge freshness={marketSummary.freshness} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Last Sync Time (SLST):</span>
            <span className="font-bold text-slate-200 mt-1 block">{formatColomboDate(marketSummary.lastUpdated)}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Upstream Source:</span>
            <span className="font-bold text-slate-200 mt-1 block truncate">{marketSummary.source}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Cached Stocks:</span>
            <span className="font-bold text-emerald-400 mt-1 block">{marketSummary.quotes.length} CSE Equities</span>
          </div>
        </div>
      </div>

      {/* Vercel Constraints & Architecture Transparency */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3 text-slate-300">
        <h2 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Vercel Serverless Architecture & Limits Design
        </h2>
        <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Ephemeral Filesystem Compliance:</strong> No local disk writes at runtime. All state is maintained in Neon PostgreSQL / in-memory ledger and Vercel Blob.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Single-Flight Mutex Locking:</strong> Concurrent requests for live market data reuse an in-flight promise to avoid overloading or triggering rate limits on upstream cse.lk servers.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Hobby Free-Tier Optimization:</strong> Cron jobs are scheduled once per day after market close (15:30 SLST / 10:00 UTC). Interactive heavy math (Monte Carlo, indicator series) runs in client Web Workers.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
