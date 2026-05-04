# Requirements Document

## Introduction

This feature optimizes Lexie's 41-day ACT prep study plan and app based on user research findings. The current plan has gaps: no Desmos calculator training (critical for the Enhanced ACT 2026), no anti-anxiety scaffolding for math sessions, test strategies mentioned only as tips rather than dedicated practice, an overly broad math scope for shaky foundations, no streak tracking for accountability, and no early diagnostic checkpoint. This feature restructures the study plan content, updates section strategies, and adds a streak tracker to the app — all within the existing architecture.

## Glossary

- **Study_Plan**: The static 41-day array of `StudyPlanDay` objects in `lib/study-plan.ts` that defines each day's section, topic, resource, and time allocation
- **Section_Strategies**: The static array of `SectionStrategy` objects in `lib/section-strategies.ts` containing rules, tips, and resources for each ACT section
- **Streak_Tracker**: A UI component and persistence mechanism that tracks and displays the number of consecutive calendar days on which Lexie has completed at least one study session
- **Score_Dashboard**: The existing dashboard component (`components/score-dashboard.tsx`) that displays current/target scores, scholarship goal, test countdown, and owl milestone progress
- **Day_Selector**: The existing component (`components/day-selector.tsx`) that renders the 41-day study plan grouped by phase and tracks completion
- **Study_Session_View**: The existing component (`components/study-session-view.tsx`) that manages the active study session with timer, notes, and save functionality
- **Desmos_Training**: Dedicated study plan days and strategy content teaching Lexie to use the built-in Desmos graphing calculator on the Enhanced ACT 2026 to solve math problems visually
- **Confidence_Builder**: A set of 5 easy warm-up problems at the start of each math session day, designed to reduce math anxiety by guaranteeing early wins before harder material
- **Test_Strategy_Day**: A dedicated study plan day focused exclusively on practicing "backsolving" (plugging in answer choices) and "picking numbers" (substituting simple values for variables) techniques
- **Diagnostic_Checkpoint**: A 10-question mini-assessment at the end of Phase 1 (Day 16) to measure progress before the full practice test at Day 30
- **Streak_Record**: A database record storing the user's current streak count and the date of their last completed session, persisted via Prisma
- **Server_Action**: A Next.js server action in `app/actions.ts` that handles data persistence between the client and the database

## Requirements

### Requirement 1: Restructured Math Progression with Narrower Scope

**User Story:** As Lexie, I want the math portion of my study plan to focus on pre-algebra and algebra repetition with reduced geometry and no trigonometry in Phase 1, so that I build solid foundations on the topics that yield the most ACT points.

#### Acceptance Criteria

1. THE Study_Plan SHALL allocate at least 3 Phase 1 math days to pre-algebra topics (fractions, decimals, percentages, ratios, proportions)
2. THE Study_Plan SHALL allocate at least 3 Phase 1 math days to algebra topics (linear equations, inequalities, exponents)
3. THE Study_Plan SHALL limit Phase 1 geometry content to a single day covering formulas only (area, perimeter, circumference, Pythagorean theorem)
4. THE Study_Plan SHALL remove trigonometry from Phase 1 entirely, deferring SOH-CAH-TOA to a single day in Phase 2
5. THE Study_Plan SHALL retain the existing 41-day total count and the existing phase structure (Phase 0: Day 1, Phase 1: Days 2–16, Phase 2: Days 17–30, Phase 3: Days 31–41)
6. THE Study_Plan SHALL maintain the alternating English/Math pattern in Phase 1 with a Reading maintenance day at Day 16

### Requirement 2: Desmos Calculator Training Integration

**User Story:** As Lexie, I want dedicated Desmos graphing calculator training days in my study plan and Desmos-specific tips in my section strategies, so that I can use the built-in calculator on the Enhanced ACT 2026 to solve math problems visually and avoid algebraic errors.

#### Acceptance Criteria

1. THE Study_Plan SHALL include at least 2 days dedicated to Desmos calculator training: one in Phase 1 for basic Desmos skills (graphing equations, finding intersections) and one in Phase 2 for applying Desmos to ACT-style problems
2. WHEN a math day in the Study_Plan includes Desmos training, THE Study_Plan SHALL set the resource field to reference the Acely ACT Desmos guide or Desmos practice tool
3. THE Section_Strategies SHALL include a Desmos-specific strategy rule under the Math section explaining how to graph equations to find solutions, plug in answer choices visually, and use sliders to test values
4. THE Section_Strategies SHALL include Desmos as a resource entry under the Math section with a URL to the Desmos graphing calculator

### Requirement 3: Anti-Anxiety Math Architecture

**User Story:** As Lexie, I want each math study day to begin with confidence-building warm-up problems and include explicit framing that confusion is normal, so that I can manage my math anxiety and stay engaged instead of shutting down.

#### Acceptance Criteria

1. WHEN a Study_Plan day has section "Math", THE Study_Plan SHALL include guidance in the topic description indicating the session starts with 5 confidence-builder problems before the main content
2. THE Section_Strategies SHALL include a strategy rule under the Math section titled "Anti-Anxiety Scaffolding" that describes the confidence-builder warm-up pattern, explains that confusion is a normal part of learning math, and recommends untimed practice before timed pressure
3. THE Section_Strategies SHALL order the "Anti-Anxiety Scaffolding" rule as the first rule in the Math section rules array so it appears prominently
4. WHILE Phase 1 is active (Days 2–16), THE Study_Plan SHALL specify untimed practice for all math days by setting timeMinutes to represent a flexible session length rather than a strict timed constraint

