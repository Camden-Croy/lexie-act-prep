# Requirements: Cumulative Study Sessions

## Requirement 1: Multiple Sessions Per Day

### Description
The system must allow multiple study sessions per day per user, storing each as a separate database row instead of overwriting the previous session.

### Acceptance Criteria
- 1.1 Given a user saves a study session for day N, when they save another session for day N, then both sessions exist as separate rows in the database.
- 1.2 Given a user has saved K sessions for day N, when getDayProgress is called, then sessionCount equals K.
- 1.3 Given the StudySession model, when the schema is migrated, then the @@unique([dayNumber, userId]) constraint is removed and replaced with an @@index([dayNumber, userId]).
- 1.4 Given existing session data from the old schema, when the migration runs, then all existing rows are preserved without data loss.

### Correctness Properties
- **Session count conservation**: For any user and day, the number of StudySession rows equals the number of successful saveStudySession calls for that day.
- **Insert-only behavior**: saveStudySession always creates a new row; it never updates or deletes existing rows.

---

## Requirement 2: Cumulative Elapsed Time

### Description
Total elapsed time for a day must be the sum of elapsed seconds across all sessions for that day. The getDayProgress server action must return this aggregate.

### Acceptance Criteria
- 2.1 Given a user has sessions with elapsed times [1200, 2400] for day N, when getDayProgress is called, then totalElapsedSeconds equals 3600.
- 2.2 Given a user has no sessions for day N, when getDayProgress is called, then totalElapsedSeconds equals 0 and sessionCount equals 0.
- 2.3 Given a user saves a new session, when the save response is returned, then totalElapsedSeconds in the response equals the sum of all sessions for that day including the new one.

### Correctness Properties
- **Elapsed time conservation**: For any day and user, totalElapsedSeconds returned by getDayProgress equals SUM(elapsedSeconds) across all StudySession rows for that day and user.
- **Monotonic accumulation**: totalElapsedSeconds for a day never decreases after a new session is saved.

---

## Requirement 3: Timer Counts Down From Remaining Time

### Description
The SessionTimer must start counting down from the remaining time (allocated time minus previously completed time), not from the full allocated time.

### Acceptance Criteria
- 3.1 Given day N has allocatedMinutes=60 and previousElapsedSeconds=1200, when the timer is initialized, then it displays 40:00 remaining.
- 3.2 Given day N has allocatedMinutes=60 and previousElapsedSeconds=3600, when the timer is initialized, then it displays 00:00 and enters overtime mode.
- 3.3 Given day N has allocatedMinutes=60 and previousElapsedSeconds=0, when the timer is initialized, then it displays 60:00 remaining (same as current behavior for first session).
- 3.4 Given the timer is in overtime mode, when the user continues studying, then the timer counts up showing overtime duration with a "+" prefix.
- 3.5 Given day N has allocatedMinutes=0 (rest day), when the timer is initialized, then it immediately shows overtime mode.

### Correctness Properties
- **Timer continuity**: remainingTime = max(0, allocatedMinutes × 60 − previousElapsedSeconds − currentElapsedSeconds). The timer never resets to full allocated time when prior sessions exist.
- **Non-negative display**: The displayed time value is always ≥ 0; negative remaining is shown as positive overtime.

---

## Requirement 4: Money Accumulates Across Sessions

### Description
The MoneyAccumulator must display total daily earnings including both previous sessions and the current session, not just the current session's earnings.

### Acceptance Criteria
- 4.1 Given previousElapsedSeconds=1200 and currentElapsedSeconds=0, when the session starts, then earnings display shows $211.00 (1200 × 633/3600).
- 4.2 Given previousElapsedSeconds=1200 and currentElapsedSeconds=600, when the timer is running, then earnings display shows $316.50 (1800 × 633/3600).
- 4.3 Given previousElapsedSeconds=0 and currentElapsedSeconds=600, when the timer is running, then earnings display shows $105.50 (600 × 633/3600), matching current behavior for first session.

### Correctness Properties
- **Cumulative earnings**: Displayed earnings always equal (previousElapsedSeconds + currentElapsedSeconds) × (633 / 3600).
- **Earnings consistency**: The earnings shown at session completion match the totalElapsedSeconds in the save response multiplied by the hourly rate.

---

## Requirement 5: Streak Gated by Full Allocated Time Completion

### Description
The study streak must only increment when the total elapsed time for a day meets or exceeds the allocated time. Partial sessions that don't reach the threshold must not affect the streak.

### Acceptance Criteria
- 5.1 Given day N has allocatedMinutes=60 and totalElapsedSeconds=1200 after saving, when the save completes, then the streak count is unchanged.
- 5.2 Given day N has allocatedMinutes=60 and totalElapsedSeconds=3600 after saving (crossing the threshold), when the save completes, then the streak is updated according to calculateStreak logic.
- 5.3 Given day N is already complete (totalElapsed >= allocated), when another session is saved for day N, then the streak count does not change.
- 5.4 Given day N has allocatedMinutes=0 (rest day), when a session is saved, then the streak count does not change regardless of elapsed time.
- 5.5 Given the user completes day N today and completed day N-1 yesterday, when the streak updates, then the streak increments by 1.
- 5.6 Given the user completes day N today but last completed a day 3 days ago, when the streak updates, then the streak resets to 1.

### Correctness Properties
- **Streak gating**: The streak only changes on a saveStudySession call that causes totalElapsedSeconds to cross from below to at-or-above allocatedMinutes × 60.
- **Idempotent completion**: Multiple saves to an already-complete day return the same streak count without incrementing.
- **Rest day exclusion**: Days with allocatedMinutes=0 never trigger streak updates.

---

## Requirement 6: Day Completion Status

### Description
A day must be marked as "complete" in the UI (day selector, score dashboard) only when the cumulative elapsed time meets or exceeds the allocated time for that day.

### Acceptance Criteria
- 6.1 Given day N has allocatedMinutes=60 and totalElapsedSeconds=1200, when the day selector renders, then day N is shown as in-progress (not complete).
- 6.2 Given day N has allocatedMinutes=60 and totalElapsedSeconds=3600, when the day selector renders, then day N is shown as complete.
- 6.3 Given day N has allocatedMinutes=0 (rest day), when the day selector renders, then day N is not shown as complete regardless of sessions.
- 6.4 Given the user completes a session that makes day N complete, when returning to the day selector, then the completed day count increments by 1 and milestone progress updates.

### Correctness Properties
- **Completion threshold**: isComplete is true if and only if totalElapsedSeconds ≥ allocatedMinutes × 60 AND allocatedMinutes > 0.

---

## Requirement 7: Previous Session Summary

### Description
When a user opens a day that has prior sessions, the StudySessionView must show a summary of previous progress before starting a new session.

### Acceptance Criteria
- 7.1 Given day N has 2 prior sessions totaling 1200 seconds, when the user opens day N, then a summary card shows "20:00 completed across 2 sessions".
- 7.2 Given day N has 1 prior session with notes, when the user opens day N, then the summary shows the notes from the most recent session.
- 7.3 Given day N has no prior sessions, when the user opens day N, then no previous session summary is shown.
- 7.4 Given day N is already complete, when the user opens day N, then the summary indicates the day is complete and any new session will be overtime.

### Correctness Properties
- **Summary accuracy**: The previous session summary displays totalElapsedSeconds and sessionCount matching the values from getDayProgress.
