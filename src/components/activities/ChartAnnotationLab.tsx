"use client";

import React, { useState } from "react";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { OHLCVBar } from "@/db/seed-data";
import { CheckCircle, AlertCircle, RefreshCw, Target, HelpCircle } from "lucide-react";
import { evaluateActivitySubmission, ScoringResult } from "@/lib/learning/scoring";

interface ChartAnnotationLabProps {
  data: OHLCVBar[];
  symbol: string;
  scoringKey: string;
  solutionCriteria: Record<string, any>;
  onScoreUpdated?: (result: ScoringResult) => void;
}

export const ChartAnnotationLab: React.FC<ChartAnnotationLabProps> = ({
  data,
  symbol,
  scoringKey,
  solutionCriteria,
  onScoreUpdated,
}) => {
  const [markedPrice, setMarkedPrice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleAnnotation = (price: number) => {
    if (submitted) return;
    setMarkedPrice(Math.round(price * 100) / 100);
  };

  const handleSubmit = async () => {
    if (!markedPrice) return;
    const res = evaluateActivitySubmission(scoringKey, { priceLevel: markedPrice }, solutionCriteria);
    setResult(res);
    setSubmitted(true);
    onScoreUpdated?.(res);
  };

  const handleReset = () => {
    setMarkedPrice(null);
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      {/* Instructions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Chart Annotation Task: Support & Demand Zone
          </h3>
          <p className="text-xs text-slate-400">
            Click on any candlestick wick cluster on the chart where buyers previously stepped in to mark your support zone.
          </p>
        </div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="self-start sm:self-auto text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>
      </div>

      {showHint && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-200 animate-in fade-in">
          💡 <strong>Hint:</strong> Scan the bottom wicks around the lowest consolidation shelf. Look for the price area where the market rejected lower prices multiple times.
        </div>
      )}

      {/* Chart */}
      <TradingViewChart
        data={data}
        height={380}
        symbol={symbol}
        onAnnotation={handleAnnotation}
      />

      {/* Control panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Your Marked Zone:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {markedPrice ? `${markedPrice.toFixed(2)} LKR` : "Click chart to mark zone"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {submitted && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!markedPrice || submitted}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
          >
            Submit & Verify Zone
          </button>
        </div>
      </div>

      {/* Feedback Card */}
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
              {result.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              {result.passed ? "Zone Verified! (+15 Mastery)" : "Zone Placement Needs Adjustment"}
            </span>
            <span className="font-mono">{result.score}/100</span>
          </div>
          <p className="leading-relaxed">{result.feedback}</p>
        </div>
      )}
    </div>
  );
};
