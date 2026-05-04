# Requirements Document

## Introduction

Transform the existing golf tracker Next.js application into an ACT prep study session tool for Lexie. The app retains its authentication system (better-auth with User, Session, Account, Verification models) and UI primitives (shadcn/ui components, Tailwind CSS 4, dark mode). All golf-specific models (RangeSession, RangeShot, Round, Hole), components (range-session, round-logger), and server actions are replaced with ACT prep equivalents.

The core experience: Lexie opens the app, selects a study day from the 41-day plan (May 3 – June 12, 2026), starts a timed session, and watches a dollar accumulator tick up alongside the countdown timer — showing the scholarship money she's earning per second of study. Each day surfaces the relevant section strategies, topics, and resources. Completed days are tracked for accountability.

## Glossary

- **App**: The Next.js web application being built, accessible via browser
- **Study_Plan**: The static dataset of 41 days, each with a date, phase, section, topic, resource, and time allocation
- **Study_Session**: A database record representing one completed or in-progress study session tied to a specific study plan day and user
- **Day_Selector**: The UI component that displays all 41 days with their completion status and allows the user to pick a day to study
- **Session_Timer**: The countdown (or count-up) timer component that tracks elapsed study time during an active session
- **Money_Accumulator**: The UI element that displays a running dollar amount earned based on elapsed study time and the scholarship hourly rate
- **Scholarship_Rate**: The calculated effective hourly rate of study, derived from FMS scholarship value (~$18,000–$20,000 over 4 years) divided by ~30 hours of study, yielding approximately $633/hour
- **Strategy_Panel**: The UI component that displays section-specific strategies, tips, and resources relevant to the current day's topic
- **Section**: One of the three ACT test sections: English, Math, or Reading
- **Phase**: One of the four study plan phases: Phase 0 (Setup), Phase 1 (Foundations), Phase 2 (Strategy + Timed Practice), Phase 3 (Full Practice Tests + Final Sharpening)
- **Score_Dashboard**: The UI area displaying current scores, target scores, and progress toward the FMS scholarship goal
- **Prisma_Schema**: The database schema definition file that defines all data models for the application
- **Owl_Milestone**: A celebratory UI moment triggered when Lexie hits study progress milestones, themed around FAU's owl mascot ("Owlsley") and school identity (red #CC0000, blue #003366, Boca Raton campus)
- **FAU_Theme**: Visual theming elements drawn from Florida Atlantic University's brand — owl iconography, red/blue accent colors, and campus-inspired motivational messages

## Requirements

### Requirement 1: Replace Golf Data Models with ACT Prep Models

**User Story:** As a developer, I want the Prisma schema to define ACT prep data models instead of golf models, so that the database supports study session tracking.

#### Acceptance Criteria

1. THE Prisma_Schema SHALL define a StudySession model with fields for id, day number (1–41), section (English/Math/Reading), topic, start time, end time, elapsed seconds, notes, and a foreign key to User
2. THE Prisma_Schema SHALL retain all better-auth models (User, Session, Account, Verification) without modification
3. THE Prisma_Schema SHALL remove the RangeSession, RangeShot, Round, and Hole models
4. THE Prisma_Schema SHALL define a unique constraint on StudySession for the combination of day number and userId, preventing duplicate sessions for the same day per user
5. WHEN a User record is deleted, THE Prisma_Schema SHALL cascade-delete all associated StudySession records

### Requirement 2: Static Study Plan Data

**User Story:** As a developer, I want the 41-day study plan stored as static TypeScript data, so that the app can render the plan without database queries.

#### Acceptance Criteria

1. THE App SHALL define a TypeScript data module containing all 41 days of the study plan, each with: day number, date string, phase number, phase name, section, topic, resource description, and allocated time in minutes
2. THE App SHALL define the study plan data as a read-only constant array typed with a StudyPlanDay interface
3. THE App SHALL include a lookup function that retrieves a single study plan day by its day number

### Requirement 3: Static Section Strategy Data

**User Story:** As a developer, I want section strategies stored as static TypeScript data, so that the app can display relevant tips during study sessions.

#### Acceptance Criteria

