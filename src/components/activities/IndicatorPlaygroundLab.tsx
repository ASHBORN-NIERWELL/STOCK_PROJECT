"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle, AlertCircle, Play } from "lucide-react";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { OHLCVBar } from "@/db/seed-data";
import { evaluateActivitySubmission, ScoringResult } from "@/lib/learning/scoring";

interface IndicatorPlaygroundLabProps {
  data: OHLCVBar[];
  symbol: string;
  scoringKey: string;
  solutionCriteria: Record<string, any>;
  onScoreUpdated?: (result: ScoringResult) => void;
}

export const IndicatorPlaygroundLab: React.FC<IndicatorPlaygroundLabProps> = ({
  data,
  symbol,
  scoringKey,
  solutionCriteria,
  onScoreUpdated,
}) => {
  const [fastMa, setFastMa] = useState<number>(20);
  const [slowMa, setSlowMa] = useState<number>(50);
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [result, setResult] = useState<ScoringResult | null>(null);

  // Compute simulated backtest signals
  const winRate = fastMa === 20 && slowMa === 50 ? 64 : fastMa < slowMa ? 52 : 38;
  const totalSignals = Math.max(3, Math.floor(100 / (slowMa - fastMa + 10)));
  const falseSignals = fastMa === 20 && slowMa === 50 ? 2 : Math.max(3, Math.floor(totalSignals * 0.45));

  const handleTest = () => {
    const res = evaluateActivitySubmission(
      scoringKey,
      { fastMa, slowMa, rsiPeriod, winRate },
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
            <Sliders className="w-4 h-4 text-emerald-400" />
            Indicator Playground & Backtest Optimizer
          </h3>
          <p className="text-slate-400 mt-0.5">
            Tune Moving Average lengths and RSI periods to balance trend capture against lagging false signals.
          </p>
        </div>
      </div>

      <TradingViewChart data={data} height={340} symbol={`${symbol} (MA ${fastMa}/${slowMa})`} />

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Fast Moving Average:</span>
            <span className="font-mono text-emerald-400 font-bold">{fastMa} days</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={fastMa}
            onChange={(e) => setFastMa(parseInt(e.target.value, 10))}
            className="accent-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Slow Moving Average:</span>
            <span className="font-mono text-cyan-400 font-bold">{slowMa} days</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={slowMa}
            onChange={(e) => setSlowMa(parseInt(e.target.value, 10))}
            className="accent-cyan-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400">
            <span>RSI Period:</span>
            <span className="font-mono text-purple-400 font-bold">{rsiPeriod}</span>
          </div>
          <input
            type="range"
            min="7"
            max="28"
            step="1"
            value={rsiPeriod}
            onChange={(e) => setRsiPeriod(parseInt(e.target.value, 10))}
            className="accent-purple-500"
          />
        </div>
      </div>

      {/* Backtest stats */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
        <div>
          <span className="text-slate-400">Backtest Win Rate:</span>
          <div className={`text-base font-bold font-mono mt-1 ${winRate >= 55 ? "text-emerald-400" : "text-amber-400"}`}>
            {winRate}%
          </div>
        </div>
        <div>
          <span className="text-slate-400">Total Crossover Signals:</span>
          <div className="text-base font-bold font-mono text-slate-200 mt-1">{totalSignals}</div>
        </div>
        <div>
          <span className="text-slate-400">False Whipsaw Signals:</span>
          <div className={`text-base font-bold font-mono mt-1 ${falseSignals <= 2 ? "text-emerald-400" : "text-rose-400"}`}>
            {falseSignals}
          </div>
        </div>
      </div>

      <button
        onClick={handleTest}
        className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
      >
        <Play className="w-3.5 h-3.5" />
        <span>Run Backtest & Verify Parameters</span>
      </button>

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
              {result.passed ? "Indicator Settings Verified! (+20 Indicator Mastery)" : "Settings Need Optimization"}
            </span>
            <span className="font-mono">{result.score}/100</span>
          </div>
          <p>{result.feedback}</p>
        </div>
      )}
    </div>
  );
};
