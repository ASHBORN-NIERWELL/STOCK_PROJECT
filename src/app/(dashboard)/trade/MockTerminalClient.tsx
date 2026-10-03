"use client";

import React, { useState } from "react";
import { StockQuote } from "@/db/seed-data";
import { PortfolioSummary } from "@/lib/trading/engine";
import { calculateCSEFees, roundToCSETick, getCSETickSize } from "@/lib/cse/fee-calculator";
import { formatLKR, formatPercentage, formatVolume } from "@/lib/utils";
import {
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  History,
  X,
} from "lucide-react";

interface MockTerminalClientProps {
  quotes: StockQuote[];
  portfolio: PortfolioSummary;
  defaultSymbol: string;
  userId: string;
  userMasteryLevel: number;
}

export const MockTerminalClient: React.FC<MockTerminalClientProps> = ({
  quotes,
  portfolio: initialPortfolio,
  defaultSymbol,
  userId,
  userMasteryLevel,
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(initialPortfolio);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP_LOSS">("MARKET");
  const [shares, setShares] = useState<number>(500);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [stopPrice, setStopPrice] = useState<number>(0);

  // Mandatory Journal
  const [thesis, setThesis] = useState<string>("Technical breakout above horizontal resistance with volume confirmation.");
  const [entryReason, setEntryReason] = useState<string>("BREAKOUT");
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(4);

  // Devil's Advocate state
  const [showDevilsAdvocate, setShowDevilsAdvocate] = useState(false);
  const [devilsCritique, setDevilsCritique] = useState<{ critique: string; challengeQuestion: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const activeQuote = quotes.find((q) => q.symbol === selectedSymbol) || quotes[0];
  const executionPrice = orderType === "LIMIT" && limitPrice > 0 ? limitPrice : activeQuote.price;
  const estimatedGross = executionPrice * shares;
  const feeBreakdown = calculateCSEFees(estimatedGross, side);

  const isUp = activeQuote.percentageChange >= 0;

  const handleOrderInitiation = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) return;

    // Generate Devil's Advocate critique before final placement
    const critiqueText = `Critique for ${side} ${shares} ${activeQuote.symbol.split(".")[0]} @ ${executionPrice.toFixed(2)} LKR:
1. CSE Round-Trip Drag: Total entry + exit costs require at least +2.27% price rise just to cover brokerage & SEC cess.
2. Market Liquidity: Ensure order size does not cause spread slippage against the best ask.
3. ${stopLossPrice > 0 ? `Your defined stop-loss is ${stopLossPrice} LKR. Will you honor it if tested?` : "WARNING: No stop-loss was set! Retail traders without stop-losses risk catastrophic drawdown."}`;

    setDevilsCritique({
      critique: critiqueText,
      challengeQuestion: `What specific price breakdown would invalidate your thesis on ${activeQuote.symbol.split(".")[0]}, and will you exit immediately without hoping for a bounce?`,
    });
    setShowDevilsAdvocate(true);
  };

  const handleConfirmTrade = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/trade/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: activeQuote.symbol,
          side,
          type: orderType,
          shares,
          limitPrice: orderType === "LIMIT" ? limitPrice : undefined,
          stopPrice: orderType === "STOP_LOSS" ? stopPrice : undefined,
          thesis,
          entryReason,
          targetPrice: targetPrice > 0 ? targetPrice : undefined,
          stopLossPrice: stopLossPrice > 0 ? stopLossPrice : undefined,
          confidenceLevel: confidence,
          devilsAdvocateAcknowledged: true,
        }),
      });

      const data = await res.json();
      setOrderFeedback(data);
      setShowDevilsAdvocate(false);

      if (data.success) {
        // Refresh portfolio
        const pRes = await fetch("/api/trade/portfolio");
        if (pRes.ok) {
          const pData = await pRes.json();
          setPortfolio(pData);
        }
      }
    } catch (e) {
      setOrderFeedback({ success: false, message: "Network trade execution error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-400" />
            Mock Trading Terminal (CSE Realistic Ledger)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real order book pricing, exact 1.12% CSE fees, mandatory trade journal, and Devil&apos;s Advocate discipline checks.
          </p>
        </div>

        {/* Balance cards */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Available Virtual Cash</span>
            <span className="text-sm font-bold text-emerald-400">{formatLKR(portfolio.cash)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Portfolio Equity</span>
            <span className="text-sm font-bold text-slate-100">{formatLKR(portfolio.totalEquity)}</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Ticket & Mandatory Journal */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-slate-200">Order Execution Ticket</span>
              <span className="text-[11px] text-slate-400">Long-Only (T+2)</span>
            </div>

            <form onSubmit={handleOrderInitiation} className="space-y-3">
              {/* Symbol Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Select CSE Counter:</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol} — {q.name} ({q.price.toFixed(2)} LKR)
                    </option>
                  ))}
                </select>
              </div>

              {/* Side (Buy / Sell) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide("BUY")}
                  className={`py-2 rounded font-bold transition-colors ${
                    side === "BUY" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setSide("SELL")}
                  className={`py-2 rounded font-bold transition-colors ${
                    side === "SELL" ? "bg-rose-600 text-white" : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  SELL (CLOSE)
                </button>
              </div>

              {/* Order Type */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Order Type:</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["MARKET", "LIMIT", "STOP_LOSS"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1 rounded text-[11px] font-medium transition-colors ${
                        orderType === t ? "bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shares */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Shares (Quantity):</label>
                <input
                  type="number"
                  step="100"
                  value={shares}
                  onChange={(e) => setShares(parseInt(e.target.value, 10) || 0)}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 font-bold"
                />
              </div>

              {/* Limit Price if LIMIT */}
              {orderType === "LIMIT" && (
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-medium">Limit Price (LKR):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={activeQuote.price.toString()}
                    value={limitPrice || ""}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100"
                  />
                </div>
              )}

              {/* Mandatory Journal Section */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Mandatory Trade Journal</span>
                  <span className="text-[10px] text-emerald-400">Enforced</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">Trade Setup & Thesis:</label>
                  <textarea
                    rows={2}
                    value={thesis}
                    onChange={(e) => setThesis(e.target.value)}
                    placeholder="Why are you taking this trade? What is your technical/fundamental reason?"
                    className="bg-slate-950 border border-slate-700 rounded p-2 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">Stop-Loss (LKR):</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 205.0"
                      value={stopLossPrice || ""}
                      onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-rose-400 font-bold text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">Target (LKR):</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 235.0"
                      value={targetPrice || ""}
                      onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-emerald-400 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Fee Preview */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Value:</span>
                  <span>{formatLKR(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>CSE Fees (1.120%):</span>
                  <span>+{formatLKR(feeBreakdown.totalFees)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1">
                  <span>Net Cash Required:</span>
                  <span className="text-emerald-400">{formatLKR(feeBreakdown.netTradeAmount)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || shares <= 0}
                className={`w-full py-2.5 rounded font-bold text-white transition-all shadow-sm ${
                  side === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                Review & Place Order
              </button>
            </form>
          </div>

          {/* Feedback banner */}
          {orderFeedback && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex flex-col gap-1 ${
                orderFeedback.success ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {orderFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span>{orderFeedback.success ? "Trade Processed" : "Order Rejected"}</span>
              </div>
              <p className="leading-relaxed">{orderFeedback.message}</p>
            </div>
          )}
        </div>

        {/* Right Column: Positions, Pending Orders, and Immutable Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Current Positions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100">Active Stock Positions</span>
              <span className="text-xs text-slate-400">{portfolio.positions.length} holdings</span>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto text-xs">
              {portfolio.positions.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Symbol</th>
                      <th className="p-3">Shares</th>
                      <th className="p-3">Avg Cost</th>
                      <th className="p-3">Current</th>
                      <th className="p-3">Market Value</th>
                      <th className="p-3">Unrealized P&L</th>
                      <th className="p-3">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {portfolio.positions.map((p) => {
                      const isProfit = p.unrealizedPnL >= 0;
                      return (
                        <tr key={p.symbol} className="hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-100">{p.symbol}</td>
                          <td className="p-3 text-slate-300">{p.shares.toLocaleString()}</td>
                          <td className="p-3 text-slate-400">{p.averageCost.toFixed(2)}</td>
                          <td className="p-3 text-slate-200">{p.currentPrice.toFixed(2)}</td>
                          <td className="p-3 text-slate-100">{formatLKR(p.marketValue)}</td>
                          <td className={`p-3 font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                            {formatLKR(p.unrealizedPnL)} ({formatPercentage(p.unrealizedPnLPercent)})
                          </td>
                          <td className="p-3 text-slate-400">{p.portfolioWeightPercent}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No active stock positions. Submit a BUY order on the left to start building your portfolio.
                </div>
              )}
            </div>
          </div>

          {/* Pending Orders */}
          {portfolio.pendingOrders.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-slate-100">Pending Orders (Evaluating On-Read)</span>
              <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs font-mono">
                {portfolio.pendingOrders.map((ord) => (
                  <div key={ord.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400">{ord.side}</span>{" "}
                      <span className="text-slate-100 font-bold">{ord.shares} {ord.symbol}</span>{" "}
                      <span className="text-slate-400">({ord.type})</span>
                    </div>
                    <div className="text-slate-400">
                      Price: {ord.limitPrice || ord.stopPrice} LKR • Status: <span className="text-amber-400">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Ledger Entries */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-slate-100">Immutable Ledger History</span>
            <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs font-mono">
              {portfolio.recentLedger.map((e) => (
                <div key={e.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold mr-2">
                      {e.type}
                    </span>
                    <span className="text-slate-200">
                      {e.symbol ? `${e.shares} ${e.symbol} @ ${e.price} LKR` : "Virtual Cash Movement"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-100 font-bold">{formatLKR(e.grossAmount)}</div>
                    {e.feeAmount > 0 && (
                      <div className="text-[10px] text-rose-400">Fee: -{formatLKR(e.feeAmount)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Devil's Advocate Pre-Trade Modal */}
      {showDevilsAdvocate && devilsCritique && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 flex flex-col gap-4 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Devil&apos;s Advocate Challenge</h3>
              </div>
              <button
                onClick={() => setShowDevilsAdvocate(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-950/30 rounded-lg border border-rose-500/30 text-rose-200 leading-relaxed whitespace-pre-wrap">
              {devilsCritique.critique}
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-amber-300 block mb-1">Challenge Question:</span>
              <p className="text-slate-300 leading-relaxed">{devilsCritique.challengeQuestion}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDevilsAdvocate(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                Cancel & Re-evaluate
              </button>
              <button
                type="button"
                onClick={handleConfirmTrade}
                disabled={submitting}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <span>{submitting ? "Executing..." : "I Accept Risk — Execute Trade"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
