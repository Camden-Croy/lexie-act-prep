"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { STUDY_PLAN } from "@/lib/study-plan";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (!isAdminEmail(session.user.email)) throw new Error("Forbidden");
  return session;
}

export interface AdminStudySession {
  id: number;
  dayNumber: number;
  section: string;
  topic: string;
  startTime: string;
  endTime: string | null;
  elapsedSeconds: number;
  notes: string | null;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface AdminDaySummary {
  dayNumber: number;
  section: string;
  topic: string;
  timeMinutes: number;
  totalElapsedSeconds: number;
  sessionCount: number;
  isComplete: boolean;
}

/**
 * Get all study sessions for all users (admin only).
 */
export async function adminGetAllSessions(): Promise<AdminStudySession[]> {
  await requireAdmin();

  const sessions = await prisma.studySession.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
  });

  return sessions.map((s) => ({
    id: s.id,
    dayNumber: s.dayNumber,
    section: s.section,
    topic: s.topic,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime?.toISOString() ?? null,
    elapsedSeconds: s.elapsedSeconds,
    notes: s.notes,
    userId: s.userId,
    userName: s.user.name,
    userEmail: s.user.email,
  }));
}

/**
 * Get day-level summaries for a specific user.
 */
export async function adminGetDaySummaries(userId?: string): Promise<AdminDaySummary[]> {
  await requireAdmin();

  const where = userId ? { userId } : {};

  const sessions = await prisma.studySession.findMany({
    where,
    select: { dayNumber: true, elapsedSeconds: true },
  });

  const grouped = new Map<number, { total: number; count: number }>();
  for (const s of sessions) {
    const entry = grouped.get(s.dayNumber);
    if (entry) {
      entry.total += s.elapsedSeconds;
      entry.count += 1;
    } else {
      grouped.set(s.dayNumber, { total: s.elapsedSeconds, count: 1 });
    }
  }

  return STUDY_PLAN.map((day) => {
    const entry = grouped.get(day.dayNumber);
    const totalElapsedSeconds = entry?.total ?? 0;
    const sessionCount = entry?.count ?? 0;
    const isComplete =
      day.timeMinutes > 0 && totalElapsedSeconds >= day.timeMinutes * 60;

    return {
      dayNumber: day.dayNumber,
      section: day.section,
      topic: day.topic,
      timeMinutes: day.timeMinutes,
      totalElapsedSeconds,
      sessionCount,
      isComplete,
    };
  });
}

/**
 * Update a study session's startTime, endTime, and elapsedSeconds (admin only).
 */
export async function adminUpdateSession(data: {
  sessionId: number;
  startTime?: string;
  endTime?: string | null;
  elapsedSeconds?: number;
}): Promise<{ ok: true }> {
  await requireAdmin();

  const { sessionId, startTime, endTime, elapsedSeconds } = data;

  const updateData: Record<string, unknown> = {};
  if (startTime !== undefined) updateData.startTime = new Date(startTime);
  if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
  if (elapsedSeconds !== undefined) updateData.elapsedSeconds = elapsedSeconds;

  await prisma.studySession.update({
    where: { id: sessionId },
    data: updateData,
  });

  return { ok: true };
}

/**
 * Mark a day as complete by creating/updating a session to meet the time threshold.
 */
export async function adminMarkDayComplete(data: {
  dayNumber: number;
  userId: string;
}): Promise<{ ok: true }> {
  await requireAdmin();

  const { dayNumber, userId } = data;
  const planDay = STUDY_PLAN.find((d) => d.dayNumber === dayNumber);
  if (!planDay) throw new Error("Invalid day number");

  const requiredSeconds = planDay.timeMinutes * 60;

  // Check existing total
  const agg = await prisma.studySession.aggregate({
    where: { userId, dayNumber },
    _sum: { elapsedSeconds: true },
  });

  const currentTotal = agg._sum.elapsedSeconds ?? 0;

  if (currentTotal >= requiredSeconds) {
    return { ok: true }; // Already complete
  }

  const remaining = requiredSeconds - currentTotal;

  // Create a session to fill the gap
  await prisma.studySession.create({
    data: {
      dayNumber,
      section: planDay.section,
      topic: planDay.topic,
      elapsedSeconds: remaining,
      startTime: new Date(),
      endTime: new Date(),
      notes: "[Admin] Manually marked complete",
      userId,
    },
  });

  return { ok: true };
}

/**
 * Delete a study session (admin only).
 */
export async function adminDeleteSession(sessionId: number): Promise<{ ok: true }> {
  await requireAdmin();

  await prisma.studySession.delete({ where: { id: sessionId } });

  return { ok: true };
}

/**
 * Get all users (for admin user selection).
 */
export async function adminGetUsers(): Promise<
  { id: string; name: string; email: string }[]
> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return users;
}
