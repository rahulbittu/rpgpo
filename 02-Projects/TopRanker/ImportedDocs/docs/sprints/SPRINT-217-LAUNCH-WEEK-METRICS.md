# Sprint 217 — Launch Week Metrics + Retention Tracking

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

First data-driven sprint post-launch. Sprint 217 adds the launch metrics dashboard endpoint — a single API call that returns user activation rates, retention cohorts, revenue tracking against break-even, and daily trend data. This gives the SLT real-time visibility into whether the launch is succeeding.

## Team Discussion

**Marcus Chen (CTO):** "The launch metrics endpoint is the most important API we've built since the leaderboard. It answers three questions in one call: Are users signing up? Are they staying? Are we making money? The SLT reviews this daily during launch week."

**Rachel Wei (CFO):** "Revenue metrics track challenger entries, dashboard subscriptions, and featured placements — our three revenue streams. The endpoint calculates estimated MRR and compares against our $247/mo break-even target. When that boolean flips to true, we've validated the business model."

**Sarah Nakamura (Lead Eng):** "The endpoint computes activation rate (signup → first rating), deep engagement rate (first → fifth rating), and tier conversion rate (signup → tier upgrade). These are the three metrics that predict long-term retention. We also extended the analytics event types with retention_day1, retention_day3, and retention_day7 markers."

**Amir Patel (Architecture):** "The launch metrics endpoint aggregates from existing analytics infrastructure — funnel stats, daily stats, active users, and beta funnel. No new storage modules needed. It's a read-only view layer over data we already collect. routes-admin.ts grew by 55 LOC to 693, still below the 700 split threshold."

**Nadia Kaur (Security):** "The endpoint requires both requireAuth and requireAdmin — same security posture as all admin analytics. Rate limited to 30 req/min. No new attack surface. The estimated MRR calculation happens server-side to prevent client-side financial data manipulation."

**David Okonkwo (VP Product):** "Activation rate is our north star metric. If users sign up but never rate, the credibility system can't function. The deep engagement rate tells us if users understand the value proposition — you need 5+ ratings to see your credibility score change meaningfully. These metrics guide every post-launch product decision."

**Jasmine Taylor (Marketing):** "Daily trend data tells me which marketing channels are working. If we see signup spikes after a press mention or Product Hunt launch, I can double down. The retention markers help me time follow-up emails — day 1 welcome, day 3 nudge, day 7 recap."

**Jordan Blake (Compliance):** "No new data collection beyond what we already track. The retention events are derived from existing signup timestamps, not additional user tracking. No privacy policy update needed."

## Deliverables

### Launch Metrics Dashboard Endpoint
- `GET /api/admin/analytics/launch-metrics?days=7`
- Returns user metrics: signups, first ratings, fifth ratings, tier upgrades
- Activation rate: signup → first rating percentage
- Deep engagement rate: first → fifth rating percentage
- Tier conversion rate: signup → tier upgrade percentage
- Active users: 1h, 24h, 7d, 30d windows
- Revenue metrics: challenger entries, dashboard subs, featured purchases, estimated MRR
- Break-even tracking: $247/mo target with boolean met/not-met
- Beta funnel: invite → view → signup → rating with conversion rates
- Daily trend: per-day event counts + unique users

### Retention Event Types
- Added `retention_day1`, `retention_day3`, `retention_day7` to FunnelEvent types
- Enables cohort-based retention analysis

### routes-admin.ts Growth
- Added 55 LOC for launch metrics endpoint
- New total: ~693 LOC (below 700 split threshold)

## Tests

- 30 new tests in `tests/sprint217-launch-week-metrics.test.ts`
- Full suite: **3,921+ tests across 147 files, all passing**
