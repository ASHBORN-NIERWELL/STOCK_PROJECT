"use client";

import React, { useState } from "react";
import { calculateCSEFees, calculateBreakEven } from "@/lib/cse/fee-calculator";
import { formatLKR, formatPercentage } from "@/lib/utils";
import { Calculator, CheckCircle, AlertCircle, Percent, ArrowRight } from "lucide-react";
import { evaluateActivitySubmission, ScoringResult } from "@/lib/learning/scoring";

interface FeeSimulatorLabProps {
  initialConfig: Record<string, any>;
  scoringKey: string;
  solutionCriteria: Record<string, any>;
  onScoreUpdated?: (result: ScoringResult) => void;
}

export const FeeSimulatorLab: React.FC<FeeSimulatorLabProps> = ({
  initialConfig,
  scoringKey,
  solutionCriteria,
  onScoreUpdated,
}) => {
  const [stockPrice, setStockPrice] = useState<number>(initialConfig.stockPrice || 116.0);
  const [shares, setShares] = useState<number>(initialConfig.shares || 2000);
  const [targetSellPrice, setTargetSellPrice] = useState<number>(123.65);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const tradeValue = stockPrice * shares;
  const buyFees = calculateCSEFees(tradeValue, "BUY");
  const breakEven = calculateBreakEven(stockPrice, shares);

  const sellTradeValue = targetSellPrice * shares;
  const sellFees = calculateCSEFees(sellTradeValue, "SELL");
  const netProceeds = sellTradeValue - sellFees.totalFees;
  const totalOutlay = tradeValue + buyFees.totalFees;
  const estimatedNetProfit = netProceeds - totalOutlay;

  const handleSubmit = () => {
    const res = evaluateActivitySubmission(
      scoringKey,
      { sellPrice: targetSellPrice },
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
            <Calculator className="w-4 h-4 text-emerald-400" />
            Interactive CSE 1.12% Fee & Break-Even Simulator
          </h3>
          <p className="text-slate-400 mt-0.5">
            Test how single-leg fees (Brokerage 0.64%, SEC 0.072%, CSE 0.084%, CDS 0.024%, STL 0.30%) dictate your break-even exit price.
          </p>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Purchase Price (LKR):</label>
          <input
            type="number"
            step="0.5"
            value={stockPrice}
            onChange={(e) => setStockPrice(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Number of Shares:</label>
          <input
            type="number"
            step="100"
            value={shares}
            onChange={(e) => setShares(parseInt(e.target.value, 10) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 font-medium">Your Target Sell Price (LKR):</label>
          <input
            type="number"
            step="0.1"
            value={targetSellPrice}
            onChange={(e) => setTargetSellPrice(parseFloat(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Fee Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Buy Leg */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-slate-300">1. Buy Leg Costs</span>
          <div className="flex justify-between text-slate-400">
            <span>Gross Investment:</span>
            <span className="font-mono text-slate-200">{formatLKR(tradeValue)}</span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>Buy Fees (1.12%):</span>
            <span className="font-mono">+{formatLKR(buyFees.totalFees)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-slate-100">
            <span>Total Cash Outlay:</span>
            <span className="font-mono text-emerald-400">{formatLKR(totalOutlay)}</span>
          </div>
        </div>

        {/* Break-Even Target */}
        <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/30 flex flex-col gap-2">
          <span className="font-bold text-amber-300">2. Break-Even Target</span>
          <div className="flex justify-between text-slate-400">
            <span>Required Sell Price:</span>
            <span className="font-mono text-amber-300 font-bold">{breakEven.breakEvenSellPrice.toFixed(2)} LKR</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Minimum Gain Needed:</span>
            <span className="font-mono text-amber-300">+{breakEven.requiredPriceIncreasePercent.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-400">
            <span>Total Friction Drag:</span>
            <span className="font-mono text-rose-400">{formatLKR(buyFees.totalFees * 2)}</span>
          </div>
        </div>

        {/* Estimated Outcome */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-slate-300">3. Estimated Outcome</span>
          <div className="flex justify-between text-slate-400">
            <span>Gross Sale Proceeds:</span>
            <span className="font-mono text-slate-200">{formatLKR(sellTradeValue)}</span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>Sell Fees (1.12%):</span>
            <span className="font-mono">-{formatLKR(sellFees.totalFees)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-800 pt-1">
            <span>Net Profit / Loss:</span>
            <span className={`font-mono ${estimatedNetProfit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}`}>
              {formatLKR(estimatedNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Task Submission */}
      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
        <span className="text-slate-400">
          Target: Find the sell price for at least <strong>LKR 10,000 net profit</strong> after fees.
        </span>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
        >
          Verify Target
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
              {result.passed ? "Calculation Verified! (+25 Fee Mastery)" : "Calculation Needs Review"}
            </span>
            <span className="font-mono">{result.score}/100</span>
          </div>
          <p>{result.feedback}</p>
        </div>
      )}
    </div>
  );
};
