# SPRINT 611-614 External Critique Request

**Date:** 2026-03-11
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprints covered:** 611 (map rate CTA + analytics), 612 (photo verification badge), 613 (business detail confidence), 614 (search suggestions refresh)

## Context

Four sprints: 3 core-loop (map CTA, photo badges, confidence) + 1 infrastructure (suggestions refresh). Build size grew to 733.4kb/750kb (97.8%) — approaching ceiling.

## Previous Critique Response Status

606-609 pending. 601-604 pending. 596-599 pending. 591-594 response received and incorporated. Multiple pending — need watcher attention.

## 5 Questions for External Review

### 1. Analytics Event Granularity
Sprint 611 added two analytics events: `rate_cta_discover_tap` (with surface: card/map_card) and `share_whatsapp_tap` (with context: confirmation/business_detail/dish_leaderboard). Is this granularity sufficient? Should we track intermediate steps (e.g., share_prompt_viewed, rate_cta_visible) or is action-only tracking the right approach?

### 2. Photo Verification Badge Color Choice
Sprint 612 uses blue (rgba(59,130,246,0.85)) for photo verification and green for receipt verification. The business detail confidence indicator (Sprint 613) also uses green for VERIFIED RANKING. Is the color language consistent enough? Could blue for photos and green for receipts/rankings confuse users about what "verified" means?

### 3. Build Size Ceiling Pressure
Server build went from 730.0kb to 733.4kb with search suggestions refresh. At 97.8%, the 750kb ceiling is tight. Options: (a) raise the ceiling to 800kb, (b) prune dead code to recover headroom, (c) split rarely-used admin routes into lazy imports. Which approach is best for long-term health?

### 4. Search Suggestions Refresh Strategy
Sprint 614 refreshes ALL cities every 30 minutes. At scale (50+ cities), this becomes expensive. Should it track which cities have changed (via a `last_modified` timestamp on businesses) and only refresh those? Or is the brute-force approach acceptable until proven slow?

### 5. Confidence Indicator Completeness
Sprints 603 + 613 add confidence indicators to HeroCard, RankedCard, BusinessCard, and business detail. Is every high-traffic surface covered? What about: search result autocomplete, notification content (e.g., "your favorite place just got VERIFIED"), or the share preview card? Should confidence extend beyond ranking surfaces?
