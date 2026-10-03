"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LessonSpec } from "@/lib/learning/curriculum";
import { OHLCVBar } from "@/db/seed-data";
import { UserProgressEntity } from "@/db/memory-store";
import { ScoringResult } from "@/lib/learning/scoring";
import { ChartAnnotationLab } from "@/components/activities/ChartAnnotationLab";
import { PredictMoveLab } from "@/components/activities/PredictMoveLab";
import { FeeSimulatorLab } from "@/components/activities/FeeSimulatorLab";
import { PositionSizeLab } from "@/components/activities/PositionSizeLab";
import { IndicatorPlaygroundLab } from "@/components/activities/IndicatorPlaygroundLab";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Bot,
  Star,
} from "lucide-react";

interface LabPlayerClientProps {
  lesson: LessonSpec;
  history: OHLCVBar[];
  symbol: string;
  existingProgress?: UserProgressEntity;
  userId: string;
}

export const LabPlayerClient: React.FC<LabPlayerClientProps> = ({
  lesson,
  history,
  symbol,
  existingProgress,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<"HOOK" | "EXPLORE" | "EXPLAIN" | "APPLY" | "REFLECT">("EXPLORE");
  const [confidence, setConfidence] = useState<number>(existingProgress?.confidenceRating || 4);
  const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(Boolean(existingProgress?.completed));

  const handleScoreUpdate = async (result: ScoringResult) => {
    setScoreResult(result);
    if (result.passed) {
      setSavedSuccess(true);
      try {
        await fetch("/api/learn/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            scoringKey: lesson.applyTask.scoringKey,
            userAnswer: result.breakdown,
            solutionCriteria: lesson.applyTask.solutionCriteria,
            confidenceRating: confidence,
          }),
        });
      } catch (e) {
        console.error("Score save error:", e);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header breadcrumb & completion status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400">Level {lesson.level}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Module {lesson.moduleIndex}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 mt-0.5">{lesson.title}</h1>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mastery Verified</span>
          </div>
        )}
      </div>

      {/* 5-Step Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("HOOK")}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "HOOK" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          1. The Hook
        </button>
        <button
          onClick={() => setActiveTab("EXPLORE")}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "EXPLORE" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          2. Interactive Lab
        </button>
        <button
          onClick={() => setActiveTab("EXPLAIN")}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "EXPLAIN" ? "bg-slate-800 text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          3. Theory & Context
        </button>
        <button
          onClick={() => setActiveTab("REFLECT")}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "REFLECT" ? "bg-slate-800 text-purple-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          4. Confidence & Reflect
        </button>
      </div>

      {/* Tab 1: Hook */}
      {activeTab === "HOOK" && (
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs leading-relaxed animate-in fade-in">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            {lesson.hook.title}
          </h2>
          <p className="text-slate-300 text-sm">{lesson.hook.scenario}</p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setActiveTab("EXPLORE")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5"
            >
              <span>Jump to Interactive Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Explore Lab (Interactive Activity) */}
      {activeTab === "EXPLORE" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          {lesson.explore.activityType === "CHART_ANNOTATION" && (
            <ChartAnnotationLab
              data={history}
              symbol={symbol}
              scoringKey={lesson.applyTask.scoringKey}
              solutionCriteria={lesson.applyTask.solutionCriteria}
              onScoreUpdated={handleScoreUpdate}
            />
          )}

          {lesson.explore.activityType === "PREDICT_NEXT_MOVE" && (
            <PredictMoveLab
              fullData={history}
              cutoffIndex={60}
              symbol={symbol}
              scoringKey={lesson.applyTask.scoringKey}
              solutionCriteria={lesson.applyTask.solutionCriteria}
              onScoreUpdated={handleScoreUpdate}
            />
          )}

          {lesson.explore.activityType === "FEE_SIMULATOR" && (
            <FeeSimulatorLab
              initialConfig={lesson.explore.initialConfig}
              scoringKey={lesson.applyTask.scoringKey}
              solutionCriteria={lesson.applyTask.solutionCriteria}
              onScoreUpdated={handleScoreUpdate}
            />
          )}

          {lesson.explore.activityType === "POSITION_SIZING" && (
            <PositionSizeLab
              initialConfig={lesson.explore.initialConfig}
              scoringKey={lesson.applyTask.scoringKey}
              solutionCriteria={lesson.applyTask.solutionCriteria}
              onScoreUpdated={handleScoreUpdate}
            />
          )}

          {lesson.explore.activityType === "INDICATOR_PLAYGROUND" && (
            <IndicatorPlaygroundLab
              data={history}
              symbol={symbol}
              scoringKey={lesson.applyTask.scoringKey}
              solutionCriteria={lesson.applyTask.solutionCriteria}
              onScoreUpdated={handleScoreUpdate}
            />
          )}
        </div>
      )}

      {/* Tab 3: Explain (Theory) */}
      {activeTab === "EXPLAIN" && (
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-4 text-xs leading-relaxed animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Core Principle & Sri Lankan Market Context
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{lesson.explain.concept}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200">Key Takeaways:</span>
            <ul className="space-y-1 text-slate-400">
              {lesson.explain.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-emerald-950/30 rounded-lg border border-emerald-500/30 text-emerald-200">
            <strong>Sri Lankan Reality:</strong> {lesson.explain.sriLankanContext}
          </div>
        </div>
      )}

      {/* Tab 4: Reflect */}
      {activeTab === "REFLECT" && (
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-4 text-xs animate-in fade-in">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Calibration & Self-Reflection
          </h2>
          <p className="text-slate-300 leading-relaxed">{lesson.reflectPrompt}</p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="font-bold text-slate-300">Rate your confidence in executing this setup live:</span>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setConfidence(star)}
                  className={`p-2 rounded-lg border flex items-center gap-1 font-bold ${
                    confidence === star
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${confidence >= star ? "fill-amber-400 text-amber-400" : ""}`} />
                  <span>{star}</span>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">
              Confidence calibration is tracked on your Mastery Radar to prevent Dunning-Kruger overconfidence.
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <Link href="/learn" className="text-emerald-400 hover:underline">
              Return to Curriculum
            </Link>
            <Link
              href="/trade"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
            >
              <span>Practice on Mock Terminal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
