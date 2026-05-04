"use client";

import type { OwlMilestone } from "@/lib/milestones";
import { getDaysUntilTest } from "@/lib/session-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, GraduationCap, Flame } from "lucide-react";

interface ScoreDashboardProps {
  completedDays: number;
  currentMilestone: OwlMilestone | undefined;
  nextMilestone: OwlMilestone | undefined;
  streakCount?: number;
}

const CURRENT_SCORES = { English: 19, Math: 18, Reading: 25, Composite: 21 };
const TARGET_SCORES = { English: 24, Math: 24, Reading: 27, Composite: 25 };

export default function ScoreDashboard({
  completedDays,
  currentMilestone,
  nextMilestone,
  streakCount = 0,
}: ScoreDashboardProps) {
  const daysUntilTest = getDaysUntilTest();

  // Progress toward next milestone (0–100)
  const prevThreshold = currentMilestone?.threshold ?? 0;
  const nextThreshold = nextMilestone?.threshold ?? 41;
  const milestoneProgress =
    nextThreshold > prevThreshold
      ? Math.min(
          100,
          Math.round(
            ((completedDays - prevThreshold) /
              (nextThreshold - prevThreshold)) *
              100
          )
        )
      : 100;

  return (
    <div className="space-y-4">
      {/* Scores */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(Object.keys(CURRENT_SCORES) as (keyof typeof CURRENT_SCORES)[]).map(
              (key) => (
                <div key={key}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {key.charAt(0)}
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {CURRENT_SCORES[key]}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    → {TARGET_SCORES[key]}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streakCount > 0 ? (
            <p className="text-lg font-bold tabular-nums">
              {streakCount} day{streakCount !== 1 ? "s" : ""} streak 🔥
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Start your streak!</p>
          )}
        </CardContent>
      </Card>

      {/* Scholarship goal + test date */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4" style={{ color: "#003366" }} />
            Scholarship Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Florida Medallion Scholars (FMS) Bright Futures —{" "}
            <span className="font-semibold text-foreground">
              ~$18,000–$20,000+
            </span>{" "}
            over 4 years
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Test date:{" "}
              <span className="font-semibold text-foreground">
                June 13, 2026
              </span>
              {daysUntilTest > 0 && (
                <span className="ml-1 text-[#CC0000] font-bold">
                  ({daysUntilTest} day{daysUntilTest !== 1 ? "s" : ""} left)
                </span>
              )}
              {daysUntilTest === 0 && (
                <span className="ml-1 text-[#CC0000] font-bold">
                  (Today!)
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Owl milestone progress */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span role="img" aria-hidden="true">
              {currentMilestone?.emoji ?? "🥚"}
            </span>
            {currentMilestone
              ? `${currentMilestone.name}`
              : "No milestone yet"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${milestoneProgress}%`,
                background: "linear-gradient(90deg, var(--fau-blue), var(--fau-red))",
              }}
              role="progressbar"
              aria-valuenow={completedDays}
              aria-valuemin={prevThreshold}
              aria-valuemax={nextThreshold}
              aria-label={`Progress toward ${nextMilestone?.name ?? "completion"}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {nextMilestone ? (
              <>
                Next: <span className="font-semibold text-foreground">{nextMilestone.name}</span>{" "}
                at {nextMilestone.threshold} days ({nextMilestone.threshold - completedDays} to go)
              </>
            ) : (
              <span className="font-semibold text-foreground">
                All milestones reached! 🦉🎓
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
