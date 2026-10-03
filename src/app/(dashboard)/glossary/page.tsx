"use client";

import React, { useState } from "react";
import { BookMarked, Search, Tag } from "lucide-react";

interface GlossaryItem {
  term: string;
  category: "CSE Mechanics" | "Valuation" | "Macro" | "Trading";
  definition: string;
  cseExample: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "ASPI (All Share Price Index)",
    category: "CSE Mechanics",
    definition: "The principal stock index of the Colombo Stock Exchange measuring the price performance of all listed voting equity shares weighted by market capitalization.",
    cseExample: "If JKH or LOLC gains 5%, it pulls the ASPI upward proportionally to its large market cap weight.",
  },
  {
    term: "S&P Sri Lanka 20 (S&P SL20)",
    category: "CSE Mechanics",
    definition: "An index designed to measure the performance of the 20 largest and most liquid stocks listed on the CSE, rebalanced semi-annually.",
    cseExample: "Institutional foreign funds often use S&P SL20 ETFs as their primary gateway for Sri Lankan equity exposure.",
  },
  {
    term: "CDS Account",
    category: "CSE Mechanics",
    definition: "Central Depository Systems (Pvt) Limited — the electronic registry and custodian holding all Sri Lankan securities in dematerialized form.",
    cseExample: "To buy shares of Commercial Bank on CSE, your broker opens a CDS account linked to your National Identity Card (NIC).",
  },
  {
    term: "Ex-Dividend Date (XD)",
    category: "CSE Mechanics",
    definition: "The cutoff date established by the CSE on which a stock begins trading without the right to the declared cash dividend.",
    cseExample: "If COMB pays LKR 4.50 dividend with XD on Oct 10, anyone buying on Oct 10 does not receive the dividend; only shareholders holding before Oct 10 qualify.",
  },
  {
    term: "T+2 Settlement",
    category: "CSE Mechanics",
    definition: "The settlement timeline for CSE equity transactions where cash and shares legally exchange ownership two business days after the trade execution date.",
    cseExample: "If you sell shares on Monday, your sale proceeds become cleared and available for withdrawal to your commercial bank on Wednesday.",
  },
  {
    term: "Share Transaction Levy (STL)",
    category: "CSE Mechanics",
    definition: "A mandatory government tax of 0.30% levied on both purchase and sale transactions on the Colombo Stock Exchange, collected on behalf of the Department of Inland Revenue.",
    cseExample: "On a LKR 100,000 trade, exactly LKR 300 is automatically deducted as STL.",
  },
  {
    term: "SEC Cess",
    category: "CSE Mechanics",
    definition: "A regulatory levy of 0.072% charged on every CSE trade to fund the Securities and Exchange Commission of Sri Lanka.",
    cseExample: "Forms part of the standard 1.120% transaction cost breakdown.",
  },
  {
    term: "P/E Ratio (Price-to-Earnings)",
    category: "Valuation",
    definition: "A valuation multiple comparing a company's current share price to its annual earnings per share (EPS). Measures how many Rupees investors pay for each LKR 1 of net profit.",
    cseExample: "Commercial Bank trading at 124 LKR with 23.85 LKR EPS has a P/E of 5.2x.",
  },
  {
    term: "Return on Equity (ROE)",
    category: "Valuation",
    definition: "A measure of corporate profitability calculated by dividing net profit by total shareholders' equity. Demonstrates how efficiently management compounds retained capital.",
    cseExample: "Hayleys generating 14.5% ROE produces LKR 14.50 in net profit for every LKR 100 of net asset equity.",
  },
  {
    term: "CBSL Standing Deposit Facility Rate (SDFR)",
    category: "Macro",
    definition: "The policy interest rate at which commercial banks deposit surplus funds with the Central Bank of Sri Lanka overnight. Anchors domestic market yields.",
    cseExample: "When CBSL lowers the SDFR rate to 8.25%, fixed deposit yields drop, encouraging capital into dividend-yielding CSE equities.",
  },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filtered = GLOSSARY_ITEMS.filter((item) => {
    if (search && !item.term.toLowerCase().includes(search.toLowerCase()) && !item.definition.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-400" />
            Colombo Stock Exchange Financial Glossary
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional and regulatory definitions for Sri Lankan market terminology, fee codes, indices, and mechanics.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search financial terms, indices, formulas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {["ALL", "CSE Mechanics", "Valuation", "Macro", "Trading"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Term Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.term} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">{item.term}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-medium border border-slate-700">
                  {item.category}
                </span>
              </div>
              <p className="text-slate-300 mt-2 leading-relaxed">{item.definition}</p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-emerald-300">CSE Application:</strong> {item.cseExample}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
