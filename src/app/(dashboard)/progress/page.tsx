import React from "react";
import { adaptiveEngine } from "@/lib/learning/adaptive-engine";
import { getCurrentUser } from "@/lib/auth/session";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { CalibrationPlot } from "@/components/charts/CalibrationPlot";
import { Award, BookOpen, TrendingUp, CheckCircle2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";
  const profile = await adaptiveEngine.getUserMasteryProfile(userId);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Skill Radar & Mastery Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Blended rating calculated from curriculum lab accuracy (40%) and real mock trading execution (60%).
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Current Rank: <strong className="text-emerald-400">Level {profile.currentLevel}</strong>
          </span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blended Mastery */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950/30 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Overall Mastery Rating</span>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-emerald-400">{profile.overallMasteryRating}/100</div>
            <span className="text-xs font-semibold text-emerald-300 mt-1 block">{profile.ratingLabel}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 border-t border-slate-800 pt-2">
            Weighted: 40% Labs + 60% Mock Ledger
          </span>
        </div>

        {/* Knowledge Labs */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Curriculum Knowledge Score</span>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-cyan-400">{profile.knowledgeScore}%</div>
            <span className="text-xs text-slate-300 mt-1 block">{profile.completedLessonsCount} Interactive Labs Completed</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 border-t border-slate-800 pt-2">
            Algorithmically verified code scoring
          </span>
        </div>

        {/* Trading Execution Score */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Live Mock Execution Score</span>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-amber-400">{profile.tradingScore}%</div>
            <span className="text-xs text-slate-300 mt-1 block">Risk, Sizing & Fee Discipline</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 border-t border-slate-800 pt-2">
            Derived directly from ledger P&L and journal
          </span>
        </div>
      </div>

      {/* Visual Analytics: Radar & Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            6-Dimension Competency Radar
          </h2>
          <SkillRadar data={profile.skillsRadar} height={280} />
        </div>

        {/* Calibration */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Calibration: Confidence vs Actual Accuracy
          </h2>
          <CalibrationPlot data={profile.calibrationData} height={280} />
        </div>
      </div>
    </div>
  );
}
