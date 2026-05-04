"use client";

import { useEffect } from "react";
import type { OwlMilestone } from "@/lib/milestones";

interface MilestoneOverlayProps {
  milestone: OwlMilestone;
  onDismiss: () => void;
}

export default function MilestoneOverlay({
  milestone,
  onDismiss,
}: MilestoneOverlayProps) {
  const isFullOwl = milestone.threshold === 41;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          onDismiss();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Milestone reached: ${milestone.name}`}
      tabIndex={0}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: isFullOwl
            ? "linear-gradient(135deg, #003366 0%, #CC0000 50%, #003366 100%)"
            : "linear-gradient(135deg, #003366 0%, #CC0000 100%)",
          opacity: 0.95,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center max-w-sm animate-in fade-in zoom-in duration-500">
        {/* Emoji */}
        <span
          className={`${
            isFullOwl ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl"
          }`}
          role="img"
          aria-hidden="true"
        >
          {milestone.emoji}
        </span>

        {/* Milestone name */}
        <h2
          className={`font-bold tracking-tight text-white ${
            isFullOwl ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {milestone.name}
        </h2>

        {/* Title */}
        <p className="text-lg sm:text-xl font-medium text-white/90">
          {milestone.title}
        </p>

        {/* Message */}
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">
          {milestone.message}
        </p>

        {/* Full Owl extra celebration */}
        {isFullOwl && (
          <p className="text-xs text-white/60 mt-2">
            🎓 Florida Medallion Scholars — here you come
          </p>
        )}

        {/* Dismiss hint */}
        <p className="text-xs text-white/40 mt-4">
          tap anywhere to dismiss
        </p>
      </div>
    </div>
  );
}
