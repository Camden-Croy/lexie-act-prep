# Implementation Plan: Optimized Study Plan

## Overview

Restructure the existing 41-day ACT prep study plan content, update Math section strategies, add streak tracking (database model + server actions + UI), and wire everything together. Implementation proceeds in layers: database schema first, then static data updates, then pure utility functions, then server actions, then UI components, then page wiring, then property-based tests. Each task builds on the previous — no orphaned code.

## Tasks

- [x] 1. Update Prisma schema with StudyStreak model
  - [x] 1.1 Add `StudyStreak` model to `prisma/schema.prisma` and push to database
    - Add `StudyStreak` model with fields: `id` (autoincrement), `userId` (String, @unique), `currentStreak` (Int, default 0), `lastSessionDate` (DateTime?), `createdAt` (DateTime, default now), `updatedAt` (DateTime, @updatedAt)
    - Add relation to `User` with `onDelete: Cascade` and `@@map("study_streak")`
    - Add `studyStreak StudyStreak?` relation field on the `User` model
    - Run `npx prisma db push` to apply schema changes to the database
    - Run `npx prisma generate` to regenerate the Prisma client
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Restructure study plan content
  - [x] 2.1 Update the `STUDY_PLAN` array in `lib/study-plan.ts` with restructured day-by-day content
    - Phase 0 (Day 1): Unchanged
    - Phase 1 (Days 2–16): Update per design — Day 3 adds "confidence-builder warm-ups" to topic, Day 5 adds warm-ups, Day 7 adds warm-ups, Day 8 changes from English to Reading maintenance passage (moved from Day 16), Day 9 changes to Desmos basics (Math), Day 10 changes to combined run-ons/fragments + pronoun errors (English), Day 11 changes to backsolving & picking numbers (Math test strategy), Day 12 changes to parallelism + comparisons + wordiness & redundancy (English), Day 13 changes to geometry formulas only (Math), Day 14 changes to modifier placement + rhetorical skills intro (English), Day 15 changes to exponent rules + order of operations with warm-ups (Math), Day 16 changes to diagnostic checkpoint section "All" with 45 min
    - Phase 2 (Days 17–30): Update per design — Day 18 changes to inequalities + coordinate geometry with warm-ups, Day 20 changes to systems of equations + quadratics with warm-ups, Day 22 changes to statistics with warm-ups, Day 23 changes to Desmos ACT practice (Math), Day 25 changes to backsolving & picking numbers timed practice (Math), Day 27 trig basics stays, Day 28 changes to full timed Math section (remove "#2")
    - Phase 3 (Days 31–41): Unchanged
    - All Math days must include "Start with 5 confidence-builder warm-ups" or equivalent text in topic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 3.1, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [x] 3. Update section strategies
  - [x] 3.1 Update Math section in `lib/section-strategies.ts` with new rules, tips, and resources
    - Prepend 3 new rules to the Math rules array: "Anti-Anxiety Scaffolding" (index 0), "Desmos Graphing Calculator" with examples (index 1), "Backsolving & Picking Numbers" with examples (index 2)
    - Retain all existing Tier 1, Tier 2, and Tier 3 rules (shifted by 3 indices)
    - Update Math overview to mention trig deprioritized and focus on pre-algebra, algebra, and test strategies (backsolving, picking numbers, Desmos)
    - Add 2 new tips: Desmos visual checking tip and confidence-builder warm-up tip
    - Add 2 new resources: Acely ACT Desmos Guide (with URL) and Desmos Graphing Calculator (with URL)
    - _Requirements: 2.3, 2.4, 3.2, 3.3, 4.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Create calculateStreak pure function
  - [x] 4.1 Add `calculateStreak` function to `lib/session-utils.ts`
    - Implement `calculateStreak(existingStreak: number, lastSessionDate: Date | null, today: Date): number`
    - Return 1 when `lastSessionDate` is null (no prior sessions)
    - Return `existingStreak` when `lastSessionDate` is the same calendar day as `today`
    - Return `existingStreak + 1` when `lastSessionDate` is exactly 1 calendar day before `today`
    - Return 1 when `lastSessionDate` is more than 1 calendar day before `today` (streak broken)
    - Strip time components for day-level comparison using `new Date(year, month, date)`
    - Export the function for use in server actions and tests
    - _Requirements: 6.2_

