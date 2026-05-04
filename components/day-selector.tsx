"use client";

import type { StudyPlanDay } from "@/lib/study-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CalendarDays } from "lucide-react";

interface DaySelectorProps {
  studyPlan: readonly StudyPlanDay[];
  completedDays: Set<number>;
  onSelectDay: (day: StudyPlanDay) => void;
}

const SECTION_COLORS: Record<string, string> = {
  English: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Math: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Reading: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  All: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Setup: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Rest: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

function getTodayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DaySelector({
  studyPlan,
  completedDays,
  onSelectDay,
}: DaySelectorProps) {
  const todayIso = getTodayIso();
  const completedCount = completedDays.size;

  // Group days by phase
  const phases = new Map<number, { phaseName: string; days: StudyPlanDay[] }>();
  for (const day of studyPlan) {
    if (!phases.has(day.phase)) {
      phases.set(day.phase, { phaseName: day.phaseName, days: [] });
    }
    phases.get(day.phase)!.days.push(day);
  }

  return (
    <div className="space-y-4" role="region" aria-label="Study plan day selector">
      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">
              {completedCount} / 41 days completed
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round((completedCount / 41) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / 41) * 100}%`,
                background: "linear-gradient(90deg, var(--fau-blue), var(--fau-red))",
              }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={41}
              aria-label={`${completedCount} of 41 days completed`}
            />
          </div>
        </div>
      </div>

      {/* Phase groups */}
      {Array.from(phases.entries()).map(([phase, { phaseName, days }]) => (
        <Card key={phase} size="sm">
          <CardHeader>
            <CardTitle className="text-sm">
              Phase {phase}: {phaseName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {days.map((day) => {
                const isCompleted = completedDays.has(day.dayNumber);
                const isToday = day.isoDate === todayIso;
                const sectionStyle =
                  SECTION_COLORS[day.section] ?? SECTION_COLORS.Setup;

                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => onSelectDay(day)}
                    className={`relative flex items-start gap-2 rounded-lg p-2.5 text-left transition-all hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      isToday
                        ? "ring-2 ring-[#CC0000]/60 bg-[#CC0000]/5"
                        : "border border-border/50"
                    } ${isCompleted ? "bg-primary/5 border-primary/20" : ""}`}
                    aria-label={`Day ${day.dayNumber}: ${day.topic}${
                      isCompleted ? " (completed)" : ""
                    }${isToday ? " (today)" : ""}`}
                  >
                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-[0_0_8px_var(--accent-glow)]">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    {/* Day number */}
                    <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 shrink-0 pt-0.5">
                      {day.dayNumber}
                    </span>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Date + section badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {day.date}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${sectionStyle}`}
                        >
                          {day.section}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#CC0000]/20 text-[#CC0000] font-semibold">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Topic */}
                      <p className="text-xs text-foreground leading-snug line-clamp-2">
                        {day.topic}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
