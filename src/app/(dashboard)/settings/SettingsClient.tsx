"use client";

import React, { useState } from "react";
import { PortfolioSummary } from "@/lib/trading/engine";
import { formatLKR } from "@/lib/utils";
import {
  User,
  RotateCcw,
  Download,
  Trash2,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    masteryLevel: number;
    goal: string;
  };
  portfolio: PortfolioSummary;
}

export const SettingsClient: React.FC<SettingsClientProps> = ({
  user,
  portfolio: initialPortfolio,
}) => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem("cse_mastery_byo_key", apiKey);
      setSavedKey(true);
      setTimeout(() => setSavedKey(false), 3000);
    }
  };

  const handleResetAccount = async () => {
    if (!window.confirm("Are you sure you want to reset your mock trading account to LKR 1,000,000? This reset will be permanently recorded in your trading audit.")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/trade/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Type", "Symbol", "Shares", "Price", "Gross", "Fees", "Net", "Date"];
    const rows = portfolio.recentLedger.map((l) => [
      l.id,
      l.type,
      l.symbol || "N/A",
      l.shares || 0,
      l.price || 0,
      l.grossAmount,
      l.feeAmount,
      l.netAmount,
      l.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cse_mastery_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 text-xs max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          Settings & Account Management
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your student profile, reset virtual trading capital, configure BYO AI keys, and export data.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-100">Student Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Display Name:</span>
            <span className="font-bold text-slate-100 mt-0.5 block">{user.name}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Email Address:</span>
            <span className="font-bold text-slate-100 mt-0.5 block">{user.email}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Curriculum Rank:</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">Level {user.masteryLevel}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Trading Goal:</span>
            <span className="font-bold text-cyan-400 mt-0.5 block capitalize">{user.goal.replace("_", " ")}</span>
          </div>
        </div>
      </div>

      {/* Reset Mock Account */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Reset Virtual Mock Trading Account
            </h2>
            <p className="text-slate-400 mt-0.5">
              Current Balance: <strong className="text-slate-200">{formatLKR(portfolio.cash)}</strong> • Total Resets: <strong className="text-rose-400">{portfolio.resetCount}</strong>
            </p>
          </div>
          <button
            onClick={handleResetAccount}
            disabled={resetting}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to LKR 1,000,000</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Account successfully reset to LKR 1,000,000. Reset event logged in immutable ledger.</span>
          </div>
        )}
      </div>

      {/* Export & Data Management */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-emerald-400" />
          Export Data & Privacy Compliance
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Download a full CSV record of your mock trades, fees paid, journal entries, and ledger history for independent review.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trade History (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
