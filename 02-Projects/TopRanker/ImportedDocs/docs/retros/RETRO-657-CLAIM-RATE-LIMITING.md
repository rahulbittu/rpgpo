# Retro 657: Claim Verification Rate Limiting

**Date:** 2026-03-11
**Duration:** 8 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Nadia Kaur:** "Finally resolved after two audit carry-forwards. Three-layer defense in depth: code entropy, attempt lockout, IP rate limiting. This is production-ready security."
- **Marcus Chen:** "2 lines of code change + 1 line import. The rate-limiter infrastructure we built in Sprint 105 pays dividends — new limiters are trivial to add."
- **Amir Patel:** "Pluggable store architecture means this works with in-memory now and Redis in production. Zero configuration needed."
- **Sarah Nakamura:** "Build size increase is negligible — 0.2kb. The rate limiter was already bundled; we just imported one more constant."

## What Could Improve
- Should have shipped this in Sprint 650 when first flagged, not carried for two cycles.
- Need a policy for max carry-forward duration on security findings — suggest escalating after 1 cycle.
- Consider adding rate limiting to the claim submission endpoint too (`POST /api/businesses/:slug/claim`).

## Action Items
- [ ] Add rate limiting to claim submission endpoint (Owner: Nadia)
- [ ] Establish policy: security findings escalate to P1 after 1 carry-forward (Owner: Marcus)
- [ ] Verify rate limiting works in Railway production environment (Owner: Sarah)

## Team Morale
8/10 — Satisfying to close a long-standing security item. Short sprint with high impact.
