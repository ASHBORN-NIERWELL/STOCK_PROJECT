import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cseProvider } from "@/lib/cse/provider";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { DataFreshnessBadge } from "@/components/layout/DataFreshnessBadge";
import { formatLKR, formatPercentage, formatVolume } from "@/lib/utils";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  DollarSign,
  FileText,
  Percent,
  Activity,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: { symbol: string };
}) {
  const symbol = decodeURIComponent(params.symbol);
  const [quote, history, announcements] = await Promise.all([
    cseProvider.getStockQuote(symbol),
    cseProvider.getStockHistory(symbol, "6M"),
    cseProvider.getAnnouncements(symbol),
  ]);

  if (!quote) {
    notFound();
  }

  const isUp = quote.change >= 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">{quote.symbol}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              {quote.sector}
            </span>
            <DataFreshnessBadge freshness="LIVE" />
          </div>
          <p className="text-sm font-medium text-slate-300 mt-0.5">{quote.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <div className="text-2xl font-bold text-slate-100">{quote.price.toFixed(2)} LKR</div>
            <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isUp ? "+" : ""}{quote.change.toFixed(2)} ({formatPercentage(quote.percentageChange)})</span>
            </div>
          </div>

          <Link
            href={`/trade?symbol=${quote.symbol}`}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trade {quote.symbol.split(".")[0]}</span>
          </Link>
        </div>
      </div>

      {/* Chart and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-100">Price Action (Daily Candlesticks)</span>
          <TradingViewChart data={history} height={400} symbol={quote.symbol} />
        </div>

        {/* Intraday Stats */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-100">Trading Stats</span>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Day Range:</span>
              <span className="font-mono text-slate-200">{quote.low.toFixed(2)} - {quote.high.toFixed(2)} LKR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Open / Previous Close:</span>
              <span className="font-mono text-slate-200">{quote.open.toFixed(2)} / {quote.previousClose.toFixed(2)} LKR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Volume Traded:</span>
              <span className="font-mono text-slate-200">{formatVolume(quote.volume)} shares</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Turnover:</span>
              <span className="font-mono text-slate-200">{formatLKR(quote.turnover)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Market Capitalization:</span>
              <span className="font-mono text-emerald-400 font-bold">{formatLKR(quote.marketCap)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fundamental Ratios & Valuation */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-400" />
          Fundamental Valuation Multiples & Financial Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">P/E Ratio (TTM)</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-1">{quote.peRatio}x</div>
            <span className="text-[10px] text-slate-500">Industry avg: 9.4x</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">P/B Ratio (Book Value)</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-1">{quote.pbRatio}x</div>
            <span className="text-[10px] text-slate-500">Asset backing</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">Dividend Yield</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{quote.dividendYield}%</div>
            <span className="text-[10px] text-slate-500">Annual cash payout</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">Return on Equity (ROE)</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-1">{quote.roe}%</div>
            <span className="text-[10px] text-slate-500">Capital efficiency</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">Earnings Per Share (EPS)</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-1">{quote.eps.toFixed(2)} LKR</div>
            <span className="text-[10px] text-slate-500">Net income/share</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">Debt-to-Equity</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-1">{quote.debtToEquity}x</div>
            <span className="text-[10px] text-slate-500">Solvency ratio</span>
          </div>
        </div>
      </div>

      {/* Description & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            Company Overview
          </h3>
          <p className="text-slate-300 leading-relaxed">{quote.description}</p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Recent Corporate Disclosures & Dividends
          </h3>
          {announcements.length > 0 ? (
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-slate-200">{ann.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ann.details}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No active disclosures for this counter today.</p>
          )}
        </div>
      </div>
    </div>
  );
}