1. THE App SHALL define a TypeScript data module containing strategy content for each Section (English, Math, Reading)
2. THE App SHALL structure English strategy data to include the 8 grammar rules, rhetorical skills patterns, and test-taking tips from the study materials
3. THE App SHALL structure Math strategy data to include Tier 1, Tier 2, and Tier 3 topic breakdowns with formulas and test-taking tactics from the study materials
4. THE App SHALL structure Reading strategy data to include question type descriptions, wrong answer patterns, and the reading strategy from the study materials
5. THE App SHALL include a lookup function that retrieves strategy content filtered by Section name

### Requirement 4: Day Selector and Study Plan Overview

**User Story:** As Lexie, I want to see all 41 days of my study plan with completion status, so that I know where I am and what's coming up.

#### Acceptance Criteria

1. WHEN the authenticated user loads the main page, THE Day_Selector SHALL display all 41 study plan days grouped by Phase
2. THE Day_Selector SHALL display each day's date, section, and topic
3. WHEN a StudySession record exists for a day, THE Day_Selector SHALL display that day with a completed visual indicator
4. THE Day_Selector SHALL visually distinguish the current calendar day from past and future days
5. WHEN the user selects a day, THE App SHALL navigate to or open the study session view for that day
6. THE Day_Selector SHALL display a progress summary showing the count of completed days out of 41 total days

### Requirement 5: Study Session with Countdown Timer

**User Story:** As Lexie, I want a countdown timer during my study session, so that I can track how long I've been studying and stay on pace.

#### Acceptance Criteria

1. WHEN the user opens a study session for a specific day, THE Session_Timer SHALL display a countdown timer initialized to that day's allocated time in minutes
2. WHEN the user clicks the start button, THE Session_Timer SHALL begin counting down in one-second intervals
3. WHEN the user clicks the pause button, THE Session_Timer SHALL stop counting and preserve the remaining time
4. WHEN the user clicks the resume button, THE Session_Timer SHALL continue counting down from the paused time
5. WHEN the countdown reaches zero, THE Session_Timer SHALL continue counting upward to track overtime study
6. THE Session_Timer SHALL display elapsed time in MM:SS format
7. WHEN the countdown reaches zero, THE Session_Timer SHALL provide a visual and textual indication that the allocated time is complete

### Requirement 6: Money Accumulator

**User Story:** As Lexie, I want to see how much scholarship money I'm earning as I study, so that I stay motivated by the tangible value of my effort.

#### Acceptance Criteria

1. WHILE the Session_Timer is running, THE Money_Accumulator SHALL display a dollar amount that increases proportionally to elapsed study time
2. THE Money_Accumulator SHALL calculate the dollar amount using the Scholarship_Rate of $633 per hour (derived from ~$19,000 scholarship value over ~30 hours of study)
3. THE Money_Accumulator SHALL update the displayed dollar amount every second
4. THE Money_Accumulator SHALL format the dollar amount with a dollar sign and two decimal places (e.g., "$10.55")
5. THE Money_Accumulator SHALL display the effective hourly rate alongside the accumulated amount for context

### Requirement 7: Strategy Panel During Sessions

**User Story:** As Lexie, I want to see the relevant study strategies and resources for today's topic during my session, so that I can reference them while studying.

#### Acceptance Criteria

1. WHEN a study session is active, THE Strategy_Panel SHALL display the strategy content relevant to the current day's Section
2. THE Strategy_Panel SHALL display the specific topic and resource for the current day from the Study_Plan
3. THE Strategy_Panel SHALL display the section-specific tips and rules from the section strategy data
4. THE Strategy_Panel SHALL be scrollable independently from the timer area so the user can reference strategies while the timer remains visible

### Requirement 8: Save and Complete Study Sessions

**User Story:** As Lexie, I want to save my study session when I'm done, so that my progress is tracked and the day is marked complete.

#### Acceptance Criteria

1. WHEN the user clicks the complete button, THE App SHALL save a StudySession record to the database with the day number, section, topic, start time, end time, elapsed seconds, and optional notes
2. WHEN a StudySession is saved successfully, THE App SHALL display a confirmation message
3. WHEN a StudySession is saved successfully, THE Day_Selector SHALL reflect the day as completed without requiring a page refresh
4. IF the user opens a day that already has a completed StudySession, THEN THE App SHALL display the previous session's elapsed time and notes with an option to start a new session for that day
5. WHEN the user starts a new session for a previously completed day, THE App SHALL update the existing StudySession record rather than creating a duplicate

