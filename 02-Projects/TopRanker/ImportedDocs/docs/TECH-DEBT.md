# Technical Debt Registry

**Owner**: Marcus Chen (CTO)
**Last Updated**: 2026-03-10 (Sprint 572)

> **Note**: This document was last comprehensively maintained through Sprint 129. Active debt items below may be resolved. Current debt tracking is primarily handled through sprint retros (`docs/retros/`), arch audits (`docs/audits/`), and SLT meetings (`docs/meetings/`). Items marked with target sprints before Sprint 200 should be considered historical.

---

## Active Debt

### HIGH Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-001 | Rate limiter needs Redis for multi-instance | MemoryStore default works, RedisStore stub ready | Amir Patel | 114 |

### MEDIUM Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-005 | L3: Mock data in lib/api.ts | Dev fallback could confuse new developers | Engineering | Deferred |
| TD-006 | CSP may need expansion | New integrations may break under current policy | Nadia Kaur | As needed |
| TD-007 | Cookie consent "Learn more" links to privacy but no deep-link to cookies section | Minor UX gap | Jordan Blake | 107 |
| TD-011 | E2E tests need broader coverage | Basic E2E done (Sprint 108), need more endpoint coverage | Sarah Nakamura | Gradual |
| TD-013 | Paginated ratings may omit logged-in user's own rating from first page | "Your Previous Rating" card won't render on business detail page — user sees "Rate This Place" instead of "Update Your Rating", causing UX confusion. Not currently hitting this at low rating counts but will matter at scale. Mitigation options: (1) Separate API call for user's own rating, (2) Server-side injection of user's rating into first page, (3) Client-side secondary fetch | Sarah Nakamura | Future |

### LOW Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-008 | Inline rgba values in _layout.tsx | Should use BRAND.colors.amberGlow | Leo Hernandez | 108 |
| TD-009 | #FFD700 in SubComponents.tsx | Should use BRAND.colors.gold | Leo Hernandez | 108 |
| TD-010 | Banner dismissal not synced across devices | AsyncStorage is local-only | Jasmine Taylor | Future |
| TD-012 | Test files use inline mocks instead of test-utils | Inconsistent test patterns, harder maintenance | Engineering | Gradual |

---

## Resolved Debt

| ID | Description | Resolved In | Resolution |
|----|-------------|-------------|------------|
| TD-R01 | No security headers | Sprint 104 | OWASP middleware added |
| TD-R02 | No CSP | Sprint 105 | 9-directive CSP added |
| TD-R03 | Inline rate limiter in routes.ts | Sprint 105 | Extracted to rate-limiter.ts |
| TD-R04 | No cookie consent | Sprint 105 | GDPR banner added |
| TD-R05 | Scattered pricing values | Sprint 104-105 | shared/pricing.ts + migration |
| TD-R06 | No typography system | Sprint 104-105 | constants/typography.ts + migration started |
| TD-R07 | Stale legal docs (80 sprints) | Sprint 104 | Terms + Privacy updated |
| TD-R08 | Typography not fully adopted | Sprint 107 | 22 styles migrated across 4 files; all components now use typography constants |
| TD-R09 | Frontend pricing scattered | Sprint 106-107 | All screens migrated to PRICING constants from shared/pricing.ts |
| TD-R10 | Rate limiter not pluggable | Sprint 112 | RateLimitStore interface, MemoryStore default, RedisStore stub |
| TD-R11 | No GDPR data portability | Sprint 112 | GET /api/account/export returns full user data as JSON |
| TD-R12 | Analytics events lost on restart | Sprint 112 | FlushHandler + setFlushHandler for periodic persistence |

---

## Process

- New debt items added during sprint retros or arch audits
- Reviewed by SLT every 5 sprints (see `docs/meetings/SLT-BACKLOG-*.md` for current reviews)
- HIGH items must be scheduled within 5 sprints
- MEDIUM items within 10 sprints
- LOW items at team discretion
