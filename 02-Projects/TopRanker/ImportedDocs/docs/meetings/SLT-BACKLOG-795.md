# SLT Backlog Meeting — Sprint 795

**Date:** 2026-03-12
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Facilitator:** Marcus Chen

---

## Agenda

1. Sprint 791-794 Review
2. Remaining Audit Findings
3. TestFlight Status Update
4. Post-Hardening Strategy
5. Roadmap 796-800

---

## 1. Sprint 791-794 Review

| Sprint | Theme | Points | Status |
|--------|-------|--------|--------|
| 791 | Full permission audit | 1 | Shipped |
| 792 | Email template refactor to config.siteUrl | 2 | Shipped |
| 793 | CI-friendly lint checks (hardcoded domains, unguarded console) | 2 | Shipped |
| 794 | Session cleanup configuration | 1 | Shipped |

**Total:** 6 story points across 4 sprints. All shipped and tested.

**Sarah Nakamura:** "Four clean sprints. Permission audit (791) ensures App Store review won't flag undeclared permissions. Email refactor (792) eliminates domain drift across 4 email services. Lint checks (793) prevent regression. Session cleanup (794) completes the session management arc from 787-788."

**Amir Patel:** "The roadmap from SLT-790 is 100% delivered. Every sprint shipped on time with full test coverage. The codebase is in the best security posture it's ever been."

---

## 2. Remaining Audit Findings

From Arch Audit #790, three items remain:

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| M1 | MEDIUM | In-memory push token store has no size limit | Open — `tokens` Map grows unbounded |
| L1 | LOW | Email FROM address hardcoded in process.env fallback | Open — cosmetic, not a security risk |
| L2 | LOW | seed.ts uses Unsplash URLs | Open — dev-only, no production impact |

**Amir Patel:** "M1 is the only actionable item. The tokens Map in push-notifications.ts has no eviction policy. At scale, a compromised client could register thousands of tokens per member. I recommend adding a MAX_TOKENS_PER_MEMBER constant and evicting oldest when exceeded."

**Rachel Wei:** "L1 and L2 are cosmetic. I'd deprioritize them until after TestFlight feedback comes in."

**Marcus Chen:** "Agreed. M1 goes into the next roadmap. L1/L2 stay in backlog."

---

## 3. TestFlight Status Update

**Current state:** 95% ready

| Item | Status |
|------|--------|
| Server deployed on Railway | Done |
| All fetch calls have timeouts | Done (784) |
| Trust proxy enabled | Done (786) |
| Session security complete | Done (787-788-794) |
| Privacy manifests configured | Done |
| Permissions audited | Done (791) |
| Error boundaries in all tabs | Done |
| __DEV__ guards on all console logs | Done (782, 793) |
| Email templates use config.siteUrl | Done (792) |
| CI lint guards for regression | Done (793) |
| Session cleanup explicit | Done (794) |
| **BLOCKER: App Store Connect app** | CEO action required |
| **BLOCKER: EAS build + TestFlight submit** | Waiting on above |

**Marcus Chen:** "We've been at 94-95% for the last 10 sprints. Every sprint closes another hardening gap, but the actual blockers are the same: CEO operational tasks. The codebase is ready."

**Rachel Wei:** "Deadline is March 21 for TestFlight. That gives 9 days. The CEO tasks (App Store Connect + EAS build) should take 2-3 hours total."

---

## 4. Post-Hardening Strategy

**Marcus Chen:** "We've run 19 consecutive hardening sprints (776-794). The security posture is at 97/100. Every OWASP category is covered. What's our strategy after this?"

**Amir Patel:** "Diminishing returns. Each sprint is finding smaller issues. I recommend shifting to two modes:

1. **Reactive mode:** Fix what TestFlight users report. Real users find real bugs.
2. **Observability mode:** Add monitoring so we see problems before users do — error rates, response times, session counts, token store size."

**Sarah Nakamura:** "I'd add a third: **documentation mode.** The codebase is excellent but some operational runbooks are missing. How to deploy, how to rollback, how to check Railway logs."

**Rachel Wei:** "From a business perspective, the first real user feedback is more valuable than another 10 hardening sprints. Ship TestFlight, observe, iterate."

---

## 5. Roadmap 796-800

| Sprint | Theme | Points | Priority |
|--------|-------|--------|----------|
| 796 | Push token store size limit (M1) | 1 | Hardening |
| 797 | Email FROM address to config.ts (L1) | 1 | Consistency |
| 798 | Health check endpoint enhancements | 1 | Observability |
| 799 | Error rate tracking in structured logger | 1 | Observability |
| 800 | SLT + Audit + Critique | 0 | Governance |

**Marcus Chen:** "After Sprint 800, if TestFlight is submitted, we switch entirely to user-feedback-driven sprints."

---

## Decisions

1. **APPROVED:** Roadmap 796-800 as shown
2. **APPROVED:** M1 (push token size limit) → Sprint 796
3. **CONFIRMED:** Post-800 shift to reactive/user-feedback mode
4. **CONFIRMED:** TestFlight deadline March 21 — CEO operational tasks only remaining blockers

---

## Action Items

| Action | Owner | Deadline |
|--------|-------|----------|
| Create App Store Connect app | CEO | March 15 |
| Set ascAppId in eas.json | CEO | March 15 |
| Run EAS build | CEO | March 16 |
| Submit to TestFlight | CEO | March 21 |
| Push token size limit | Sprint 796 | Next sprint |
