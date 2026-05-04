# Tasks: Cumulative Study Sessions

## Task 1: Database Schema Migration
> **Requirements**: 1.1, 1.3, 1.4

- [x] 1.1 Remove the `@@unique([dayNumber, userId])` constraint from the `StudySession` model in `prisma/schema.prisma`
- [x] 1.2 Add `@@index([dayNumber, userId])` to the `StudySession` model for efficient aggregate queries
- [x] 1.3 Generate and run the Prisma migration (`npx prisma migrate dev --name remove-session-unique-add-index`)
- [x] 1.4 Verify the migration preserves existing data and allows multiple rows per day+user

## Task 2: Add DayProgress and SessionSaveResult Types
> **Requirements**: 2.1, 2.2, 2.3, 5.1, 6.1

- [x] 2.1 Add `DayProgress` interface to `app/actions.ts` with fields: `dayNumber`, `totalElapsedSeconds`, `sessionCount`, `isComplete`, `latestNotes`, `latestEndTime`
- [x] 2.2 Add `SessionSaveResult` interface to `app/actions.ts` with fields: `ok`, `streak`, `dayComplete`, `totalElapsedSeconds`, `sessionCount`

## Task 3: Implement getDayProgress Server Action
> **Requirements**: 2.1, 2.2, 2.3, 6.1, 7.1

- [x] 3.1 Create `getDayProgress(dayNumber: number)` server action in `app/actions.ts` that aggregates all sessions for a given day and user
- [x] 3.2 Query all sessions for the day, sum `elapsedSeconds`, count rows, and determine `isComplete` by comparing total against allocated time from `STUDY_PLAN`
- [x] 3.3 Return `latestNotes` and `latestEndTime` from the most recent session (ordered by `startTime` desc)

## Task 4: Implement getCompletedDays Server Action
> **Requirements**: 6.1, 6.2, 6.3, 6.4

- [x] 4.1 Create `getCompletedDays()` server action in `app/actions.ts` that returns a `DayProgress[]` for all days with at least one session
- [x] 4.2 Fetch all sessions for the user, group by `dayNumber`, and compute aggregate `DayProgress` for each day
- [x] 4.3 Determine `isComplete` for each day by comparing total elapsed against the allocated time from `STUDY_PLAN`

## Task 5: Revise saveStudySession Server Action
> **Requirements**: 1.1, 1.2, 2.3, 5.1, 5.2, 5.3, 5.4

- [x] 5.1 Change `saveStudySession` from `prisma.studySession.upsert` to `prisma.studySession.create` so each save inserts a new row
- [x] 5.2 Add `allocatedMinutes` to the input parameters for server-side completion checking
- [x] 5.3 After inserting, aggregate total elapsed for the day using `prisma.studySession.aggregate`
- [x] 5.4 Update streak logic: only call `calculateStreak` and upsert `StudyStreak` when `totalElapsed >= allocatedMinutes * 60` AND `allocatedMinutes > 0`
- [x] 5.5 Return `SessionSaveResult` with `dayComplete`, `totalElapsedSeconds`, and `sessionCount` in addition to `streak`

## Task 6: Update SessionTimer Component
> **Requirements**: 3.1, 3.2, 3.3, 3.4, 3.5

- [x] 6.1 Add `previousElapsedSeconds` prop to `SessionTimerProps` interface
- [x] 6.2 Update remaining time calculation: `remaining = allocatedSeconds - previousElapsedSeconds - currentElapsedSeconds`
- [x] 6.3 Show context text when `previousElapsedSeconds > 0` (e.g., "X min already completed today")
- [x] 6.4 Ensure overtime mode activates correctly when `previousElapsedSeconds >= allocatedSeconds`

## Task 7: Update MoneyAccumulator Component
> **Requirements**: 4.1, 4.2, 4.3

- [x] 7.1 Add `previousElapsedSeconds` prop to `MoneyAccumulatorProps` interface
- [x] 7.2 Update earnings calculation to use `previousElapsedSeconds + elapsedSeconds` as the total
- [x] 7.3 Verify the display shows cumulative daily earnings from the first render

## Task 8: Update StudySessionView Component
> **Requirements**: 1.1, 3.1, 4.1, 5.1, 7.1, 7.2, 7.3, 7.4

- [x] 8.1 Change `existingSession` prop to `dayProgress: DayProgress | null`
- [x] 8.2 Pass `dayProgress.totalElapsedSeconds` as `previousElapsedSeconds` to `SessionTimer` and `MoneyAccumulator`
- [x] 8.3 Update the previous session summary card to show cumulative info: total time, session count, and completion status
- [x] 8.4 Pass `allocatedMinutes` to `saveStudySession` call
- [x] 8.5 Update `handleComplete` to use `SessionSaveResult` response and pass enriched result to `onComplete`
- [x] 8.6 Show "Day complete!" indicator when `dayProgress.isComplete` is true, with note that additional sessions are overtime

## Task 9: Update page.tsx State Management
> **Requirements**: 6.1, 6.2, 6.3, 6.4

- [x] 9.1 Change `completedSessions` state from `Map<number, StudySessionRecord>` to `Map<number, DayProgress>`
- [x] 9.2 Replace `getStudySessions()` call with `getCompletedDays()` in the initial data fetch
- [x] 9.3 Update `handleSessionComplete` to merge `SessionSaveResult` into the `DayProgress` map
- [x] 9.4 Update `completedDayNumbers` derivation: a day is in the set only when `dayProgress.isComplete` is true
- [x] 9.5 Pass `dayProgress` (from map lookup) instead of `existingSession` to `StudySessionView`
