"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StockQuote, CSE_SECTORS } from "@/db/seed-data";
import { formatLKR, formatPercentage, formatVolume } from "@/lib/utils";
import { Sliders, Search, ArrowUpDown, TrendingUp } from "lucide-react";

interface StockScreenerClientProps {
  quotes: StockQuote[];
}

export const StockScreenerClient: React.FC<StockScreenerClientProps> = ({ quotes }) => {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [maxPe, setMaxPe] = useState<number>(25);
  const [minYield, setMinYield] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"turnover" | "peRatio" | "dividendYield" | "percentageChange">("turnover");

  const filtered = quotes
    .filter((q) => {
      if (search && !q.symbol.toLowerCase().includes(search.toLowerCase()) && !q.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedSector !== "ALL" && q.sectorCode !== selectedSector && q.sector !== selectedSector) {
        return false;
      }
      if (q.peRatio > maxPe) return false;
      if (q.dividendYield < minYield) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "turnover") return b.turnover - a.turnover;
      if (sortBy === "peRatio") return a.peRatio - b.peRatio;
      if (sortBy === "dividendYield") return b.dividendYield - a.dividendYield;
      if (sortBy === "percentageChange") return b.percentageChange - a.percentageChange;
      return 0;
    });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            CSE Stock Screener & Quantitative Filter
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter all 278+ Colombo Stock Exchange equities by valuation (P/E, P/B), cash dividend yield, sector, and liquidity.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-400 font-medium">Search Ticker / Name:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="e.g. JKH, COMB, Hayleys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sector */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-400 font-medium">Sector:</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Sectors ({quotes.length})</option>
            {CSE_SECTORS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Max P/E */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-slate-400">
            <span>Max P/E Multiple:</span>
            <span className="font-mono text-emerald-400 font-bold">{maxPe}x</span>
          </div>
          <input
            type="range"
            min="4"
            max="30"
            step="1"
            value={maxPe}
            onChange={(e) => setMaxPe(parseInt(e.target.value, 10))}
            className="accent-emerald-500 mt-1"
          />
        </div>

        {/* Min Dividend Yield */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-slate-400">
            <span>Min Dividend Yield:</span>
            <span className="font-mono text-emerald-400 font-bold">{minYield}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={minYield}
            onChange={(e) => setMinYield(parseFloat(e.target.value))}
            className="accent-emerald-500 mt-1"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">Symbol</th>
              <th className="p-3">Company Name</th>
              <th className="p-3">Sector</th>
              <th className="p-3">Price</th>
              <th className="p-3">Day %</th>
              <th className="p-3">P/E Ratio</th>
              <th className="p-3">P/B Ratio</th>
              <th className="p-3">Div Yield</th>
              <th className="p-3">Turnover</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filtered.map((stock) => {
              const isUp = stock.percentageChange >= 0;
              return (
                <tr key={stock.symbol} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-100">
                    <Link href={`/market/${stock.symbol}`} className="hover:text-emerald-400">
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="p-3 font-sans text-slate-300 max-w-[160px] truncate">{stock.name}</td>
                  <td className="p-3 font-sans text-slate-400">{stock.sector}</td>
                  <td className="p-3 font-bold text-slate-100">{stock.price.toFixed(2)}</td>
                  <td className={`p-3 font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatPercentage(stock.percentageChange)}
                  </td>
                  <td className="p-3 text-slate-300">{stock.peRatio}x</td>
                  <td className="p-3 text-slate-300">{stock.pbRatio}x</td>
                  <td className="p-3 text-emerald-400 font-bold">{stock.dividendYield}%</td>
                  <td className="p-3 text-slate-400">{formatLKR(stock.turnover)}</td>
                  <td className="p-3 font-sans">
                    <Link
                      href={`/trade?symbol=${stock.symbol}`}
                      className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
