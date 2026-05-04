"use client";

import { calculateEarnings, formatDollars } from "@/lib/session-utils";
import { DollarSign } from "lucide-react";

interface MoneyAccumulatorProps {
  elapsedSeconds: number;
  isRunning: boolean;
  previousElapsedSeconds: number;
}

export default function MoneyAccumulator({
  elapsedSeconds,
  isRunning,
  previousElapsedSeconds,
}: MoneyAccumulatorProps) {
  const earned = calculateEarnings(previousElapsedSeconds + elapsedSeconds);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <DollarSign className="w-5 h-5 text-[#CC0000]" />
        <span
          className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#CC0000] transition-opacity ${
            isRunning ? "animate-pulse" : ""
          }`}
          aria-live="polite"
          aria-label={`Scholarship earnings: ${formatDollars(earned)}`}
        >
          {formatDollars(earned)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        earning at <span className="font-semibold text-foreground">$633/hr</span>
      </p>
    </div>
  );
}
