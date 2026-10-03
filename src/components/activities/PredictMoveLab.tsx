"use client";

import React, { useState } from "react";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { OHLCVBar } from "@/db/seed-data";
import { Eye, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { evaluateActivitySubmission, ScoringResult } from "@/lib/learning/scoring";

interface PredictMoveLabProps {
  fullData: OHLCVBar[];
  cutoffIndex: number;
  symbol: string;
  scoringKey: string;
  solutionCriteria: Record<string, any>;
  onScoreUpdated?: (result: ScoringResult) => void;
}

export const PredictMoveLab: React.FC<PredictMoveLabProps> = ({
  fullData,
  cutoffIndex = 60,
  symbol,
  scoringKey,
  solutionCriteria,
  onScoreUpdated,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [direction, setDirection] = useState<"LONG" | "WAIT" | "SHORT">("LONG");
  const [targetPrice, setTargetPrice] = useState<number>(228.0);
  const [stopPrice, setStopPrice] = useState<number>(209.0);
  const [confidence, setConfidence] = useState<number>(4);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const visibleData = revealed ? fullData : fullData.slice(0, cutoffIndex);
  const currentCandle = visibleData[visibleData.length - 1];
  const currentPrice = currentCandle ? currentCandle.close : 215.0;

  const rewardDistance = Math.max(0, targetPrice - currentPrice);
  const riskDistance = Math.max(0.1, currentPrice - stopPrice);
  const riskRewardRatio = Math.round((rewardDistance / riskDistance) * 10) / 10;

  const handleReveal = () => {
    const res = evaluateActivitySubmission(
      scoringKey,
      {
        direction,
        riskRewardRatio,
        targetPrice,
        stopPrice,
        confidence,
      },
      solutionCriteria
    );
    setResult(res);
    setRevealed(true);
    onScoreUpdated?.(res);
  };

  const handleReset = () => {
    setRevealed(false);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            Predict-The-Next-Move: Blind Candle Replay
          </h3>
          <p className="text-xs text-slate-400">
            {revealed
              ? "Future price action revealed. Study how the setup unfolded."
              : "Chart is cut off at the decision point. Formulate your thesis and commit before revealing."}
          </p>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
          Cutoff Date: {fullData[cutoffIndex - 1]?.time || "2026-07-15"}
        </div>
      </div>

      {/* Chart */}
      <TradingViewChart
        data={visibleData}
        height={360}
        symbol={`${symbol} (${revealed ? "Revealed" : "Blind Cutoff"})`}
      />

      {/* Decision Commitment Form */}
      {!revealed ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          {/* Direction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-medium">Your Action:</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDirection("LONG")}
                className={`py-1.5 px-2 rounded font-bold flex items-center justify-center gap-1 transition-colors ${
                  direction === "LONG"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Long Buy</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection("WAIT")}
                className={`py-1.5 px-2 rounded font-bold flex items-center justify-center gap-1 transition-colors ${
                  direction === "WAIT"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <span>Wait / Cash</span>
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-medium">Target Price (LKR):</label>
            <input
              type="number"
              step="0.5"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Stop Loss Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-medium">Stop-Loss Price (LKR):</label>
            <input
              type="number"
              step="0.5"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Risk Reward & Commit Button */}
          <div className="flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Risk/Reward:</span>
              <span className={`font-mono font-bold ${riskRewardRatio >= 2.0 ? "text-emerald-400" : "text-amber-400"}`}>
                {riskRewardRatio}:1
              </span>
            </div>
            <button
              onClick={handleReveal}
              className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              Commit & Reveal Future
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Your Trade:</span>
            <span className="font-bold text-emerald-400">{direction}</span>
            <span className="text-slate-400">Target: <strong className="text-slate-200">{targetPrice} LKR</strong></span>
            <span className="text-slate-400">Stop: <strong className="text-slate-200">{stopPrice} LKR</strong></span>
            <span className="text-slate-400">R:R: <strong className="text-emerald-400">{riskRewardRatio}:1</strong></span>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div
          className={`p-4 rounded-lg border text-xs flex flex-col gap-2 ${
            result.passed
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
              : "bg-amber-950/40 border-amber-500/40 text-amber-100"
          }`}
        >
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-1.5">
              {result.passed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              {result.passed ? "Setup Mastered! (+20 Mastery)" : "Process Review Required"}
            </span>
            <span className="font-mono">{result.score}/100</span>
          </div>
          <p className="leading-relaxed">{result.feedback}</p>
        </div>
      )}
    </div>
  );
};
