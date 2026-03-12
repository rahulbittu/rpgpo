# SPRINT 606-609 External Critique Request

**Date:** 2026-03-11
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprints covered:** 606 (receipt extraction), 607 (in-memory docs), 608 (share prompt), 609 (rate CTA)

## Context

Four sprints: 2 infrastructure (receipt extraction + in-memory docs) + 2 core-loop (share prompt + rate CTA). The share prompt and rate CTA both reduce friction in the rate → share → discover loop.

## Previous Critique Response Status

601-604 critique request pending response. 596-599 also pending. 591-594 response received. Maintaining the rhythm.

## 5 Questions for External Review

### 1. WhatsApp Share Text Effectiveness
Sprint 608 generates "I just rated [business] for [dish] in [city]!" for WhatsApp sharing. The dish-specific variant is designed to trigger debate. Is "I just rated" the right framing? Alternatives: "Is [business] the best [dish] in [city]?" (question), "[business] just got a new rating for [dish] in [city]" (news), "My pick for [dish] in [city]: [business]" (endorsement). Which framing maximizes shares-to-taps?

### 2. Rate CTA Placement on Cards
Sprint 609 adds "Rate this" at the bottom of BusinessCard, below the info section. Should it be more prominent (e.g., in the photo strip overlay like the bookmark button), or is bottom-of-card the right position for a secondary action? Too prominent could make the card feel like it's selling something; too subtle and no one taps it.

### 3. Extraction Timing — Proactive vs Reactive
Sprint 606's receipt extraction was reactive — triggered by RatingExtrasStep hitting 97% capacity (629/650). Should we extract proactively at 70-80% capacity instead? The cost of extraction is low (1-2 sprint points) but the risk of hitting capacity during a feature sprint is higher (blocks progress).

### 4. In-Memory Store Count
Sprint 607 documented 21 in-memory stores across the server. Is this too many for a single-process Node.js server? Most have capacity limits, but several are unbounded (photo hash, pHash, WebSocket connections). Should we mandate capacity limits for ALL stores, or accept that some grow with usage?

### 5. Share-to-Rate Pipeline
Sprints 608 + 609 create a loop: rate → share → discover → rate. But there's a gap: the shared WhatsApp link goes to the business page, not the rate page. Should the shared link include a `?action=rate` parameter that auto-opens the rate flow, closing the loop completely? Or does that feel too aggressive for a new user clicking a shared link?