- [X] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update server actions with streak logic
  - [x] 6.1 Update `saveStudySession` return type and add streak calculation in `app/actions.ts`
    - Change return type from `Promise<{ ok: true }>` to `Promise<{ ok: true; streak: number }>`
    - After the existing session upsert, call `calculateStreak` with the user's existing streak record and today's date
    - Upsert `StudyStreak` record with the calculated streak count and today's date
    - Return `{ ok: true, streak: newStreak }` instead of `{ ok: true }`
    - Import `calculateStreak` from `@/lib/session-utils`
    - _Requirements: 6.2, 6.3_

  - [x] 6.2 Add `getStudyStreak` server action in `app/actions.ts`
    - Define and export `StudyStreakRecord` interface with `currentStreak: number` and `lastSessionDate: Date | null`
    - Implement `getStudyStreak()` — authenticates via `auth.api.getSession()`, queries `prisma.studyStreak.findUnique` by userId
    - Return `{ currentStreak: 0, lastSessionDate: null }` if unauthenticated or no record found
    - _Requirements: 6.4, 6.5_

- [x] 7. Update ScoreDashboard with streak display
  - [x] 7.1 Add streak card to `components/score-dashboard.tsx`
    - Add `streakCount: number` to `ScoreDashboardProps` interface
    - Import `Flame` icon from `lucide-react`
    - Add a new Card between the Scores card and the Scholarship Goal card displaying the streak
    - When `streakCount > 0`: show `"{streakCount} day(s) streak 🔥"` with bold text
    - When `streakCount === 0`: show `"Start your streak!"` in muted text
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 8. Update StudySessionView to pass streak from save response
  - [x] 8.1 Update `components/study-session-view.tsx` to include streak in completion callback
    - Update `handleComplete` to capture the `streak` field from the `saveStudySession` response (which now returns `{ ok: true, streak: number }`)
    - Include `streak` in the result object passed to `onComplete` callback
    - Update the `onComplete` prop type to accept `StudySessionRecord & { streak?: number }`
    - _Requirements: 6.3, 7.4_

- [x] 9. Wire streak data through page.tsx
  - [x] 9.1 Update `app/page.tsx` to fetch and display streak data
    - Import `getStudyStreak` and `StudyStreakRecord` from `@/app/actions`
    - Add `streakCount` state initialized to 0
    - In the session-fetch `useEffect`, call `getStudyStreak()` in parallel with `getStudySessions()` and set `streakCount` from the result
    - Pass `streakCount` to `ScoreDashboard` component
    - In `handleSessionComplete`, update `streakCount` from `result.streak` if present
    - _Requirements: 6.4, 7.3, 7.4_

- [ ] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Property-based tests for correctness properties
  - [ ]* 11.1 Write property test for study plan structural validity (Property 1)
    - Install `vitest` and `fast-check` as dev dependencies if not already present; create `vitest.config.ts` if needed
    - Create test file for study plan properties
    - **Property 1: Study plan structural validity with phase mapping** — for any entry in STUDY_PLAN, verify dayNumber is 1–41, isoDate matches YYYY-MM-DD, phase is 0–3, section is valid enum, topic and resource are non-empty, timeMinutes is non-negative, array has exactly 41 unique dayNumbers, and phase matches day range (Day 1 → Phase 0, Days 2–16 → Phase 1, Days 17–30 → Phase 2, Days 31–41 → Phase 3)
    - Tag: `Feature: optimized-study-plan, Property 1: Study plan structural validity with phase mapping`
    - **Validates: Requirements 1.5**

  - [ ]* 11.2 Write property test for math confidence-builder guidance (Property 2)
    - **Property 2: Math days include confidence-builder guidance** — for any entry in STUDY_PLAN where section is "Math", verify the topic string contains "confidence-builder" or "warm-up" text
    - Tag: `Feature: optimized-study-plan, Property 2: Math days include confidence-builder guidance`
    - **Validates: Requirements 3.1**

  - [ ]* 11.3 Write property test for streak calculation correctness (Property 3)
    - **Property 3: Streak calculation correctness** — generate arbitrary (existingStreak: non-negative int, lastSessionDate: Date or null, today: Date where today >= lastSessionDate), verify `calculateStreak` returns: 1 when lastSessionDate is null, existingStreak when same calendar day, existingStreak + 1 when exactly 1 day before, 1 when more than 1 day before
    - Tag: `Feature: optimized-study-plan, Property 3: Streak calculation correctness`
    - **Validates: Requirements 6.2**

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (3 properties)
- The design uses TypeScript throughout — all code, interfaces, and tests use TypeScript/TSX
- Database schema changes (task 1) must be applied before server action changes (task 6)
- Static data updates (tasks 2–3) have no runtime dependencies and can be done early
- The `calculateStreak` pure function (task 4) is created before server actions so it can be imported and tested independently
- The `StudyPlanDay` interface is unchanged — only array content changes
- The `SectionStrategy` and `StrategyRule` interfaces are unchanged — only Math section content changes
