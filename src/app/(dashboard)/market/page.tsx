import React from "react";
import Link from "next/link";
import { cseProvider } from "@/lib/cse/provider";
import { getMacroData } from "@/lib/cse/macro-data";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { SectorHeatmapGrid } from "@/components/charts/SectorHeatmapGrid";
import { DataFreshnessBadge } from "@/components/layout/DataFreshnessBadge";
import { formatLKR, formatPercentage, formatVolume, formatColomboDate } from "@/lib/utils";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Flame,
  Globe,
  Bell,
  Sparkles,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketDashboardPage() {
  const [marketSummary, macroData, aspiHistory, announcements] = await Promise.all([
    cseProvider.getMarketSummary(),
    getMacroData(),
    cseProvider.getStockHistory("ASPI", "6M"),
    cseProvider.getAnnouncements(),
  ]);

  const aspi = marketSummary.aspi;
  const isAspiUp = aspi.change >= 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Colombo Stock Exchange (CSE) Live Market</h1>
            <DataFreshnessBadge freshness={marketSummary.freshness} source={marketSummary.source} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official All Share Price Index (ASPI), S&P SL20, sector heatmaps, real-time quotes, and CBSL macro indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/trade"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open Mock Terminal</span>
          </Link>
        </div>
      </div>

      {/* Primary Indices & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main ASPI Candlestick Chart */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-100">ASPI Price Action (6-Month Daily Bars)</span>
              <span className={`text-xs font-mono font-bold ${isAspiUp ? "text-emerald-400" : "text-rose-400"}`}>
                {aspi.value.toLocaleString()} ({formatPercentage(aspi.percentageChange)})
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">CSE Regular Session: 09:30-14:30 SLST</span>
          </div>
          <TradingViewChart data={aspiHistory} height={380} symbol="CSE: ASPI (All Share Price Index)" />
        </div>

        {/* Index Summary & Market Stats */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-100">Market Overview</span>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs">
            {/* ASPI */}
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200">ASPI (All Share)</span>
                <div className="text-[10px] text-slate-400">Total Market Capitalization</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-slate-100">{aspi.value.toLocaleString()}</div>
                <div className={`text-[11px] font-semibold ${isAspiUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isAspiUp ? "+" : ""}{aspi.change.toFixed(2)} ({formatPercentage(aspi.percentageChange)})
                </div>
              </div>
            </div>

            {/* S&P SL20 */}
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200">S&P Sri Lanka 20</span>
                <div className="text-[10px] text-slate-400">Top 20 Liquid Bluechips</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-slate-100">{marketSummary.spSl20.value.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  +{marketSummary.spSl20.change.toFixed(2)} ({formatPercentage(marketSummary.spSl20.percentageChange)})
                </div>
              </div>
            </div>

            {/* Turnover & Volume */}
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Turnover:</span>
                <span className="font-mono font-bold text-slate-100">{formatLKR(marketSummary.totalTurnover)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Share Volume:</span>
                <span className="font-mono text-slate-200">{formatVolume(marketSummary.totalVolume)} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Executed Trades:</span>
                <span className="font-mono text-slate-200">{marketSummary.totalTrades.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Advancers / Decliners:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {marketSummary.advances} <span className="text-slate-500">/</span> <span className="text-rose-400">{marketSummary.declines}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            CSE Sector Heatmap & Capital Flows
          </h2>
          <span className="text-xs text-slate-400">Click any sector to inspect constituents</span>
        </div>
        <SectorHeatmapGrid sectors={marketSummary.sectorHeatmap} />
      </div>

      {/* Top Gainers, Losers, and Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Top Gainers</h3>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <div className="divide-y divide-slate-800">
              {marketSummary.topGainers.slice(0, 5).map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/market/${stock.symbol}`}
                  className="p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors group"
                >
                  <div>
                    <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {stock.symbol}
                    </span>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{stock.name}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-200">{stock.price.toFixed(2)} LKR</div>
                    <div className="text-[11px] text-emerald-400 font-bold">
                      +{stock.percentageChange.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Top Losers */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100">Top Losers</h3>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <div className="divide-y divide-slate-800">
              {marketSummary.topLosers.slice(0, 5).map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/market/${stock.symbol}`}
                  className="p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors group"
                >
                  <div>
                    <span className="font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                      {stock.symbol}
                    </span>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{stock.name}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-200">{stock.price.toFixed(2)} LKR</div>
                    <div className="text-[11px] text-rose-400 font-bold">
                      {stock.percentageChange.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Most Active by Turnover */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Most Active by Turnover</h3>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <div className="divide-y divide-slate-800">
              {marketSummary.mostActive.slice(0, 5).map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/market/${stock.symbol}`}
                  className="p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors group"
                >
                  <div>
                    <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {stock.symbol}
                    </span>
                    <div className="text-[10px] text-slate-400">Vol: {formatVolume(stock.volume)}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-200">{formatLKR(stock.turnover)}</div>
                    <div className="text-[10px] text-slate-400">{stock.price.toFixed(2)} LKR</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sri Lanka Macro Panel & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Indicators */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Sri Lanka Macroeconomic & Benchmark Indicators</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
            {macroData.indicators.slice(0, 4).map((ind) => (
              <div key={ind.key} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">{ind.name}</span>
                  <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                    {ind.value} {ind.unit}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 truncate" title={ind.source}>
                  Src: {ind.source}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Announcements Feed */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">Verified Corporate Announcements</h3>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{ann.companyName} ({ann.symbol})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {ann.type}
                  </span>
                </div>
                <p className="text-slate-300 font-medium">{ann.title}</p>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-emerald-300/90 leading-relaxed">
                  <strong>AI Explanation:</strong> {ann.aiExplanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
