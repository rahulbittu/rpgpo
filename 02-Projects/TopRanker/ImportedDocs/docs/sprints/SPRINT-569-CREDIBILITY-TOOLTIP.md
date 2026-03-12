# Sprint 569: Credibility Breakdown Tooltip

**Date:** 2026-03-10
**Story Points:** 2
**Status:** Complete
**Tests:** 24 new (10,744 total across 459 files)

## Mission

Surface the credibility breakdown data that's been flowing from the server since Sprint 448 but was never displayed to users. When a user taps their credibility score on the profile page, an expandable tooltip reveals how each factor (base, volume, diversity, age, consistency, detail, penalties) contributes to their total score. This makes the credibility system transparent — Constitution principle #6.

## Team Discussion

**Marcus Chen (CTO):** "Transparency is a core principle. We compute credibility breakdown on every profile load but never showed it. Users could see their score and tier but not _why_. This tooltip closes that gap — tap your score to see exactly what's contributing."

**Sarah Nakamura (Lead Eng):** "The tooltip is a 202 LOC component with 7 FactorRows, each showing an icon, label, description, progress bar, and point value. The FACTORS config array makes it easy to add new factors later. The component is completely controlled — visible prop from parent, no internal state."

**Amir Patel (Architecture):** "ProfileCredibilitySection grew from 246 to 258 LOC — just the import, state toggle, TouchableOpacity wrapper, and render block. The credibilityBreakdown prop was already `any` typed; we upgraded it to the proper `CredibilityBreakdown` interface. No new API calls needed."

**Jordan Blake (Compliance):** "Credibility transparency is a trust differentiator. Users seeing 'Penalties: 0' proves the system is fair. Users seeing 'Volume: +18' shows them what to do to grow. This reduces 'why is my score low?' support tickets."

**Nadia Kaur (Cybersecurity):** "Per the Rating Integrity doc Part 10 — NO public individual weight display. This tooltip shows the score breakdown to the user about _their own_ score only. Other users' breakdowns are never exposed. Compliant."

## Changes

### New: `components/profile/CredibilityBreakdownTooltip.tsx` (202 LOC)
- `CredibilityBreakdown` interface: base, volume, diversity, age, variance, helpfulness, penalties
- `CredibilityBreakdownTooltipProps`: breakdown, totalScore, visible
- 7-factor FACTORS config with label, icon, description per factor
- `FactorRow` helper: icon + label + description + progress bar + point value
- Penalties shown in red with minus prefix
- Header: "Score Breakdown" with computed total
- Footer: growth guidance text
- FadeInDown animation, returns null when not visible

### Modified: `components/profile/ProfileCredibilitySection.tsx` (246→258 LOC, +12)
- Added import for CredibilityBreakdownTooltip and CredibilityBreakdown type
- Added useState for showBreakdown toggle
- Upgraded credibilityBreakdown prop from `any` to `CredibilityBreakdown`
- Wrapped score in TouchableOpacity to toggle tooltip
- Renders CredibilityBreakdownTooltip inside credibility card

### Modified: `shared/thresholds.json`
- Added CredibilityBreakdownTooltip.tsx: maxLOC 210, current 202
- Tests: currentCount 10719→10744

## Test Summary

- `__tests__/sprint569-credibility-tooltip.test.ts` — 24 tests
  - Tooltip component: 16 tests (export, interfaces, props, factors, factor rows, bars, values, penalties, computed total, header, footer, animation, null guard, LOC)
  - Profile integration: 8 tests (import, type import, typed prop, state toggle, tap handler, renders, props passed, accessibility)
