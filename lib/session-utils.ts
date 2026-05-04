/**
 * Utility functions for study session timer formatting,
 * earnings calculation, and test countdown.
 */

const SCHOLARSHIP_HOURLY_RATE = 633;
const SECONDS_PER_HOUR = 3600;
const TEST_DATE = new Date("2026-06-13T00:00:00");

/**
 * Format elapsed seconds as MM:SS with zero-padding.
 * Minutes can exceed 59 (e.g., "120:05" for 7205 seconds).
 */
export function formatTime(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Calculate scholarship earnings for a given number of elapsed seconds.
 * Rate: $633/hour → seconds × (633 / 3600).
 */
export function calculateEarnings(elapsedSeconds: number): number {
  return elapsedSeconds * (SCHOLARSHIP_HOURLY_RATE / SECONDS_PER_HOUR);
}

/**
 * Format a dollar amount as "$X.XX" with two decimal places.
 */
export function formatDollars(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get the number of days remaining until the ACT test date (June 13, 2026).
 * Returns 0 if the given date is on or after the test date.
 */
export function getDaysUntilTest(fromDate?: Date): number {
  const from = fromDate ?? new Date();
  // Strip time components for a clean day-level comparison
  const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const testDay = new Date(
    TEST_DATE.getFullYear(),
    TEST_DATE.getMonth(),
    TEST_DATE.getDate()
  );

  const diffMs = testDay.getTime() - fromDay.getTime();
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the updated streak count based on the last session date.
 *
 * - Returns 1 when there is no prior session (lastSessionDate is null).
 * - Returns the existing streak when the last session was today (same calendar day).
 * - Returns existingStreak + 1 when the last session was exactly yesterday.
 * - Returns 1 when the gap is more than 1 calendar day (streak broken).
 */
export function calculateStreak(
  existingStreak: number,
  lastSessionDate: Date | null,
  today: Date,
): number {
  if (!lastSessionDate) return 1;

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastDate = new Date(
    lastSessionDate.getFullYear(),
    lastSessionDate.getMonth(),
    lastSessionDate.getDate(),
  );
  const diffDays = Math.round(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return existingStreak;
  if (diffDays === 1) return existingStreak + 1;
  return 1;
}
