# Sprint 607: In-Memory Stores Documentation

**Date:** 2026-03-11
**Story Points:** 2
**Owner:** Amir Patel
**Status:** Done

## Mission

Document all in-memory stores in the server codebase. This has been carried over from Audit #595 through Audit #605 (3 consecutive audits). Three primary stores (photo hash, pHash, city dimension averages) plus 18+ secondary stores, all using native `Map<>` with no external cache library.

## Team Discussion

**Amir Patel (Architecture):** "Finally closing this. Three audits of 'document your in-memory stores' is three too many. The doc covers all 20+ Maps with their capacity, TTL, eviction strategy, and scaling triggers. The key insight: we have zero external cache dependencies, which is correct for single-server but needs Redis at horizontal scale."

**Nadia Kaur (Cybersecurity):** "The photo hash and pHash stores are anti-gaming critical. Documenting their preload-from-DB pattern matters — if someone adds a new anti-gaming store, they need to follow the same pattern. The doc makes this explicit."

**Sarah Nakamura (Lead Eng):** "21 in-memory stores across the server. More than I expected. The good news: most have hard capacity limits. The risk areas are the unbounded ones — photo hash, pHash, WebSocket connections. At current scale this is fine; the doc now has clear scaling triggers."

**Marcus Chen (CTO):** "This was overdue. The doc structure is right: primary stores (rating integrity) separated from secondary (infrastructure). The scaling triggers table at the bottom is the most valuable part — it tells us exactly when we need to act."

**James Park (Engineering):** "The restart behavior section is important. Developers need to know that rate limiter state is lost on restart. That's acceptable now but would be a problem with frequent deploys. Good to have it documented."

## Changes

### New File: `docs/architecture/IN-MEMORY-STORES.md`
- 3 primary stores documented in detail (photo hash, pHash, city dimension averages)
- 18 secondary stores documented in table format
- Patterns section: preload, no external cache, capacity management, restart behavior
- Scaling triggers table with clear action items

### Audit Finding Closed
- L1 from Audit #605 (3rd consecutive carry): "In-Memory Stores Documentation" — RESOLVED
- No code changes — docs-only sprint

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Tests | 11,325 | 11,325 | 0 |
| Server Build | 730.0kb | 730.0kb | 0 |
| Open audit LOW findings | 2 | 1 | -1 |
