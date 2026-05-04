"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { calculateStreak } from "@/lib/session-utils";
import { STUDY_PLAN } from "@/lib/study-plan";

export interface StudySessionRecord {
  id: number;
  dayNumber: number;
  section: string;
  topic: string;
  startTime: Date;
  endTime: Date | null;
  elapsedSeconds: number;
  notes: string | null;
}

export interface DayProgress {
  dayNumber: number;
  totalElapsedSeconds: number;
  sessionCount: number;
  isComplete: boolean;
  latestNotes: string | null;
  latestEndTime: Date | null;
}

export interface SessionSaveResult {
  ok: true;
  streak: number;
  dayComplete: boolean;
  totalElapsedSeconds: number;
  sessionCount: number;
}

export async function saveStudySession(data: {
  dayNumber: number;
  section: string;
  topic: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  notes?: string;
}): Promise<SessionSaveResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const { dayNumber, section, topic, elapsedSeconds, allocatedMinutes, notes } = data;

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 41) {
    throw new Error("Invalid day number");
  }

  await prisma.studySession.create({
    data: {
      dayNumber,
      section,
      topic,
      elapsedSeconds,
      notes: notes ?? null,
      endTime: new Date(),
      userId: session.user.id,
    },
  });

  // Aggregate total elapsed and session count for this day
  const [agg, countAgg] = await Promise.all([
    prisma.studySession.aggregate({
      where: { userId: session.user.id, dayNumber },
      _sum: { elapsedSeconds: true },
      _count: { id: true },
    }),
    Promise.resolve(null),
  ]);

  const totalElapsed = agg._sum.elapsedSeconds ?? 0;
  const sessionCount = agg._count.id;
  const dayComplete = allocatedMinutes > 0 && totalElapsed >= allocatedMinutes * 60;

  let newStreak: number;

  if (dayComplete) {
    // Calculate and upsert streak only when day is complete
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const existing = await prisma.studyStreak.findUnique({
      where: { userId: session.user.id },
    });

    newStreak = calculateStreak(
      existing?.currentStreak ?? 0,
      existing?.lastSessionDate ?? null,
      todayDate,
    );

    await prisma.studyStreak.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentStreak: newStreak,
        lastSessionDate: todayDate,
      },
      update: {
        currentStreak: newStreak,
        lastSessionDate: todayDate,
      },
    });
  } else {
    // Read existing streak without updating
    const existing = await prisma.studyStreak.findUnique({
      where: { userId: session.user.id },
      select: { currentStreak: true },
    });
    newStreak = existing?.currentStreak ?? 0;
  }

  return { ok: true, streak: newStreak, dayComplete, totalElapsedSeconds: totalElapsed, sessionCount };
}

export async function getDayProgress(dayNumber: number): Promise<DayProgress> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 41) {
    throw new Error("Invalid day number");
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId: session.user.id, dayNumber },
    select: {
      elapsedSeconds: true,
      notes: true,
      endTime: true,
      startTime: true,
    },
    orderBy: { startTime: "desc" },
  });

  if (sessions.length === 0) {
    return {
      dayNumber,
      totalElapsedSeconds: 0,
      sessionCount: 0,
      isComplete: false,
      latestNotes: null,
      latestEndTime: null,
    };
  }

  const totalElapsedSeconds = sessions.reduce((sum, s) => sum + s.elapsedSeconds, 0);
  const sessionCount = sessions.length;

  const planDay = STUDY_PLAN.find((d) => d.dayNumber === dayNumber);
  const allocatedSeconds = planDay ? planDay.timeMinutes * 60 : 0;
  const isComplete = allocatedSeconds > 0 && totalElapsedSeconds >= allocatedSeconds;

  // sessions[0] is the most recent (ordered by startTime desc)
  const latest = sessions[0];

  return {
    dayNumber,
    totalElapsedSeconds,
    sessionCount,
    isComplete,
    latestNotes: latest.notes,
    latestEndTime: latest.endTime,
  };
}

export async function getCompletedDays(): Promise<DayProgress[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const records = await prisma.studySession.findMany({
    where: { userId: session.user.id },
    select: {
      dayNumber: true,
      elapsedSeconds: true,
      notes: true,
      endTime: true,
      startTime: true,
    },
  });

  if (records.length === 0) return [];

  // Group by dayNumber in TypeScript
  const grouped = new Map<number, typeof records>();
  for (const record of records) {
    const group = grouped.get(record.dayNumber);
    if (group) {
      group.push(record);
    } else {
      grouped.set(record.dayNumber, [record]);
    }
  }

  const result: DayProgress[] = [];

  for (const [dayNumber, daySessions] of grouped) {
    const totalElapsedSeconds = daySessions.reduce((sum, s) => sum + s.elapsedSeconds, 0);
    const sessionCount = daySessions.length;

    // Find the row with the latest startTime
    const latest = daySessions.reduce((prev, curr) =>
      curr.startTime > prev.startTime ? curr : prev,
    );

    const planDay = STUDY_PLAN.find((d) => d.dayNumber === dayNumber);
    const allocatedSeconds = planDay ? planDay.timeMinutes * 60 : 0;
    const isComplete = allocatedSeconds > 0 && totalElapsedSeconds >= allocatedSeconds;

    result.push({
      dayNumber,
      totalElapsedSeconds,
      sessionCount,
      isComplete,
      latestNotes: latest.notes,
      latestEndTime: latest.endTime,
    });
  }

  return result;
}

export async function getStudySessions(): Promise<StudySessionRecord[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const records = await prisma.studySession.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      dayNumber: true,
      section: true,
      topic: true,
      startTime: true,
      endTime: true,
      elapsedSeconds: true,
      notes: true,
    },
  });

  return records;
}

export interface StudyStreakRecord {
  currentStreak: number;
  lastSessionDate: Date | null;
}

export async function getStudyStreak(): Promise<StudyStreakRecord> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { currentStreak: 0, lastSessionDate: null };

  const record = await prisma.studyStreak.findUnique({
    where: { userId: session.user.id },
    select: { currentStreak: true, lastSessionDate: true },
  });

  if (!record) return { currentStreak: 0, lastSessionDate: null };
  return record;
}
