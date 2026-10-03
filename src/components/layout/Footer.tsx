import React from "react";
import Link from "next/link";
import { ShieldAlert, BookOpen, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left disclaimer */}
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Educational Use Only — Not Financial Advice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            CSE Mastery is a simulation and educational platform designed to teach stock trading mechanics on the Colombo Stock Exchange (CSE), Sri Lanka. All portfolios, cash balances, and orders are 100% virtual. Past performance and simulated metrics do not represent real-world returns. CSE fees (1.120%) and CBSL benchmark yields (9.85%) are modeled for educational fidelity.
          </p>
        </div>

        {/* Links & Attributions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px]">
          <Link href="/status" className="hover:text-emerald-400 transition-colors">
            System Status & Quotas
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <Link href="/glossary" className="hover:text-emerald-400 transition-colors">
            Financial Glossary
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <a
            href="https://www.cse.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            <span>CSE Official</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-500">Asia/Colombo (UTC+5:30)</span>
        </div>
      </div>
    </footer>
  );
};
