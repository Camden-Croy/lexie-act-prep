# Implementation Plan: ACT Prep Sessions

## Overview

Transform the existing golf tracker into Lexie's ACT prep study session tool. The implementation proceeds in layers: database schema first, then static data modules, then server actions, then UI components (building from leaf components up to the main page), and finally testing and cleanup. Each task builds on the previous, and no code is left unwired.

## Tasks

- [x] 1. Update Prisma schema and database
  - [x] 1.1 Replace golf models with StudySession model in `prisma/schema.prisma`
    - Remove `RangeSession`, `RangeShot`, `Round`, `Hole` models and their relations on `User`
    - Add `StudySession` model with fields: `id` (autoincrement), `dayNumber` (Int), `section` (String), `topic` (String), `startTime` (DateTime, default now), `endTime` (DateTime?), `elapsedSeconds` (Int, default 0), `notes` (String?), `userId` (String)
    - Add relation from `StudySession` to `User` with `onDelete: Cascade`
    - Add `@@unique([dayNumber, userId])` constraint and `@@map("study_session")`
    - Replace `rangeSessions` and `rounds` relations on `User` with `studySessions StudySession[]`
    - Retain all better-auth models (User, Session, Account, Verification) unchanged
    - Run `npx prisma generate` to regenerate the Prisma client
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create static data modules
  - [x] 2.1 Create `lib/study-plan.ts` with the 41-day study plan
    - Define `StudyPlanDay` interface with fields: `dayNumber`, `date`, `isoDate`, `phase`, `phaseName`, `section`, `topic`, `resource`, `timeMinutes`
    - Populate `STUDY_PLAN` readonly array with all 41 days from `helping-lexie/study-plan.md`
    - Implement `getStudyPlanDay(dayNumber)` lookup function
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.2 Write property tests for study plan data (Properties 1 & 2)
    - Install `vitest` and `fast-check` as dev dependencies; create `vitest.config.ts`
    - **Property 1: Study plan data validity** — verify all 41 entries have valid dayNumber (1–41), non-empty strings, valid isoDate format, phase 0–3, valid section enum, positive timeMinutes, and unique dayNumbers
    - **Property 2: Study plan lookup round-trip** — for any dayNumber 1–41, `getStudyPlanDay(dayNumber)` returns matching entry; for any dayNumber outside range, returns undefined
    - **Validates: Requirements 2.1, 2.3**

  - [x] 2.3 Create `lib/section-strategies.ts` with strategy content for each section
    - Define `StrategyRule`, `SectionStrategy` interfaces
    - Populate `SECTION_STRATEGIES` array with English (8 grammar rules, rhetorical skills, tips), Math (Tier 1/2/3 topics, formulas, tactics), and Reading (question types, wrong answer patterns, strategy) from `helping-lexie/section-strategies.md`
    - Implement `getStrategyForSection(section)` lookup function
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Create `lib/milestones.ts` with owl milestone definitions
    - Define `OwlMilestone` interface with `threshold`, `name`, `title`, `message`, `emoji`
    - Populate `OWL_MILESTONES` array with 5 milestones at thresholds 5, 10, 20, 30, 41
    - Implement `getCurrentMilestone(completedDays)`, `getNextMilestone(completedDays)`, and `checkMilestoneCrossed(previousCount, newCount)` functions
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ]* 2.5 Write property tests for milestones (Properties 8 & 9)
    - **Property 8: Milestone crossing detection** — for any previousCount/newCount pair (0 ≤ prev < new ≤ 41), `checkMilestoneCrossed` returns a milestone iff a threshold in {5,10,20,30,41} falls in (prev, new]; returns the highest crossed
    - **Property 9: Milestone rank lookup** — for any completedDays 0–41, `getCurrentMilestone` returns highest milestone ≤ completedDays (or undefined if < 5); `getNextMilestone` returns lowest milestone > completedDays (or undefined if ≥ 41)
    - **Validates: Requirements 12.2, 12.4**