### Requirement 9: Score Dashboard

**User Story:** As Lexie, I want to see my current scores, target scores, and scholarship goal at a glance, so that I remember what I'm working toward.

#### Acceptance Criteria

1. THE Score_Dashboard SHALL display current scores (English 19, Math 18, Reading 25, Composite 21) and target scores (English 24, Math 24, Reading 27, Composite 25)
2. THE Score_Dashboard SHALL display the scholarship goal description: Florida Medallion Scholars (FMS) Bright Futures
3. THE Score_Dashboard SHALL display the scholarship monetary value (~$18,000–$20,000+ over 4 years)
4. THE Score_Dashboard SHALL display the test date (June 13, 2026) and a countdown of days remaining until the test
5. THE Score_Dashboard SHALL be visible on the main page alongside the Day_Selector

### Requirement 10: Replace Golf UI with ACT Prep UI

**User Story:** As a developer, I want the main page and layout updated to reflect the ACT prep app identity, so that the app no longer references golf.

#### Acceptance Criteria

1. THE App SHALL update the page title and metadata from "Golf Tracker" to "Lexie's ACT Prep"
2. THE App SHALL replace the golf-themed main page (Range/Round tabs) with the Day_Selector and Score_Dashboard layout
3. THE App SHALL remove the range-session and round-logger components
4. THE App SHALL replace golf-related server actions (saveRangeSession, saveRound, getClubAverages) with study session server actions (saveStudySession, getStudySessions)
5. THE App SHALL retain the existing authentication flow (sign-in, sign-up, session management) and redirect unauthenticated users to the sign-in page

### Requirement 11: Server Actions for Study Sessions

**User Story:** As a developer, I want server actions that handle study session CRUD operations, so that the client can persist and retrieve session data.

#### Acceptance Criteria

1. WHEN the saveStudySession action is called with valid session data, THE App SHALL upsert a StudySession record keyed by day number and userId
2. WHEN the getStudySessions action is called, THE App SHALL return all StudySession records for the authenticated user
3. IF the saveStudySession action is called by an unauthenticated user, THEN THE App SHALL throw an authorization error
4. IF the getStudySessions action is called by an unauthenticated user, THEN THE App SHALL return an empty result

### Requirement 12: FAU Owl Milestone Celebrations

**User Story:** As Lexie, I want the app to celebrate my progress with FAU-themed milestones, so that studying feels connected to the goal of becoming an Owl and the experience stays fun.

#### Acceptance Criteria

1. THE App SHALL define a set of Owl_Milestone thresholds triggered by cumulative completed study days: 5 days ("Owlet — You're hatching!"), 10 days ("Fledgling — Spreading your wings"), 20 days ("Soaring Owl — Halfway to Boca"), 30 days ("Wise Owl — Almost there"), and 41 days ("Full Owl 🦉 — FAU bound!")
2. WHEN the user completes a study session that crosses an Owl_Milestone threshold, THE App SHALL display a celebratory overlay with the milestone name, an owl emoji or icon, and a motivational message referencing FAU (e.g., "You just earned your wings. Boca Raton is calling 🌴")
3. THE App SHALL use FAU brand accent colors (red #CC0000 and blue #003366) in milestone celebration overlays and progress indicators
4. THE Score_Dashboard SHALL display the user's current Owl_Milestone rank and progress toward the next milestone
5. THE celebratory overlay SHALL be dismissible and auto-dismiss after 5 seconds if the user does not interact with it
6. THE App SHALL display a final "Full Owl" celebration with a special message when all 41 days are completed, referencing the FAU campus and scholarship goal (e.g., "You did it. 41 days. See you at FAU. 🦉🎓")

### Requirement 13: Responsive and Accessible UI

**User Story:** As Lexie, I want the app to work well on my phone and laptop, so that I can study from either device.

#### Acceptance Criteria

1. THE App SHALL render the Day_Selector, Session_Timer, Money_Accumulator, Strategy_Panel, and Score_Dashboard responsively across viewport widths from 375px to 1440px
2. THE App SHALL use the existing dark mode theme and shadcn/ui component library
3. THE App SHALL ensure all interactive elements (buttons, day selection items) are keyboard-navigable and have accessible labels
4. THE App SHALL use semantic HTML elements and ARIA attributes where appropriate for screen reader compatibility
