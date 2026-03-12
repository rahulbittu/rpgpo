# Retro 498: storage/businesses.ts Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Clean extraction with minimal test redirects. Only 1 test file needed updating (sprint493), compared to 12 redirects in the Sprint 491 route extraction. The re-export pattern saved us."

**Sarah Nakamura:** "businesses.ts goes from 94.9% to 79.3% of threshold. That's comfortable headroom — we won't need to touch this file for extraction again for several sprints."

**Marcus Chen:** "Three new storage modules now: businesses.ts (core), dishes.ts (dish leaderboards + autocomplete), photos.ts (photo management). Each has a clear domain boundary."

## What Could Improve

- **Re-export adds indirection** — the photo re-export from businesses.ts means consumers can import from either path. Could cause confusion. A future cleanup could update all imports to go directly to photos.ts.
- **No storage/index.ts update** — the re-export chain (index → businesses → photos) works but is one more hop than necessary.

## Action Items

- [ ] Sprint 499: Notification open tracking — **Owner: Sarah**
- [ ] Sprint 500: Governance (SLT-500 + Audit #58 + Critique) — **Owner: Sarah**

## Team Morale
**8/10** — Satisfying extraction sprint. File health is back in comfortable range. One sprint left before governance at 500.
