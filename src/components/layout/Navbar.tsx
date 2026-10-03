"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  BookOpen,
  LineChart,
  ShieldAlert,
  Sliders,
  Award,
  BookMarked,
  Activity,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { DataFreshnessBadge } from "./DataFreshnessBadge";
import { isMarketOpenNow, formatLKR } from "@/lib/utils";

interface NavbarProps {
  onOpenTutor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTutor }) => {
  const pathname = usePathname();
  const [marketOpen, setMarketOpen] = useState(false);
  const [cashBalance, setCashBalance] = useState(1000000);

  useEffect(() => {
    setMarketOpen(isMarketOpenNow());
    const interval = setInterval(() => {
      setMarketOpen(isMarketOpenNow());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Today's Session", icon: Sparkles },
    { href: "/market", label: "Market", icon: TrendingUp },
    { href: "/learn", label: "Curriculum", icon: BookOpen },
    { href: "/trade", label: "Mock Terminal", icon: LineChart },
    { href: "/report", label: "Brutal Truth", icon: ShieldAlert, highlight: true },
    { href: "/tools/screener", label: "Screener", icon: Sliders },
    { href: "/progress", label: "Mastery", icon: Award },
    { href: "/glossary", label: "Glossary", icon: BookMarked },
    { href: "/status", label: "Status", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
                CSE Mastery
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  SLST
                </span>
              </span>
              <span className="text-[10px] text-slate-400">Colombo Stock Exchange Simulator</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 font-semibold"
                      : link.highlight
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-semibold"
                      : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.highlight ? "text-rose-400" : ""}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side stats & Tutor trigger */}
        <div className="flex items-center gap-3">
          {/* Market status indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                marketOpen
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              <span>{marketOpen ? "CSE Open (09:30-14:30)" : "CSE Closed"}</span>
            </div>
            <DataFreshnessBadge freshness="LIVE" />
          </div>

          {/* Virtual Balance badge */}
          <Link
            href="/trade/portfolio"
            className="hidden md:flex flex-col items-end px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <span className="text-[10px] uppercase text-slate-400 font-medium">Virtual Equity</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{formatLKR(cashBalance)}</span>
          </Link>

          {/* Ask Tutor AI Button */}
          {onOpenTutor && (
            <button
              onClick={onOpenTutor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium shadow-sm transition-all hover:scale-102"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Tutor</span>
            </button>
          )}

          {/* User Profile avatar */}
          <Link
            href="/settings"
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-500 transition-colors"
            title="Settings & Profile"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