- [-] 3. Create utility functions and helpers
  - [x] 3.1 Create `lib/session-utils.ts` with timer formatting, earnings calculation, and countdown helpers
    - Implement `formatTime(seconds)` → MM:SS string (zero-padded)
    - Implement `calculateEarnings(elapsedSeconds)` → number (seconds × 633/3600)
    - Implement `formatDollars(amount)` → string in `$X.XX` format
    - Implement `getDaysUntilTest(fromDate?)` → number of days until June 13, 2026 (0 if on or after)
    - _Requirements: 5.6, 6.1, 6.2, 6.4, 9.4_

  - [ ]* 3.2 Write property tests for utility functions (Properties 3, 4, 5, 7)
    - **Property 3: Time formatting correctness** — for any non-negative integer seconds, verify MM:SS format with correct zero-padding
    - **Property 4: Earnings calculation correctness** — for any non-negative seconds, verify result equals seconds × 633/3600; verify monotonicity and zero-at-zero
    - **Property 5: Dollar formatting correctness** — for any non-negative number, verify `$X.XX` pattern and value within ±0.005 rounding tolerance
    - **Property 7: Test countdown correctness** — for any date before June 13 2026, returns positive integer; on or after returns 0
    - **Validates: Requirements 5.6, 6.1, 6.2, 6.4, 9.4**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Replace server actions
  - [x] 5.1 Replace golf server actions with study session actions in `app/actions.ts`
    - Remove `saveRangeSession`, `saveRound`, `getClubAverages` functions
    - Implement `saveStudySession(data)` — authenticates via `auth.api.getSession()`, validates dayNumber 1–41, upserts `StudySession` keyed by `dayNumber + userId`, sets `startTime` on create, updates `endTime` to now and `elapsedSeconds`/`notes` on every call; throws `Error("Unauthorized")` if unauthenticated
    - Implement `getStudySessions()` — returns all `StudySession` records for authenticated user; returns empty array if unauthenticated
    - Define and export `StudySessionRecord` interface matching the Prisma model fields
    - _Requirements: 8.1, 8.5, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 5.2 Write unit tests for server actions
    - Test that `saveStudySession` upserts correctly (creates on first call, updates on subsequent calls for same day)
    - Test that unauthenticated `saveStudySession` throws authorization error
    - Test that unauthenticated `getStudySessions` returns empty array
    - Test dayNumber validation rejects values outside 1–41
    - _Requirements: 8.5, 11.1, 11.3, 11.4_

