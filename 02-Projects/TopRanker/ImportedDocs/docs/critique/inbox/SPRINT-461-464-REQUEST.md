# Critique Request: Sprints 461–464

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Export extraction, receipt prompts, bulk hours, note sentiment

## Context

Sprints 461–464 covered: P0 extraction (RatingExport), visit-type receipt prompts, admin bulk hours endpoint, and note sentiment indicators.

## Questions for External Review

### 1. Re-Export Pattern Longevity
Sprint 461 used re-exports in RatingExport.tsx to maintain backward compatibility after extracting utils. Sprint 456 did the same with DiscoverFilters. Are re-exports a bridge pattern that should be cleaned up after consumers migrate, or a permanent compatibility layer? What's the maintenance cost of keeping them indefinitely?

### 2. Keyword-Based Sentiment Accuracy
Sprint 464's note sentiment uses 53 hardcoded keywords. For 160-character notes about restaurants, is keyword matching sufficient? Edge cases: "not bad" would score as negative (matches "bad"), sarcasm ("amazing how terrible this was") would score as positive. Are these risks acceptable for a UX-only indicator, or do they undermine user trust?

### 3. Bulk Hours Validation Depth
Sprint 463 validates that periods have `open.day` (number) and `open.time` (string) but doesn't check ranges (day 0-6, time 0000-2359). A business could end up with `day: 99, time: "ABCD"`. Is shallow validation acceptable for an admin-only endpoint, or should we validate more strictly since the data directly affects user-facing features (open/closed badges)?

### 4. RatingExtrasStep Growth Pattern
RatingExtrasStep.tsx has grown from 515→582 LOC over 3 sprints (459, 462, 464). Each addition was small (2-50 LOC) but cumulative. The extraction is now P0. Is there a process improvement that would catch this earlier? Should we enforce a "net-zero LOC" rule for files above 90% threshold?

### 5. Enrichment Endpoint Auth — Third Time Asking
This is the third consecutive critique request flagging that admin enrichment endpoints lack auth middleware. Sprint 451-454, 456-459, and now 461-464. At what point does persistent non-action on a critique finding indicate it should be either resolved or explicitly accepted as a known risk?
