import React from "react";
import Link from "next/link";
import { cseProvider } from "@/lib/cse/provider";
import { dailySessionEngine } from "@/lib/learning/daily-session-generator";
import { brutalTruthEngine } from "@/lib/trading/brutal-truth";
import { getCurrentUser } from "@/lib/auth/session";
import { formatLKR, formatPercentage, formatVolume } from "@/lib/utils";
import { DataFreshnessBadge } from "@/components/layout/DataFreshnessBadge";
import {
  TrendingUp,
  BookOpen,
  LineChart,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";

  const [marketSummary, todaySession, brutalReport] = await Promise.all([
    cseProvider.getMarketSummary(),
    dailySessionEngine.getTodaySession(userId),
    brutalTruthEngine.generateReport(userId),
  ]);

  const aspi = marketSummary.aspi;
  const isAspiUp = aspi.change >= 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Truth Line Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                The Unvarnished Truth
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-slate-400">Status: {brutalReport.verdictTitle}</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 font-medium leading-relaxed">
              {brutalReport.benchmarkComparison.verdict}
            </p>
          </div>
        </div>
        <Link
          href="/report"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>View Audit</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* 2. Live Market Snapshot Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* ASPI Index */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>ASPI Index</span>
            <DataFreshnessBadge freshness={marketSummary.freshness} />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-slate-100">
              {aspi.value.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-xs font-mono font-semibold mt-0.5 ${isAspiUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isAspiUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isAspiUp ? "+" : ""}{aspi.change.toFixed(2)} ({formatPercentage(aspi.percentageChange)})</span>
            </div>
          </div>
        </div>

        {/* Market Turnover */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Market Turnover</span>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-slate-100">
              LKR {(marketSummary.totalTurnover / 1_000_000).toFixed(1)}M
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {marketSummary.totalTrades.toLocaleString()} trades today
            </span>
          </div>
        </div>

        {/* Market Breadth */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Market Breadth</span>
          <div className="mt-2 flex items-center gap-3 font-mono text-xs">
            <span className="text-emerald-400 font-bold">{marketSummary.advances} Adv</span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 font-bold">{marketSummary.declines} Dec</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(marketSummary.advances / Math.max(1, marketSummary.advances + marketSummary.declines)) * 100}%` }}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(marketSummary.declines / Math.max(1, marketSummary.advances + marketSummary.declines)) * 100}%` }}
            />
          </div>
        </div>

        {/* Benchmark Hurdle */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">12M T-Bill Benchmark</span>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-amber-400">9.85%</div>
            <span className="text-[11px] text-slate-400">CBSL Sovereign Risk-Free Rate</span>
          </div>
        </div>
      </div>

      {/* 3. Today's Session Container */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Today&apos;s Guided Session</h2>
              <p className="text-xs text-slate-400">Your personalized 15-minute daily progression loop</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Date: {todaySession.date}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Column: Lesson + Live Case */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Step 1: Market Pulse */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  1. Market Pulse Brief (3 Min)
                </span>
                <span className="text-[11px] text-slate-400">Derived from live CSE cache</span>
              </div>
              <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>📊 <strong>Index Movement:</strong> {todaySession.marketPulse.aspiMove}</p>
                <p>📈 <strong>Top Activity:</strong> {todaySession.marketPulse.topGainerNote}</p>
                <p>📢 <strong>Key Announcement:</strong> {todaySession.marketPulse.keyAnnouncement}</p>
                <p className="text-amber-300/90 font-medium">💡 <strong>Macro Context:</strong> {todaySession.marketPulse.macroTakeaway}</p>
              </div>
            </div>

            {/* Step 2: Today's Lesson */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950/20 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  2. Today&apos;s Interactive Lab (10 Min)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                  Level {todaySession.todayLesson.level}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-100">{todaySession.todayLesson.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {todaySession.todayLesson.summary}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{todaySession.todayLesson.estimatedMinutes} mins hands-on
                  </span>
                  <Link
                    href={`/learn/${todaySession.todayLesson.id}`}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Launch Lab</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 3: Live Case of the Day */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  3. Live Case of the Day: {todaySession.liveCase.companyName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{todaySession.liveCase.symbol}</span>
              </div>
              <div className="mt-3 text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">{todaySession.liveCase.setupSummary}</p>
                <p className="font-semibold text-slate-100 pt-1">{todaySession.liveCase.catalystPrompt}</p>
                <div className="flex flex-col gap-2 pt-2">
                  {todaySession.liveCase.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="font-bold text-slate-500 mt-0.5">•</span>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Concept + Spaced Reviews + Check-in */}
          <div className="flex flex-col gap-4">
            {/* Step 4: Concept of the Day */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  4. Concept of the Day
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {todaySession.conceptOfTheDay.tag}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-slate-100">{todaySession.conceptOfTheDay.title}</h4>
                <p className="leading-relaxed text-slate-400">{todaySession.conceptOfTheDay.summary}</p>
                <div className="p-2.5 rounded bg-purple-950/30 border border-purple-900/50 text-purple-200 text-[11px] leading-relaxed">
                  <strong>CSE Example:</strong> {todaySession.conceptOfTheDay.cseExample}
                </div>
              </div>
            </div>

            {/* Step 5: Spaced Review Round */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  5. Spaced Repetition Checks
                </span>
                <span className="text-[11px] text-slate-400">3 Due</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {todaySession.reviewItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/learn/${item.lessonId}`}
                    className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.skill}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Step 6: Mock Account Check-in */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                  6. Account Check-in
                </span>
                <Link href="/trade" className="text-[11px] text-emerald-400 hover:underline">
                  Terminal
                </Link>
              </div>
              <div className="mt-3 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">Total Virtual Equity:</span>
                  <span className="font-bold text-slate-100">{formatLKR(todaySession.accountCheckIn.portfolioEquity)}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                  <span className="text-amber-400 font-bold block mb-0.5">Behavior Observation:</span>
                  {todaySession.accountCheckIn.behaviorObservation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
