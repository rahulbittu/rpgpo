# Sprint 334: Rating Flow Polish — Auto-Advance Dimensions

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Auto-advance focus between rating dimensions for smoother flow

## Mission
The rating flow's Step 1 (dimensions) requires users to manually shift attention between 3 score questions + 1 yes/no question. There's no visual guidance on which question to answer next. This sprint adds auto-advance: after scoring a dimension, the next unanswered question is subtly highlighted. This reduces friction and makes the rating flow feel like a guided interview.

## Design Reference
**Before:** 4 questions with no visual flow guidance. User scans for the next question.
**After:** After answering Q1 (Food), Q2 (Service/Packaging/Wait Time) highlights with amber border. After Q2, Q3 highlights. After Q3, "Would Return?" highlights. After answering "Would Return?", focus moves to the Next button.

**Auto-advance timing:** 300ms delay after score selection — feels natural, not jarring.
**Highlight style:** Amber-tinted background + amber border. Only shows when the dimension is unanswered (score = 0 or null).

## Team Discussion

**Marcus Chen (CTO):** "Constitution #3: Structured scoring > vague reviews. Fast structured input, not essays. Auto-advance removes a micro-friction point in the structured input flow."

**Amir Patel (Architecture):** "Simple state-based: `focusedDimension` tracks which question is highlighted (0-3 for questions, 4 for done). Wrapper handlers (handleQ1/Q2/Q3/handleReturn) set the score then advance focus after 300ms. Highlight only shows when the dimension is unanswered."

**Sarah Nakamura (Lead Eng):** "The 300ms delay is important — it lets the user see their score selection register before the next question highlights. Without it, the UI feels jumpy."

**Jasmine Taylor (Marketing):** "The rating flow is our core action. Every reduction in friction increases completion rate. Auto-advance makes it feel like a conversation: 'How was the food?' → answer → 'How was the service?' automatically."

**Priya Sharma (QA):** "14 tests verifying: focusedDimension state, all 4 handlers, setTimeout delay, focusedQuestion style, conditional highlighting, reset on step change, CircleScorePicker handlers updated."

## Changes
- `app/rate/[id].tsx` — Added `focusedDimension` state, 4 auto-advance handlers (handleQ1/Q2/Q3/handleReturn), `focusedQuestion` style, conditional highlighting on unanswered dimensions, focus reset on step change.

## Test Results
- **254 test files, 6,291 tests, all passing** (~3.5s)
- **Server build:** 607.4kb (under 700kb threshold)