### Requirement 4: Dedicated Test Strategy Days

**User Story:** As Lexie, I want dedicated practice days for "backsolving" and "picking numbers" test strategies, so that I can gain 3–5 ACT math points using techniques that do not require learning new math concepts.

#### Acceptance Criteria

1. THE Study_Plan SHALL include at least 2 Test_Strategy_Days: one in Phase 1 focused on learning backsolving and picking-numbers techniques, and one in Phase 2 focused on applying those techniques under timed conditions
2. WHEN a Test_Strategy_Day is in Phase 1, THE Study_Plan SHALL set the topic to cover backsolving (plugging answer choices into the problem) and picking numbers (substituting simple values like 2 or 3 for variables)
3. WHEN a Test_Strategy_Day is in Phase 2, THE Study_Plan SHALL set the topic to cover timed practice applying backsolving and picking-numbers to a set of ACT-style problems
4. THE Section_Strategies SHALL include a dedicated strategy rule under the Math section explaining backsolving and picking-numbers techniques with worked examples

### Requirement 5: Early Diagnostic Checkpoint

**User Story:** As Lexie, I want a 10-question diagnostic checkpoint at the end of Phase 1 (Day 16), so that I can measure my progress and adjust my Phase 2 focus areas instead of waiting until Day 30 for the first assessment.

#### Acceptance Criteria

1. THE Study_Plan SHALL replace the current Day 16 content (Reading maintenance passage) with a Diagnostic_Checkpoint consisting of a 10-question mini-assessment (approximately 3 English, 4 Math, 3 Reading)
2. THE Study_Plan SHALL set the Day 16 section to "All" and the topic to describe the diagnostic checkpoint purpose and question breakdown
3. THE Study_Plan SHALL move the Reading maintenance passage that was previously on Day 16 to an appropriate earlier day in Phase 1 without displacing existing content
4. WHEN the Diagnostic_Checkpoint is completed, THE Study_Session_View SHALL allow Lexie to save the session with notes about which questions she missed, following the existing session save flow

### Requirement 6: Streak Tracker Persistence

**User Story:** As Lexie, I want my consecutive-day study streak tracked and persisted in the database, so that my streak survives page refreshes and sign-outs.

#### Acceptance Criteria

1. THE Streak_Record SHALL store the current streak count and the last completed session date for each user
2. WHEN a study session is saved via the Server_Action, THE Server_Action SHALL calculate the updated streak: if the last session date is yesterday, increment the streak count by 1; if the last session date is today, keep the streak count unchanged; otherwise, reset the streak count to 1
3. THE Server_Action SHALL return the updated streak count in the response from the save study session action
4. WHEN the app loads, THE Server_Action SHALL provide a function to retrieve the current streak count and last session date for the authenticated user
5. IF the database has no Streak_Record for a user, THEN THE Server_Action SHALL treat the streak count as 0

### Requirement 7: Streak Tracker Display

**User Story:** As Lexie, I want to see my current study streak displayed on the score dashboard, so that I feel motivated to maintain my consecutive-day habit.

#### Acceptance Criteria

1. THE Score_Dashboard SHALL display the current streak count with a flame or streak icon and the label "day streak" (or "days streak" when count is not 1)
2. WHEN the streak count is 0, THE Score_Dashboard SHALL display "Start your streak!" instead of a number
3. THE Score_Dashboard SHALL position the streak display in the existing dashboard layout alongside the scores, scholarship goal, and milestone cards
4. WHEN a study session is completed and the streak count increases, THE Score_Dashboard SHALL reflect the updated streak count without requiring a full page reload

### Requirement 8: Updated Section Strategy Content

**User Story:** As Lexie, I want the section strategies to reflect the optimized plan's priorities — including Desmos tips, anti-anxiety guidance, narrower math scope messaging, and test strategy techniques — so that the strategy panel shown during study sessions matches the new plan.

#### Acceptance Criteria

1. THE Section_Strategies Math overview SHALL state that trigonometry is deprioritized (guess 2–3 questions) and that the path to 24 focuses on pre-algebra, algebra, and test strategies
2. THE Section_Strategies Math tips array SHALL include a tip about using the Desmos graphing calculator to check answers visually
3. THE Section_Strategies Math tips array SHALL include a tip about starting each session with confidence-builder problems to manage anxiety
4. THE Section_Strategies Math resources array SHALL include the Acely ACT Desmos guide URL and the Desmos graphing calculator URL
5. THE Section_Strategies Math rules array SHALL retain all existing Tier 1 and Tier 2 content rules while adding the new Desmos, anti-anxiety, and test strategy rules

### Requirement 9: Database Schema Update for Streak Tracking

**User Story:** As a developer, I want the Prisma schema updated to support streak tracking, so that streak data is persisted alongside existing study session data.

#### Acceptance Criteria

1. THE Prisma schema SHALL define a `StudyStreak` model with fields: id (autoincrement primary key), userId (string, unique, foreign key to User), currentStreak (integer, default 0), lastSessionDate (DateTime, nullable), and standard createdAt/updatedAt timestamps
2. THE `StudyStreak` model SHALL have a unique constraint on userId so each user has exactly one streak record
3. THE `StudyStreak` model SHALL define a relation to the User model with cascading delete
4. THE Prisma schema SHALL use the table name "study_streak" via the `@@map` directive to follow the existing naming convention
