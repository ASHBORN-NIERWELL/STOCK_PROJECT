"use client";

import React, { useState } from "react";
import { BrutalTruthReport } from "@/lib/trading/brutal-truth";
import { formatLKR, formatPercentage } from "@/lib/utils";
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Award,
  DollarSign,
  Scale,
  Zap,
  Target,
  FileCheck,
  CheckCircle,
} from "lucide-react";

interface BrutalReportClientProps {
  report: BrutalTruthReport;
  userName: string;
}

export const BrutalReportClient: React.FC<BrutalReportClientProps> = ({
  report,
  userName,
}) => {
  const [tone, setTone] = useState<"brutal" | "gentle">("brutal");

  const benchmark = report.benchmarkComparison;
  const metrics = report.metrics;
  const discipline = report.discipline;

  const isAlphaPositive = benchmark.alphaVsAspi >= 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              The Brutal Truth Report
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Grade: {report.performanceGrade}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditing {userName}&apos;s mock trading ledger against CSE benchmarks, fees, and discipline rules.
          </p>
        </div>

        {/* Tone Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Coach Tone:</span>
          <button
            onClick={() => setTone("brutal")}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              tone === "brutal" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Brutal Truth
          </button>
          <button
            onClick={() => setTone("gentle")}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              tone === "gentle" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Firm & Gentle
          </button>
        </div>
      </div>

      {/* 1. The Coach Verdict Box */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 rounded-xl border border-rose-500/40 text-xs leading-relaxed flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Performance Verdict: {report.verdictTitle}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{report.generatedAt.split("T")[0]}</span>
        </div>
        <p className="text-sm font-medium text-slate-200 leading-relaxed">
          {tone === "brutal" ? report.brutalVerdict : report.gentleVerdict}
        </p>
      </div>

      {/* 2. Benchmark Comparison Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          Benchmark Comparison: Did You Beat Doing Nothing?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Your Return */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Your Net Portfolio Return:</span>
            <div className={`text-xl font-bold font-mono mt-1 ${benchmark.portfolioReturnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatPercentage(benchmark.portfolioReturnPercent)}
            </div>
            <span className="text-[10px] text-slate-500">After all CSE fees & levies</span>
          </div>

          {/* ASPI Index */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">CSE ASPI Index Return:</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">
              +{benchmark.aspiReturnPercent.toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-500">Broad market buy-and-hold</span>
          </div>

          {/* 12M T-Bill Benchmark */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-amber-500/30">
            <span className="text-slate-400 font-medium">12M CBSL T-Bill Yield:</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              +{benchmark.tBillRiskFreeReturnPercent.toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-500">Guaranteed sovereign risk-free</span>
          </div>

          {/* Net Alpha */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Net Alpha Generated:</span>
            <div className={`text-xl font-bold font-mono mt-1 ${isAlphaPositive ? "text-emerald-400" : "text-rose-400"}`}>
              {benchmark.alphaVsAspi >= 0 ? "+" : ""}{benchmark.alphaVsAspi.toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-500">vs ASPI benchmark</span>
          </div>
        </div>
      </div>

      {/* 3. Cost Drag and Statistical Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metrics */}
        <div className="lg:col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-4 text-xs">
          <span className="font-bold text-slate-200">Statistical Performance Audit</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Win Rate:</span>
              <span className="text-sm font-bold text-slate-100">{metrics.winRatePercent}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {metrics.winningTrades}W / {metrics.losingTrades}L
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Profit Factor:</span>
              <span className={`text-sm font-bold ${metrics.profitFactor >= 1.5 ? "text-emerald-400" : "text-amber-400"}`}>
                {metrics.profitFactor.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Wins / Losses</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Expectancy / Trade:</span>
              <span className={`text-sm font-bold ${metrics.expectancyLKR >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatLKR(metrics.expectancyLKR)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Math edge</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Average Win:</span>
              <span className="text-sm font-bold text-emerald-400">{formatLKR(metrics.averageWinLKR)}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Average Loss:</span>
              <span className="text-sm font-bold text-rose-400">{formatLKR(metrics.averageLossLKR)}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Max Drawdown:</span>
              <span className="text-sm font-bold text-rose-400">{metrics.maxDrawdownPercent.toFixed(2)}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{formatLKR(metrics.maxDrawdownLKR)}</span>
            </div>
          </div>

          {report.sampleSizeWarning && (
            <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{report.sampleSizeWarning}</span>
            </div>
          )}
        </div>

        {/* Discipline & Fee Drag */}
        <div className="flex flex-col gap-4">
          {/* Discipline Score */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Discipline Score</span>
              <span className={`text-base font-bold font-mono ${discipline.disciplineScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                {discipline.disciplineScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${discipline.disciplineScore >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${discipline.disciplineScore}%` }}
              />
            </div>
            <div className="space-y-1.5 text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Stop-Loss Adherence:</span>
                <span className="font-mono text-slate-200">{discipline.stopLossAdherencePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Position Sizing Compliance:</span>
                <span className="font-mono text-slate-200">{discipline.positionSizingAdherencePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Revenge Trades:</span>
                <span className="font-mono text-rose-400 font-bold">{discipline.revengeTradingInstances}</span>
              </div>
            </div>
          </div>

          {/* Fee Friction Drag */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
            <span className="font-bold text-slate-200">CSE Friction Drag</span>
            <div className="text-xl font-bold font-mono text-rose-400">
              {formatLKR(report.metrics.totalFeesPaidLKR)}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Paid to brokers, SEC cess, and Share Transaction Levy. Lower your trade frequency to reduce friction.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Top 3 Costliest Mistakes & Concrete Fixes */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" />
          Top Costliest Mistakes & Actionable Fixes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {report.topMistakesWithFixes.map((m, idx) => (
            <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-200">{m.mistake}</span>
                  <span className="font-mono text-rose-400 font-bold">-{formatLKR(m.costLKR)}</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                  <strong>Concrete Fix:</strong> {m.concreteFix}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                Rule violation tracked in immutable ledger audit
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
