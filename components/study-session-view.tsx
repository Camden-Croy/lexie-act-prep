"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { StudyPlanDay } from "@/lib/study-plan";
import type { DayProgress, SessionSaveResult } from "@/app/actions";
import { getStrategyForSection } from "@/lib/section-strategies";
import { checkMilestoneCrossed } from "@/lib/milestones";
import { formatTime } from "@/lib/session-utils";
import { saveStudySession } from "@/app/actions";
import SessionTimer from "@/components/session-timer";
import MoneyAccumulator from "@/components/money-accumulator";
import StrategyPanel from "@/components/strategy-panel";
import MilestoneOverlay from "@/components/milestone-overlay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Clock, StickyNote, Loader2, ExternalLink } from "lucide-react";
import type { OwlMilestone } from "@/lib/milestones";

interface StudySessionViewProps {
  day: StudyPlanDay;
  dayProgress: DayProgress | null;
  onComplete: (result: SessionSaveResult) => void;
  onBack: () => void;
  /** Number of completed days before this session, used for milestone detection */
  completedDayCount: number;
}

type TimerState = "stopped" | "running" | "paused";

export default function StudySessionView({
  day,
  dayProgress,
  onComplete,
  onBack,
  completedDayCount,
}: StudySessionViewProps) {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState(dayProgress?.latestNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saveResult, setSaveResult] = useState<SessionSaveResult | null>(null);
  const [crossedMilestone, setCrossedMilestone] = useState<OwlMilestone | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Wall-clock anchor: when the current running segment started
  const runningStartRef = useRef<number | null>(null);
  // Accumulated seconds from previous running segments (before pauses)
  const accumulatedRef = useRef(0);

  const strategy = getStrategyForSection(day.section);

  // Timer interval management — uses wall-clock time so background tabs stay accurate
  useEffect(() => {
    if (timerState === "running") {
      runningStartRef.current = Date.now();

      const tick = () => {
        const segmentMs = Date.now() - (runningStartRef.current ?? Date.now());
        setElapsedSeconds(accumulatedRef.current + Math.floor(segmentMs / 1000));
      };

      intervalRef.current = setInterval(tick, 1000);

      // When the tab regains visibility, immediately recalculate elapsed time
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          tick();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }

    // When pausing, snapshot the accumulated time
    if (timerState === "paused" && runningStartRef.current !== null) {
      const segmentMs = Date.now() - runningStartRef.current;
      accumulatedRef.current += Math.floor(segmentMs / 1000);
      runningStartRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  const handleStart = useCallback(() => {
    setTimerState("running");
    setShowConfirmation(false);
    setSaveError(null);
  }, []);

  const handlePause = useCallback(() => {
    setTimerState("paused");
  }, []);

  const handleResume = useCallback(() => {
    setTimerState("running");
  }, []);

  const handleComplete = useCallback(async () => {
    // Pause the timer while saving
    setTimerState("paused");
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveStudySession({
        dayNumber: day.dayNumber,
        section: day.section,
        topic: day.topic,
        elapsedSeconds,
        allocatedMinutes: day.timeMinutes,
        notes: notes.trim() || undefined,
      });

      setTimerState("stopped");
      setSaveResult(result);
      setShowConfirmation(true);

      // Check for milestone crossing only when the day just became complete
      // and it wasn't already complete before this session
      const wasAlreadyComplete = dayProgress?.isComplete ?? false;
      if (result.dayComplete && !wasAlreadyComplete) {
        const milestone = checkMilestoneCrossed(
          completedDayCount,
          completedDayCount + 1,
        );
        if (milestone) {
          setCrossedMilestone(milestone);
        }
      }

      onComplete(result);
    } catch (err) {
      // Restore running state so no data is lost
      setTimerState("paused");
      setSaveError(
        err instanceof Error ? err.message : "Save failed — try again",
      );
    } finally {
      setIsSaving(false);
    }
  }, [day, elapsedSeconds, notes, dayProgress, completedDayCount, onComplete]);

  const handleDismissMilestone = useCallback(() => {
    setCrossedMilestone(null);
  }, []);

  const isRunning = timerState === "running";
  const hasStarted = timerState !== "stopped" || elapsedSeconds > 0;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back to day selector"
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            Day {day.dayNumber} — {day.section}
          </h2>
          <p className="text-xs text-muted-foreground truncate">{day.topic}</p>
        </div>
      </div>

      {/* Today's Progress summary card */}
      {dayProgress !== null && !hasStarted && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Today&apos;s Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Total time completed:{" "}
              <span className="font-semibold text-foreground">
                {formatTime(dayProgress.totalElapsedSeconds)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Sessions:{" "}
              <span className="font-semibold text-foreground">
                {dayProgress.sessionCount}
              </span>
            </p>
            {dayProgress.latestNotes && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <StickyNote className="w-3 h-3" />
                  Notes:
                </p>
                <p className="text-xs text-foreground bg-muted/50 rounded-md p-2 whitespace-pre-wrap">
                  {dayProgress.latestNotes}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Start a new session to continue where you left off.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation message + post-session summary */}
      {showConfirmation && saveResult && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-500 font-medium">
              {saveResult.dayComplete
                ? `Session saved! Day ${day.dayNumber} is complete.`
                : "Session saved! Keep going to complete the day."}
            </p>
          </div>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                This session:{" "}
                <span className="font-semibold text-foreground">
                  {formatTime(elapsedSeconds)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Total today:{" "}
                <span className="font-semibold text-foreground">
                  {formatTime(saveResult.totalElapsedSeconds)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Sessions today:{" "}
                <span className="font-semibold text-foreground">
                  {saveResult.sessionCount}
                </span>
              </p>
              {saveResult.dayComplete && (
                <p className="text-xs font-medium text-blue-500">
                  ✓ Day complete — {day.timeMinutes} min goal reached
                </p>
              )}
              {!saveResult.dayComplete && (
                <p className="text-xs text-muted-foreground">
                  {formatTime(day.timeMinutes * 60 - saveResult.totalElapsedSeconds)} remaining to complete the day
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Day complete banner */}
      {dayProgress?.isComplete && !hasStarted && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-500 font-medium">
            Day {day.dayNumber} is complete! Any additional time is overtime.
          </p>
        </div>
      )}

      {/* Timer + Money section */}
      <Card size="sm">
        <CardContent className="py-6 space-y-4">
          <SessionTimer
            allocatedMinutes={day.timeMinutes}
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            elapsedSeconds={elapsedSeconds}
            previousElapsedSeconds={dayProgress?.totalElapsedSeconds ?? 0}
          />
          <MoneyAccumulator
            elapsedSeconds={elapsedSeconds}
            isRunning={isRunning}
            previousElapsedSeconds={dayProgress?.totalElapsedSeconds ?? 0}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="session-notes"
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
          Session Notes
        </label>
        <Textarea
          id="session-notes"
          placeholder="What did you learn? Any tricky concepts?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-20 text-sm"
        />
      </div>

      {/* Save error */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive font-medium">{saveError}</p>
        </div>
      )}

      {/* Complete button */}
      {hasStarted && !showConfirmation && (
        <Button
          onClick={handleComplete}
          disabled={isSaving || elapsedSeconds === 0}
          size="lg"
          className="w-full gap-2"
          aria-label="Complete study session"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Complete Session
            </>
          )}
        </Button>
      )}

      {/* Strategy panel */}
      {strategy && (
        <StrategyPanel day={day} strategy={strategy} />
      )}

      {/* Day links fallback — shown when no strategy panel exists (Setup, Rest, All days) */}
      {!strategy && day.links && day.links.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-primary" />
              Today&apos;s Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {day.links.map((link, i) => (
                <li key={i} className="text-xs">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Milestone overlay */}
      {crossedMilestone && (
        <MilestoneOverlay
          milestone={crossedMilestone}
          onDismiss={handleDismissMilestone}
        />
      )}
    </div>
  );
}
