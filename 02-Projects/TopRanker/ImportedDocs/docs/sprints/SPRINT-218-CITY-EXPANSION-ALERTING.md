# Sprint 218 — City Expansion Config + Alerting Infrastructure

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Sprint 218 builds the foundation for geographic scale and operational resilience. The city registry provides a single source of truth for expansion planning — coordinates, status, minimum business counts. The alerting module provides server-side alert rules with cooldown, acknowledgment, and severity classification. Together they prepare TopRanker for growth beyond the Texas launch market.

## Team Discussion

**Marcus Chen (CTO):** "City expansion is our growth lever. The product works for Dallas — now we need the infrastructure to launch in new markets without code changes. The city registry is that infrastructure: add a JSON entry, run the seeder, the app adapts automatically."

**David Okonkwo (VP Product):** "I've mapped the first expansion wave: Oklahoma City and New Orleans. Both have strong food cultures, underserved by existing review platforms, and overlap with our Texas user base for cross-city discovery. The registry marks them as 'planned' — when we're ready, flip to 'active' and seed businesses."

**Rachel Wei (CFO):** "Each new city is a revenue multiplier. Featured Placement is city-scoped — $199/week per city. Five active cities means 5x the placement inventory. The city config's `minBusinesses` field ensures we don't launch in a city until it has enough content to feel populated."

**Amir Patel (Architecture):** "The alerting module follows our established pattern: in-memory with configurable persistence. Five default rules cover the critical production scenarios: health check failure, high error rate, slow responses, memory pressure, and rate limit spikes. Cooldown prevents alert storms. Phase 2 adds PagerDuty/Slack channels."

**Sarah Nakamura (Lead Eng):** "The city config centralizes what was previously scattered across lib/city-context.tsx, server/seed-cities.ts, and hardcoded strings. Now there's one import for city names, coordinates, timezones, and status. The alerting module integrates with our existing logger — alerts appear in the same log stream as requests."

**Nadia Kaur (Security):** "Alerting is the missing piece of our security posture. We had monitoring (perf-monitor, error-tracking) but no alert dispatch. Now when a critical threshold is breached, the system fires an alert with cooldown to prevent spam. The admin endpoint lets the team acknowledge and clear alerts."

**Jasmine Taylor (Marketing):** "The city registry gives me a marketing roadmap. Active cities get full press coverage. Planned cities get teaser campaigns. The coordinates power location-based ad targeting. When Oklahoma City flips to active, I have the launch playbook from Dallas ready to execute."

**Jordan Blake (Compliance):** "City expansion may trigger state-specific privacy laws. Oklahoma has different data residency requirements than Texas. The registry's state/stateCode fields enable compliance checks before launch. No new user data collection in this sprint."

## Deliverables

### City Expansion Registry (`shared/city-config.ts`)
- 7 cities: 5 active (Dallas, Austin, Houston, San Antonio, Fort Worth), 2 planned (OKC, New Orleans)
- Per-city: name, state, region, timezone, coordinates, status, launch date, min businesses
- Helper functions: getActiveCities(), getPlannedCities(), getCityConfig(), isCityActive(), getCityStats()
- Single source of truth for all city-related configuration

### Alerting Infrastructure (`server/alerting.ts`)
- 5 default alert rules: health_check_failed, high_error_rate, slow_response, high_memory, rate_limit_spike
- Alert firing with cooldown (prevents storm)
- In-memory alert store (200 max)
- Alert acknowledgment
- Stats: total, unacknowledged, by severity, last alert timestamp
- Console channel (Phase 1), PagerDuty/Slack/email channels (Phase 2)

## Tests

- 30 new tests in `tests/sprint218-city-expansion-alerting.test.ts`
- Full suite: **3,950+ tests across 148 files, all passing**
