"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Shield } from "lucide-react";
import { isAdminEmail } from "@/lib/admin";
import { STUDY_PLAN, type StudyPlanDay } from "@/lib/study-plan";
import { getCurrentMilestone, getNextMilestone, checkMilestoneCrossed } from "@/lib/milestones";
import { getCompletedDays, getDayProgress, getStudyStreak, type DayProgress, type SessionSaveResult } from "@/app/actions";
import DaySelector from "@/components/day-selector";
import ScoreDashboard from "@/components/score-dashboard";
import StudySessionView from "@/components/study-session-view";
import SectionNav from "@/components/section-nav";
import MilestoneOverlay from "@/components/milestone-overlay";
import type { OwlMilestone } from "@/lib/milestones";

type AppView = "selector" | "session";

function getTodayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [view, setView] = useState<AppView>("selector");
  const [selectedDay, setSelectedDay] = useState<StudyPlanDay | null>(null);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Map<number, DayProgress>>(new Map());
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [milestoneToShow, setMilestoneToShow] = useState<OwlMilestone | null>(null);
  const [streakCount, setStreakCount] = useState(0);

  // Find today's day in the study plan
  const todayDay = useMemo(() => {
    const todayIso = getTodayIso();
    return STUDY_PLAN.find((d) => d.isoDate === todayIso) ?? null;
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // Fetch completed sessions on mount, restore saved day or auto-navigate to today
  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;
    async function fetchData() {
      try {
        const [dayProgressList, streak] = await Promise.all([
          getCompletedDays(),
          getStudyStreak(),
        ]);
        if (cancelled) return;
        const sessionMap = new Map<number, DayProgress>();
        for (const dp of dayProgressList) {
          sessionMap.set(dp.dayNumber, dp);
        }
        setCompletedSessions(sessionMap);
        setStreakCount(streak.currentStreak);

        // Restore from localStorage first, then fall back to today's day
        const savedDayStr = localStorage.getItem("lexie-selected-day");
        if (savedDayStr) {
          const dayNum = parseInt(savedDayStr, 10);
          const restoredDay = STUDY_PLAN.find((d) => d.dayNumber === dayNum);
          if (restoredDay) {
            setSelectedDay(restoredDay);
            setView("session");
          }
        } else if (todayDay) {
          setSelectedDay(todayDay);
          setView("session");
          localStorage.setItem("lexie-selected-day", String(todayDay.dayNumber));
        }
      } catch {
        // Graceful degradation — show empty state
      } finally {
        if (!cancelled) {
          setIsLoadingSessions(false);
          setHasRestoredState(true);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [session?.user, todayDay]);

  const completedDayNumbers = new Set(
    [...completedSessions.entries()]
      .filter(([, dp]) => dp.isComplete)
      .map(([dayNumber]) => dayNumber)
  );
  const completedCount = completedDayNumbers.size;
  const currentMilestone = getCurrentMilestone(completedCount);
  const nextMilestone = getNextMilestone(completedCount);

  const handleSelectDay = useCallback((day: StudyPlanDay) => {
    setSelectedDay(day);
    setView("session");
    localStorage.setItem("lexie-selected-day", String(day.dayNumber));
  }, []);

  const handleSessionComplete = useCallback(async (result: SessionSaveResult) => {
    const previousCount = completedDayNumbers.size;

    // Check for milestone crossing (only if this is a new completion)
    const wasAlreadyCompleted = completedSessions.get(selectedDay?.dayNumber ?? -1)?.isComplete;
    if (result.dayComplete && !wasAlreadyCompleted) {
      const newCount = previousCount + 1;
      const crossed = checkMilestoneCrossed(previousCount, newCount);
      if (crossed) {
        setMilestoneToShow(crossed);
      }
    }

    // Update completedSessions map with the new DayProgress
    const updatedProgress: DayProgress = {
      dayNumber: selectedDay!.dayNumber,
      totalElapsedSeconds: result.totalElapsedSeconds,
      sessionCount: result.sessionCount,
      isComplete: result.dayComplete,
      latestNotes: null,
      latestEndTime: new Date(),
    };
    setCompletedSessions((prev) => {
      const next = new Map(prev);
      next.set(selectedDay!.dayNumber, updatedProgress);
      return next;
    });

    // Update streak from server response
    if (result.streak !== undefined) {
      setStreakCount(result.streak);
    }

    // Fetch fresh day progress from the server so the view updates without a page refresh
    try {
      const fresh = await getDayProgress(selectedDay!.dayNumber);
      setCompletedSessions((prev) => {
        const next = new Map(prev);
        next.set(fresh.dayNumber, fresh);
        return next;
      });
    } catch {
      // Optimistic update above is sufficient
    }
  }, [completedSessions, completedDayNumbers, selectedDay]);

  const handleBackToSelector = useCallback(() => {
    setView("selector");
    setSelectedDay(null);
    localStorage.removeItem("lexie-selected-day");
  }, []);

  const handleDismissMilestone = useCallback(() => {
    setMilestoneToShow(null);
  }, []);

  // Loading state — show until auth is resolved AND state is restored
  if (isPending || (!hasRestoredState && session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  // Not authenticated — will redirect
  if (!session?.user) return null;

  return (
    <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Lexie&apos;s ACT Prep
            </h1>
            <p className="text-xs text-muted-foreground">{session.user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminEmail(session.user.email) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              aria-label="Admin"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut().then(() => router.push("/sign-in"))}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Sign out
          </Button>
        </div>
      </header>

      {view === "selector" && (
        <div className="space-y-6">
          <ScoreDashboard
            completedDays={completedCount}
            currentMilestone={currentMilestone}
            nextMilestone={nextMilestone}
            streakCount={streakCount}
          />
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Loading study plan…
            </div>
          ) : (
            <DaySelector
              studyPlan={STUDY_PLAN}
              completedDays={completedDayNumbers}
              onSelectDay={handleSelectDay}
            />
          )}
        </div>
      )}

      {view === "session" && selectedDay && (
        <StudySessionView
          day={selectedDay}
          dayProgress={completedSessions.get(selectedDay.dayNumber) ?? null}
          onComplete={handleSessionComplete}
          onBack={handleBackToSelector}
          completedDayCount={completedCount}
        />
      )}

      {/* Floating section nav */}
      <SectionNav
        studyPlan={STUDY_PLAN}
        completedDays={completedDayNumbers}
        selectedDayNumber={selectedDay?.dayNumber ?? null}
        onSelectDay={handleSelectDay}
      />

      {/* Milestone overlay triggered from selector view on return */}
      {milestoneToShow && (
        <MilestoneOverlay
          milestone={milestoneToShow}
          onDismiss={handleDismissMilestone}
        />
      )}
    </main>
  );
}
