"use client";

import { formatTime } from "@/lib/session-utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface SessionTimerProps {
  allocatedMinutes: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  elapsedSeconds: number;
  previousElapsedSeconds: number;
}

export default function SessionTimer({
  allocatedMinutes,
  isRunning,
  onStart,
  onPause,
  onResume,
  elapsedSeconds,
  previousElapsedSeconds,
}: SessionTimerProps) {
  const allocatedSeconds = allocatedMinutes * 60;
  const remaining = allocatedSeconds - previousElapsedSeconds - elapsedSeconds;
  const isOvertime = remaining <= 0;
  const hasStarted = elapsedSeconds > 0 || isRunning;

  // During countdown: show remaining time. During overtime: show how far past zero.
  const displaySeconds = isOvertime ? Math.abs(remaining) : remaining;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Overtime label */}
      {isOvertime && (
        <span className="text-xs font-semibold uppercase tracking-wider text-[#CC0000]">
          Overtime!
        </span>
      )}

      {/* Timer display */}
      <div
        className={`font-mono text-4xl sm:text-5xl font-bold tabular-nums tracking-tight transition-colors ${
          isOvertime
            ? "text-[#CC0000]"
            : "text-foreground"
        }`}
        role="timer"
        aria-live="polite"
        aria-label={
          isOvertime
            ? `Overtime: ${formatTime(displaySeconds)}`
            : `Time remaining: ${formatTime(displaySeconds)}`
        }
      >
        {isOvertime && "+"}
        {formatTime(displaySeconds)}
      </div>

      {/* Allocated time context */}
      <p className="text-xs text-muted-foreground">
        {allocatedMinutes} min allocated
      </p>
      {previousElapsedSeconds > 0 && (
        <p className="text-xs text-muted-foreground">
          {Math.floor(previousElapsedSeconds / 60)} min already completed today
        </p>
      )}

      {/* Start / Pause / Resume button */}
      {!hasStarted ? (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 min-w-[140px]"
          aria-label="Start timer"
        >
          <Play className="w-4 h-4" />
          Start
        </Button>
      ) : isRunning ? (
        <Button
          onClick={onPause}
          size="lg"
          variant="secondary"
          className="gap-2 min-w-[140px]"
          aria-label="Pause timer"
        >
          <Pause className="w-4 h-4" />
          Pause
        </Button>
      ) : (
        <Button
          onClick={onResume}
          size="lg"
          variant="outline"
          className="gap-2 min-w-[140px]"
          aria-label="Resume timer"
        >
          <RotateCcw className="w-4 h-4" />
          Resume
        </Button>
      )}
    </div>
  );
}
