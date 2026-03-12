# SPRINT 601-604 External Critique Request

**Date:** 2026-03-11
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprints covered:** 601 (admin consolidation), 602 (dish photo nudge), 603 (hero confidence), 604 (receipt UX)

## Context

Four sprints: 1 infrastructure (admin route consolidation) + 3 core-loop improvements (dish photo nudge, hero confidence indicator, receipt verification UX). First core-loop work since Sprint 590 — ends the 12-sprint gap.

## Previous Critique Response Status

596-599 critique request pending response. 591-594 critique also pending. Sending new request despite no responses — maintaining the rhythm.

## 5 Questions for External Review

### 1. Dish Photo Nudge Effectiveness
Sprint 602 adds a contextual "Got a photo of your [dish name]?" prompt after dish selection. It appears only when a dish is selected AND no photos exist. Is this the right trigger condition? Should it also appear when no dish is selected (generic prompt), or would that dilute the contextual specificity that makes it compelling?

### 2. Confidence Indicator Completeness
Sprint 603 added confidence pills to HeroCard (#1), matching RankedCard (#2+). Other surfaces still lack confidence indicators: business detail page hero, discover/search cards, challenger cards. Should we systematically add confidence to ALL business displays, or is the leaderboard sufficient since that's where ranking comparisons happen?

### 3. Receipt Proof List — Trust vs Friction
Sprint 604 replaced a one-line hint with a three-item proof list ("Proves you visited", "Confirms date", "Gets 25% more weight"). The proof list disappears after receipt upload. Does showing explicit weight percentage (+25%) risk gaming behavior (users uploading fake receipts for the boost), or is transparency about weighting a net trust positive?

### 4. RatingExtrasStep Growth Pattern
RatingExtrasStep went from 541→629 LOC across sprints 602-604 (dish nudge + receipt UX). It was 396 LOC when first extracted (Sprint 172). Is the "extras step" concept too broad? It handles 5 concerns: dish selection, note input, photo upload, receipt upload, score summary. Should it be decomposed into a multi-card layout where each concern is a separate component?

### 5. Core-Loop Sprint Cadence
12 sprints without core-loop work (591-602), then 3 consecutive core-loop sprints (602-604). The new policy is "max 3 infrastructure sprints before a core-loop sprint." Is this policy sufficient, or should every sprint cycle include at least one core-loop improvement alongside infrastructure?