- [x] 6. Build leaf UI components
  - [x] 6.1 Create `components/session-timer.tsx`
    - Accept props: `allocatedMinutes`, `isRunning`, `onStart`, `onPause`, `onResume`, `elapsedSeconds`
    - Display countdown (allocated time minus elapsed) in MM:SS format using `formatTime`
    - When countdown reaches zero, switch to overtime display (continue counting up) with visual indication ("Overtime!" label, color change)
    - Render Start/Pause/Resume button based on timer state
    - Ensure keyboard navigability and accessible labels on buttons
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.3_

  - [x] 6.2 Create `components/money-accumulator.tsx`
    - Accept props: `elapsedSeconds`, `isRunning`
    - Calculate dollar amount using `calculateEarnings(elapsedSeconds)` and format with `formatDollars`
    - Display accumulated amount and hourly rate context ("$633/hr")
    - Update display every second while timer is running
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.3 Create `components/strategy-panel.tsx`
    - Accept props: `day` (StudyPlanDay), `strategy` (SectionStrategy)
    - Display day's topic and resource at top
    - Render section rules, tips, and resource links from strategy data
    - Make panel independently scrollable from timer area
    - Use collapsible sections for rules to avoid overwhelming the view
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 6.4 Create `components/milestone-overlay.tsx`
    - Accept props: `milestone` (OwlMilestone), `onDismiss` callback
    - Render full-screen overlay with FAU brand colors (red #CC0000, blue #003366)
    - Display milestone name, emoji, and motivational message
    - Auto-dismiss after 5 seconds via `setTimeout`; dismissible on click/tap
    - Special enhanced variant for "Full Owl" (day 41) celebration
    - _Requirements: 12.2, 12.3, 12.5, 12.6_

  - [x] 6.5 Create `components/score-dashboard.tsx`
    - Accept props: `completedDays`, `currentMilestone`, `nextMilestone`
    - Display current scores (E19/M18/R25/C21) and target scores (E24/M24/R27/C25)
    - Display scholarship goal: "Florida Medallion Scholars (FMS) Bright Futures — ~$18,000–$20,000+ over 4 years"
    - Display test date (June 13, 2026) and countdown using `getDaysUntilTest()`
    - Display current owl milestone rank and progress bar toward next milestone
    - Use FAU accent colors for progress indicators
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 12.4_

  - [x] 6.6 Create `components/day-selector.tsx`
    - Accept props: `studyPlan`, `completedDays` (Set<number>), `onSelectDay` callback
    - Group days by phase with phase headers
    - Display each day's date, section badge (color-coded), and topic
    - Show check icon overlay on completed days
    - Highlight current calendar day with distinct border/glow
    - Show progress summary bar: "X / 41 days completed"
    - Responsive layout: single column on mobile, 2–3 columns on desktop
    - Ensure keyboard navigability and accessible labels on day items
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 13.1, 13.3_

- [x] 7. Build composite session view component
  - [x] 7.1 Create `components/study-session-view.tsx`
    - Accept props: `day`, `existingSession`, `onComplete`, `onBack`
    - Manage timer state (running/paused/stopped) and elapsed seconds via `setInterval`
    - If `existingSession` exists, display previous elapsed time and notes with option to start new session
    - Compose `SessionTimer`, `MoneyAccumulator`, `StrategyPanel` (load strategy via `getStrategyForSection`)
    - Include notes textarea and "Complete Session" button
    - On complete: call `saveStudySession` server action, invoke `onComplete` callback with result
    - Check for milestone crossing via `checkMilestoneCrossed` and show `MilestoneOverlay` if triggered
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.3, 7.1, 7.2, 8.1, 8.2, 8.4, 8.5, 12.2_

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Wire everything together on the main page
  - [x] 9.1 Update `app/layout.tsx` metadata and theming
    - Change title from "Golf Tracker" to "Lexie's ACT Prep"
    - Change description to reflect ACT prep purpose
    - Add FAU CSS custom properties (--fau-red: #CC0000, --fau-blue: #003366) in `globals.css`
    - _Requirements: 10.1, 12.3_

  - [x] 9.2 Rewrite `app/page.tsx` to compose all ACT prep components
    - Remove golf imports (RangeSession, RoundLogger, Tabs, Target, Flag, CircleDot)
    - Fetch completed sessions via `getStudySessions()` on mount
    - Manage app state: "selector" view (DaySelector + ScoreDashboard) vs "session" view (StudySessionView)
    - Wire day selection → session view transition
    - Wire session completion → update completed days set, return to selector, trigger milestone overlay if applicable
    - Retain existing auth check and sign-out flow
    - Ensure responsive layout across 375px–1440px viewports
    - Use semantic HTML and ARIA attributes for accessibility
    - _Requirements: 4.5, 8.2, 8.3, 10.2, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4_

  - [x] 9.3 Remove golf components
    - Delete `components/range-session.tsx`
    - Delete `components/round-logger.tsx`
    - _Requirements: 10.3_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (9 properties across 5 test files)
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all code, interfaces, and tests use TypeScript/TSX
- Static data modules (`study-plan.ts`, `section-strategies.ts`, `milestones.ts`) are populated from the content in `helping-lexie/`
- FAU theming (red #CC0000, blue #003366) is applied via CSS custom properties for consistency
