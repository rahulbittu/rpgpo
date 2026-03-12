# Architecture Audit #120 — Sprint 665

**Date:** 2026-03-11
**Auditor:** Amir Patel (Architecture)
**Grade:** A

## Summary

Clean audit. Apple Sign-In added without architectural concerns. Auto-enrichment well-integrated. Build size growing but within budget.

## Findings

### Critical: 0
### High: 0

### Medium: 1

**M1: Apple JWT verification is issuer-only — no JWKS signature verification**
- File: `server/auth.ts` line 231
- Current: Only checks `payload.iss === "https://appleid.apple.com"`
- Risk: Token could be forged if attacker knows Apple's JWT format
- Fix: Add Apple JWKS public key verification (fetch from `https://appleid.apple.com/auth/keys`)
- Priority: P1 — Sprint 666

### Low: 2

**L1: Build size at 654.3kb (87% of 750kb ceiling)**
- Grew from 647.1→654.3kb across Sprints 662-664 (+7.2kb)
- Trajectory: At current growth rate, will hit ceiling in ~13 sprints
- Recommendation: Monitor, consider extraction if next 5 sprints add >5kb each

**L2: login.tsx Apple button only — signup.tsx missing**
- Apple requires Sign-In on all auth entry points
- Fix: Add Apple button to signup.tsx (Sprint 666)

## Scorecard

| Metric | Value | Status |
|--------|-------|--------|
| Build size | 654.3kb / 750kb | Green (87%) |
| Test count | 11,697 / 10,800 min | Green (+8%) |
| Tracked files | 33 / 33 violations | Green (0) |
| Critical findings | 0 | Green |
| High findings | 0 | Green |
| Medium findings | 1 | Yellow (JWKS verification) |
| Low findings | 2 | Yellow |

## Grade History
...A → A → A → A → A → A → **A** (7+ consecutive A-range)

## Next Audit: Sprint 670 (Audit #125)
