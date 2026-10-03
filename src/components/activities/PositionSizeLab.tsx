"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { formatLKR } from "@/lib/utils";
import { evaluateActivitySubmission, ScoringResult } from "@/lib/learning/scoring";

interface PositionSizeLabProps {
  initialConfig: Record<string, any>;
  scoringKey: string;
  solutionCriteria: Record<string, any>;
  onScoreUpdated?: (result: ScoringResult) => void;
}

export const PositionSizeLab: React.FC<PositionSizeLabProps> = ({
  initialConfig,
  scoringKey,
  solutionCriteria,
  onScoreUpdated,
}) => {
  const [accountEquity, setAccountEquity] = useState<number>(initialConfig.accountEquity || 1000000);
  const [riskPercent, setRiskPercent] = useState<number>(initialConfig.riskPercent || 1.5);
  const [stockPrice, setStockPrice] = useState<number>(initialConfig.stockPrice || 94.80);
  const [stopLossPrice, setStopLossPrice] = useState<number>(initialConfig.stopPrice || 89.80);
  const [userSubmittedShares, setUserSubmittedShares] = useState<number>(3000);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const riskBudgetLKR = accountEquity * (riskPercent / 100);
  const riskPerShare = Math.max(0.1, stockPrice - stopLossPrice);
  const calculatedShares = Math.floor(riskBudgetLKR / riskPerShare);
  const totalPositionCost = calculatedShares * stockPrice;
  const portfolioAllocationPct = Math.round((totalPositionCost / accountEquity) * 10000) / 100;

  const handleSubmit = () => {
    const res = evaluateActivitySubmission(
      scoringKey,
      { shares: userSubmittedShares },
      solutionCriteria
    );
    setResult(res);
    onScoreUpdated?.(res);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Position Sizing Math & Risk Budgeting Lab
          </h3>
          <p className="text-slate-400 mt-0.5">
            Never risk more than 1%-2% of your total account on any single trade setup.
          </p>
        </div>
      </div>

      {/* Sliders & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Account Equity (LKR):</label>
          <input
            type="number"
            value={accountEquity}
            onChange={(e) => setAccountEquity(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Risk Budget % (Max 2%):</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-emerald-400 font-bold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Stock Entry Price (LKR):</label>
          <input
            type="number"
            step="0.1"
            value={stockPrice}
            onChange={(e) => setStockPrice(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Stop-Loss Price (LKR):</label>
          <input
            type="number"
            step="0.1"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-rose-400 font-bold"
          />
        </div>
      </div>

      {/* Calculated Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-400">Total Risk Budget:</span>
          <div className="font-mono font-bold text-amber-400 text-sm mt-1">{formatLKR(riskBudgetLKR)}</div>
          <span className="text-[10px] text-slate-500">Max loss if stop is hit</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-400">Risk Per Share:</span>
          <div className="font-mono font-bold text-rose-400 text-sm mt-1">{riskPerShare.toFixed(2)} LKR</div>
          <span className="text-[10px] text-slate-500">Entry - Stop Loss</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-400">Optimal Share Count:</span>
          <div className="font-mono font-bold text-emerald-400 text-sm mt-1">{calculatedShares.toLocaleString()} shares</div>
          <span className="text-[10px] text-slate-500">Risk Budget / Risk per share</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-400">Account Allocation:</span>
          <div className="font-mono font-bold text-slate-200 text-sm mt-1">{portfolioAllocationPct}%</div>
          <span className="text-[10px] text-slate-500">{formatLKR(totalPositionCost)} outlay</span>
        </div>
      </div>

      {/* Task input */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Enter your computed share size:</span>
          <input
            type="number"
            value={userSubmittedShares}
            onChange={(e) => setUserSubmittedShares(parseInt(e.target.value, 10) || 0)}
            className="w-32 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 font-mono text-emerald-400 font-bold"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
        >
          Verify Sizing
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`p-3.5 rounded-lg border flex flex-col gap-1.5 ${
            result.passed ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100" : "bg-amber-950/40 border-amber-500/40 text-amber-100"
          }`}
        >
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-1.5">
              {result.passed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              {result.passed ? "Sizing Verified! (+25 Risk Mastery)" : "Sizing Review Required"}
            </span>
            <span className="font-mono">{result.score}/100</span>
          </div>
          <p>{result.feedback}</p>
        </div>
      )}
    </div>
  );
};
