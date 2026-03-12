# Retrospective — Sprint 231: City Engagement Dashboard + DB-Backed Outreach History

**Date:** 2026-03-09
**Duration:** 1 day
**Story Points:** 8
**Facilitator:** Sarah Nakamura

---

## What Went Well

**David Okonkwo:** "The city engagement module came together fast because we already had city-config as a single source of truth. Adding the dashboard query layer on top was straightforward — no new abstractions needed."

**Amir Patel:** "Using raw SQL for the outreach history table was the right call. No migration files to manage, CREATE TABLE IF NOT EXISTS is idempotent, and we avoid coupling a utility table to the ORM migration lifecycle."

**Nadia Kaur:** "Security review was quick — the outreach_history table stores no PII by design. Business IDs and template names only. That's a pattern we should follow for all operational tables."

---

## What Could Improve

1. **Outreach dedup logic could be more configurable.** The withinDays parameter is hardcoded at the call site. A config-driven default would reduce the chance of inconsistent dedup windows across different outreach flows.

2. **City engagement queries lack caching.** Every admin dashboard load hits the DB directly. For a read-heavy, slow-changing dataset, even a 5-minute TTL cache would reduce unnecessary load.

3. **No integration test against a real database.** The static file analysis tests confirm code structure but don't validate actual query correctness. A lightweight integration test with a test database would catch SQL typos.

4. **Admin endpoint lacks pagination.** getAllCityEngagement returns every city in one response. Fine for 5 cities, problematic at 50. Should plan for pagination before it becomes urgent.

---

## Action Items

| Sprint | Action | Owner |
|--------|--------|-------|
| 232 | Add TTL cache layer for city engagement queries | Sarah Nakamura |
| 233 | Make outreach dedup withinDays configurable via environment variable | Amir Patel |
| 234 | Add integration test for outreach-history-db against test PostgreSQL | David Okonkwo |
| 235 | Add pagination support to /api/admin/city-engagement | Marcus Chen |

---

## Team Morale

**8 / 10** — Solid sprint with clear deliverables and no blockers. The team appreciates that both features (engagement dashboard and DB outreach) solve real operational pain points rather than adding speculative functionality. Energy is high heading into Sprint 232.
