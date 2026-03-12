# Critique Request — Sprints 741-744

**Date:** 2026-03-12
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 741-744
**Theme:** Security Hardening — Crypto IDs, URL Centralization, Error Handling, Type Safety

---

## Summary of Changes

### Sprint 741: Crypto ID Standardization + Silent Error Recovery
- Replaced 6 `Math.random()` ID generators with `crypto.randomUUID()` / `crypto.randomInt()`
- Replaced 3 empty catch blocks with `__DEV__`-guarded error logging
- Sanitized business name in QR print window to prevent stored XSS
- Files: `server/security-headers.ts`, `server/rate-limit-dashboard.ts`, `server/alerting.ts`, `server/abuse-detection.ts`, `server/storage/claims.ts`, `app/_layout.tsx`, `app/(tabs)/index.tsx`, `app/business/qr.tsx`
- 30 tests

### Sprint 742: URL Centralization
- Added `SHARE_BASE_URL` constant to `lib/sharing.ts` (client-side)
- Added `config.siteUrl` to `server/config.ts` (server-side)
- Replaced 5 hardcoded client URLs and 4 hardcoded server URLs
- Files: `lib/sharing.ts`, `app/business/qr.tsx`, `lib/hooks/useSearchActions.ts`, `server/config.ts`, `server/routes-seo.ts`, `server/prerender.ts`, `server/routes-qr.ts`, `server/routes-payments.ts`, `server/unsubscribe-tokens.ts`, `server/routes-referrals.ts`
- 27 tests

### Sprint 743: Empty Catch Block Elimination
- Replaced 11 empty catch blocks across `app/`, `lib/`, `components/`
- Each catch now logs with `__DEV__`-guarded `console.warn("[Tag] Description:", e)`
- Also gated 1 unguarded `console.warn` in `lib/audio-engine.ts`
- 39 tests

### Sprint 744: Server Type Safety + Structured Logging
- New `SearchBusinessRecord` + `EnrichedSearchResult` interfaces
- Eliminated 8 `as any` casts in search-result-processor.ts
- Migrated og-image.ts from `console.error` to structured `log.tag("OG-Image")`
- Cleaned up 3 remaining empty catch blocks in `lib/sharing.ts`
- 20 tests

---

## Questions for Reviewer

1. **Crypto IDs:** We use `crypto.randomUUID()` for request/event IDs and `crypto.randomInt()` for 6-digit verification codes. Is there any scenario where the added overhead of crypto RNG matters for request IDs?

2. **URL centralization:** Client uses a static `SHARE_BASE_URL` constant (always production domain). Server uses `config.siteUrl` (env-configurable). Is this dual-constant pattern appropriate, or should both sides read from a single source?

3. **Empty catch logging pattern:** We chose `if (__DEV__) console.warn("[Tag]:", e)` — dev-only, tagged, minimal. Should we also track these in Sentry/analytics for production monitoring?

4. **Search pipeline typing:** `SearchBusinessRecord` covers fields we access, but the DB query may return additional fields via `...b` spread. Should we use a stricter type that excludes unknown fields?

5. **Email template URLs:** Still hardcoded. What's the recommended approach — template variables, a shared constant, or a URL builder function?

---

## Health Metrics

| Metric | Sprint 740 | Sprint 744 | Delta |
|--------|-----------|-----------|-------|
| Tests | 12,746 | 12,862 | +116 |
| Test files | 548 | 552 | +4 |
| Build size | 663.0kb | 663.0kb | 0 |
| Math.random() IDs | 6 | 0 | -6 |
| Hardcoded URLs (key paths) | 9 | 0 | -9 |
| Empty catch blocks | 14 | 0 | -14 |
| `as any` in search pipeline | 8 | 0 | -8 |

---

## Awaiting Response

Response expected in: `docs/critique/outbox/SPRINT-741-744-RESPONSE.md`
