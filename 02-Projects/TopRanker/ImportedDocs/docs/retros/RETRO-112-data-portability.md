# Retrospective — Sprint 112

**Date**: 2026-03-08
**Duration**: 1 session
**Story Points**: 17
**Facilitator**: Sarah Nakamura

---

## What Went Well

**Jordan Blake**: "Full GDPR coverage in two sprints. Article 17 deletion shipped in Sprint
109, Article 20 portability ships today. That's the two hardest operational rights handled
before we even have paying enterprise customers asking for them. When a prospect's legal team
asks 'do you support data portability?' the answer is yes, with a live endpoint, not a
roadmap slide. Compliance as a competitive advantage."

**Amir Patel**: "The RateLimitStore interface abstraction was the cleanest refactor we've
done. The existing rate limiter logic didn't change — we just extracted the storage calls
behind an interface. MemoryStore passes every test the old hardcoded version did. RedisStore
implements the same contract with stubs. When Sprint 114 brings real Redis, the integration
is literally `new RedisStore(redisClient)` passed to the rate limiter constructor. TD-001
went from 'someday refactor' to 'config change away from done' in one sprint."

**Rachel Wei**: "Analytics persistence changes everything for business intelligence. Before
this sprint, a deploy wiped our funnel data. Now we flush every 30 seconds to durable
storage. I ran a test: server restart, check data, everything survived. For the first time
I can promise stakeholders that conversion metrics are reliable across deployments. The
schema is designed so the Sprint 114 database migration slots in without changing the flush
API."

**Sarah Nakamura**: "Rewriting 18 rate limiter tests for async store patterns was tedious but
necessary. The old tests silently passed because everything was synchronous — they would have
given false greens with a real Redis store. Now every test properly settles microtasks before
asserting. We caught two timing bugs in the TTL expiry logic that were masked by synchronous
execution. The test suite is actually more correct now than it was before the refactor."

---

## What Could Improve

- **Redis integration is still a stub** — The `RateLimitStore` interface and `RedisStore` stub
  are architecturally ready, but we haven't connected a real Redis instance. Sprint 114 needs
  to bring Redis into the dev environment and validate the store under real network latency.
  The fail-open design is untested against actual connection failures.

- **Analytics flush needs a real database connection** — The 30-second flush currently writes
  to a file-based store. This is durable enough for single-server deployments but won't scale
  to multiple instances. Sprint 114's database migration needs to replace the file store with
  a proper database table. The schema is ready; the connection plumbing is not.

- **Deletion grace period needs a background job** — DELETE `/api/account` executes immediately.
  GDPR allows a 30-day grace period for account recovery, and enterprise customers will expect
  it. We need a background job system (or at minimum a cron-based approach) that marks accounts
  for deletion and purges after 30 days. This is a Sprint 114-115 scope item that Jordan has
  flagged as important for enterprise readiness.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Deploy Redis to dev environment and validate RedisStore under real latency | Amir + Sarah | 114 |
| Replace file-based analytics store with database table | Rachel + Amir | 114 |
| Implement 30-day deletion grace period with soft-delete pattern | Jordan + Sarah | 114-115 |
| Add profile screen UI button for data export download | Leo | 113-114 |
| Stress test fail-open rate limiter behavior under Redis connection loss | Nadia | 114 |
| Add Sprint 112 entry to CHANGELOG.md | Jasmine | 113 |

---

## Team Morale

**9/10** — High confidence across the team. Three infrastructure milestones landed in a single
sprint: GDPR portability closes our last major compliance gap, the rate limiter architecture
resolves the longest-standing tech debt item, and analytics persistence means business
intelligence data finally survives restarts. The Sprint 114 Redis + database migration is
well-scoped and feels achievable rather than daunting because the interfaces are already in
place. Team energy is strong heading into Sprint 113.
