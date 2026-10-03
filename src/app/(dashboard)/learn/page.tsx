import React from "react";
import Link from "next/link";
import { CURRICULUM_LEVELS, ALL_LESSONS } from "@/lib/learning/curriculum";
import { getCurrentUser } from "@/lib/auth/session";
import { memoryStore } from "@/db/memory-store";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";
  const progressList = memoryStore.getProgressByUserId(userId);
  const completedMap = new Map(progressList.map((p) => [p.lessonId, p]));

  const userLevel = user?.masteryLevel || 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">CSE Mastery Curriculum Path (10 Levels)</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Current: Level {userLevel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Progression from complete market beginner to institutional mastery. Every lesson ends in a hands-on interactive lab.
          </p>
        </div>
      </div>

      {/* 10 Levels Roadmap */}
      <div className="space-y-6">
        {CURRICULUM_LEVELS.map((lvl) => {
          const isUnlocked = lvl.level <= userLevel + 1;
          const levelLessons = ALL_LESSONS.filter((l) => l.level === lvl.level);

          return (
            <div
              key={lvl.level}
              className={`rounded-xl border transition-all ${
                isUnlocked
                  ? "bg-slate-900/90 border-slate-800 shadow-sm"
                  : "bg-slate-950/40 border-slate-800/40 opacity-60"
              }`}
            >
              {/* Level Header */}
              <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${lvl.color}25`, color: lvl.color, border: `1px solid ${lvl.color}50` }}
                  >
                    {lvl.level}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{lvl.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{lvl.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
                  >
                    {lvl.badge}
                  </span>
                  {!isUnlocked && (
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Module Lessons Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {levelLessons.length > 0 ? (
                  levelLessons.map((lesson) => {
                    const prog = completedMap.get(lesson.id);
                    const isPassed = Boolean(prog?.completed);

                    return (
                      <Link
                        key={lesson.id}
                        href={isUnlocked ? `/learn/${lesson.id}` : "#"}
                        className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                          !isUnlocked
                            ? "cursor-not-allowed bg-slate-950/40 border-slate-800/40"
                            : isPassed
                            ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                              Module {lesson.moduleIndex}
                            </span>
                            {isPassed ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed ({prog?.score}%)</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 mt-1.5 leading-snug">
                            {lesson.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {lesson.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Activity: {lesson.explore.activityType.replace(/_/g, " ")}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-2 p-3 text-xs text-slate-500 italic">
                    Advanced institutional modules unlock upon completing foundational Level 0-6 challenges.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
