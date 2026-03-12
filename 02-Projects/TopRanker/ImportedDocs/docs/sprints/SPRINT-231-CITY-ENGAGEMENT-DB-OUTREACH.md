# Sprint 231 — City Engagement Dashboard + DB-Backed Outreach History

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete
**Facilitator:** Sarah Nakamura

---

## Mission Alignment

Sprint 231 adds data-driven city management. The engagement dashboard shows per-city member counts, rating volume, and top categories — enabling the team to decide when to promote OKC and NOLA from beta. DB-backed outreach history survives server restarts, making the email dedup system production-ready.

---

## Team Discussion

**David Okonkwo (Growth):** City engagement dashboard gives us the data to make promotion decisions. OKC at 50 signups? Promote. NOLA lagging? Investigate. We can finally stop guessing which cities are ready for full launch and let the numbers speak.

**Sarah Nakamura (Lead Engineering):** DB outreach history replaces in-memory store. Same API (record, check, get), backed by PostgreSQL. Server restarts don't lose contact history. The migration is seamless — ensureOutreachHistoryTable is idempotent, so existing deployments pick it up automatically.

**Marcus Chen (CTO):** Admin gets /api/admin/city-engagement with per-city or all-cities view. Clean REST pattern. Pass ?city=okc for a single city or omit for the full dashboard. Response shape is consistent either way — array of CityEngagement objects.

**Rachel Wei (CFO):** Engagement data drives resource allocation. High-engagement cities get more seed data and marketing spend. Low-engagement cities get targeted outreach before we invest further. This is the financial feedback loop we've been missing.

**Amir Patel (Architecture):** ensureOutreachHistoryTable uses raw SQL to avoid migration overhead. CREATE TABLE IF NOT EXISTS is idempotent. The index on (business_id, template_name) keeps dedup queries fast even at scale. No ORM abstraction needed for a utility table.

**Nadia Kaur (Cybersecurity):** Outreach history table has no PII — just business IDs and template names. Safe to query from admin dashboard without additional access controls beyond the existing admin auth middleware. Reviewed the schema and confirmed no email addresses or contact details are stored.

---

## Deliverables

### City Engagement Module (`server/city-engagement.ts`)
- `getCityEngagement(city)` — returns member count, business count, rating volume, avgRatingsPerMember, and top categories for a single city
- `getAllCityEngagement()` — returns engagement data for all configured cities
- Imports city list from `city-config`, queries members and businesses tables
- CityEngagement interface defines the response shape

### DB-Backed Outreach History (`server/outreach-history-db.ts`)
- `ensureOutreachHistoryTable()` — creates outreach_history table with CREATE TABLE IF NOT EXISTS
- `recordOutreachSentDb(businessId, templateName)` — inserts a record
- `hasOutreachBeenSentDb(businessId, templateName, withinDays)` — checks for recent outreach within interval
- `getOutreachHistoryDb(businessId?)` — retrieves history, optionally filtered by business
- Index on (business_id, template_name) for fast dedup lookups

### Admin Endpoint (`server/routes-admin.ts`)
- GET `/api/admin/city-engagement` — returns all cities or single city via `req.query.city`
- Imports getCityEngagement and getAllCityEngagement

---

## Tests

- **22 new tests** in `tests/sprint231-city-engagement-db-outreach.test.ts`
  - 8 city engagement module tests
  - 8 DB outreach history tests
  - 4 admin endpoint wiring tests
  - 2 integration tests
- **Full suite:** 4,264+ tests across 161 files
