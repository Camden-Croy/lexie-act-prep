"use client";

import { useState, useMemo } from "react";
import type { StudyPlanDay } from "@/lib/study-plan";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface SectionNavProps {
  studyPlan: readonly StudyPlanDay[];
  completedDays: Set<number>;
  selectedDayNumber: number | null;
  onSelectDay: (day: StudyPlanDay) => void;
}

const SECTION_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  English: { bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  Math: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  Reading: { bg: "bg-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  All: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  Setup: { bg: "bg-gray-500/20", text: "text-gray-400", dot: "bg-gray-400" },
  Rest: { bg: "bg-pink-500/20", text: "text-pink-400", dot: "bg-pink-400" },
};

function getTodayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SectionNav({
  studyPlan,
  completedDays,
  selectedDayNumber,
  onSelectDay,
}: SectionNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayIso = getTodayIso();

  // Group by phase
  const phases = useMemo(() => {
    const map = new Map<number, { phaseName: string; days: StudyPlanDay[] }>();
    for (const day of studyPlan) {
      if (!map.has(day.phase)) {
        map.set(day.phase, { phaseName: day.phaseName, days: [] });
      }
      map.get(day.phase)!.days.push(day);
    }
    return Array.from(map.entries());
  }, [studyPlan]);

  // Summary counts by section
  const sectionSummary = useMemo(() => {
    const sections = ["English", "Math", "Reading", "All", "Setup", "Rest"] as const;
    return sections.map((section) => {
      const days = studyPlan.filter((d) => d.section === section);
      const completed = days.filter((d) => completedDays.has(d.dayNumber)).length;
      return { section, total: days.length, completed };
    }).filter((s) => s.total > 0);
  }, [studyPlan, completedDays]);

  return (
    <>
      {/* Floating toggle button — fixed to right edge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 rounded-l-lg bg-card border border-r-0 border-border/60 px-1.5 py-3 shadow-lg hover:bg-accent/50 transition-colors"
        aria-label={isExpanded ? "Close section navigator" : "Open section navigator"}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
        {!isExpanded && (
          <span className="text-[10px] font-medium text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            Sections
          </span>
        )}
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 h-full z-30 transition-transform duration-200 ease-out ${
          isExpanded ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full w-64 bg-card border-l border-border/60 shadow-2xl overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Study Plan
              </h3>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {completedDays.size}/41
              </span>
            </div>

            {/* Section summary pills */}
            <div className="flex flex-wrap gap-1.5">
              {sectionSummary.map(({ section, total, completed }) => {
                const colors = SECTION_COLORS[section] ?? SECTION_COLORS.Setup;
                return (
                  <span
                    key={section}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}
                  >
                    {section} {completed}/{total}
                  </span>
                );
              })}
            </div>

            {/* Day list by phase */}
            {phases.map(([phase, { phaseName, days }]) => (
              <div key={phase}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  P{phase}: {phaseName}
                </p>
                <div className="space-y-0.5">
                  {days.map((day) => {
                    const isCompleted = completedDays.has(day.dayNumber);
                    const isSelected = day.dayNumber === selectedDayNumber;
                    const isToday = day.isoDate === todayIso;
                    const colors = SECTION_COLORS[day.section] ?? SECTION_COLORS.Setup;

                    return (
                      <button
                        key={day.dayNumber}
                        onClick={() => {
                          onSelectDay(day);
                          setIsExpanded(false);
                        }}
                        className={`w-full flex items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-accent/50 ${
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : ""
                        } ${isToday && !isSelected ? "bg-[#CC0000]/5" : ""}`}
                        aria-label={`Day ${day.dayNumber}: ${day.section} — ${day.topic}${isCompleted ? " (completed)" : ""}${isToday ? " (today)" : ""}`}
                      >
                        {/* Completion indicator */}
                        {isCompleted ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shrink-0">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                        )}

                        {/* Day number */}
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums w-4 shrink-0">
                          {day.dayNumber}
                        </span>

                        {/* Section + date */}
                        <span className={`text-[10px] font-medium ${colors.text} shrink-0`}>
                          {day.section}
                        </span>

                        <span className="text-[10px] text-muted-foreground truncate flex-1">
                          {day.date}
                        </span>

                        {isToday && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-[#CC0000]/20 text-[#CC0000] font-semibold shrink-0">
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-20 bg-black/30"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
