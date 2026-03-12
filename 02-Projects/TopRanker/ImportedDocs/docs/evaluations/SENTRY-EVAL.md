# Error Monitoring Vendor Evaluation — Sprint 121

**Date**: 2026-03-08
**Owner**: Marcus Chen (CTO), Nadia Kaur (Cybersecurity)
**Status**: APPROVED — Sentry

---

## Executive Summary

TopRanker requires production error monitoring to replace ad-hoc `console.error` calls with
structured error capture, alerting, and release tracking. This evaluation compares three
industry-standard vendors: Sentry, Bugsnag, and Datadog.

**Decision: APPROVED — Sentry** is selected as TopRanker's error monitoring platform.

---

## Vendor Comparison

### Sentry

| Criteria | Detail |
|---|---|
| **Free Tier** | 5K errors/month, 1 user, 30-day retention |
| **React Native SDK** | @sentry/react-native — first-class Expo support |
| **Node.js SDK** | @sentry/node — Express middleware integration |
| **Source Maps** | Automatic upload via sentry-expo plugin |
| **Breadcrumbs** | Automatic navigation, network, console breadcrumbs |
| **Release Tracking** | Built-in release health, crash-free rate |
| **Performance** | Transaction tracing included in free tier |
| **Privacy Controls** | beforeSend hook, PII scrubbing, data scrubbing rules |
| **Pricing (Paid)** | Team: $26/mo for 50K errors |

### Bugsnag

| Criteria | Detail |
|---|---|
| **Free Tier** | 7.5K events/month, 1 user |
| **React Native SDK** | @bugsnag/react-native — requires native linking |
| **Node.js SDK** | @bugsnag/node — Express plugin |
| **Source Maps** | Manual upload or CI plugin |
| **Breadcrumbs** | Manual breadcrumb API |
| **Release Tracking** | Basic release tracking |
| **Performance** | Not included — separate product |
| **Privacy Controls** | beforeNotify callback, metadata filtering |
| **Pricing (Paid)** | Team: $59/mo for 25K events |

### Datadog

| Criteria | Detail |
|---|---|
| **Free Tier** | 14-day trial only, no permanent free tier |
| **React Native SDK** | @datadog/mobile-react-native — newer, less mature |
| **Node.js SDK** | dd-trace — APM-focused, error tracking secondary |
| **Source Maps** | CLI upload tool |
| **Breadcrumbs** | RUM (Real User Monitoring) integration |
| **Release Tracking** | Deployment tracking via CI/CD |
| **Performance** | Full APM suite (overkill for current stage) |
| **Privacy Controls** | Data scrubbing rules, PII detection |
| **Pricing (Paid)** | $31/mo per host + $1.70 per 1M RUM sessions |

---

## Decision Matrix

| Criteria (Weight) | Sentry | Bugsnag | Datadog |
|---|---|---|---|
| Free tier adequacy (30%) | 5/5 — 5K errors/month sufficient for launch | 5/5 — 7.5K generous | 1/5 — no free tier |
| React Native / Expo support (25%) | 5/5 — first-class Expo plugin | 3/5 — requires native linking | 2/5 — newer SDK |
| Node.js integration (15%) | 5/5 — Express middleware | 4/5 — Express plugin | 4/5 — APM focused |
| Privacy controls (15%) | 5/5 — beforeSend, PII scrubbing | 4/5 — beforeNotify | 4/5 — data scrubbing |
| Ecosystem & community (15%) | 5/5 — largest OSS community | 3/5 — smaller community | 4/5 — enterprise focused |
| **Weighted Score** | **5.0** | **3.85** | **2.65** |

---

## Privacy Requirements

- **No PII in error reports**: Strip user email, name, and session tokens from breadcrumbs
- **beforeSend hook**: Filter sensitive data before transmission
- **Data scrubbing**: Enable Sentry's built-in PII scrubbing rules
- **GDPR compliance**: Sentry is EU-US Data Privacy Framework certified
- **User context**: Use anonymized member ID only (no email, no name)

---

## Integration Plan

### Phase 1 — SDK Integration (Sprint 122)
- Install `@sentry/react-native` for client-side error capture
- Install `@sentry/node` for server-side error capture
- Create `lib/error-reporting.ts` — replace `console.error` calls with `Sentry.captureException`
- Configure `beforeSend` hook to strip PII
- Add Sentry DSN to environment variables

### Phase 2 — Dashboard & Alerts (Sprint 123)
- Configure alert rules: P0 (>10 errors/min), P1 (>50 errors/hour)
- Set up Slack integration for P0 alerts
- Create error budget dashboard
- Configure release tracking with git commit SHAs

### Phase 3 — Performance Monitoring (Sprint 124)
- Enable transaction tracing for critical API endpoints
- Set performance budgets: API response <200ms p95
- Add custom spans for database queries

---

## Cost Projection

| Stage | Monthly Errors (est.) | Tier | Cost |
|---|---|---|---|
| Launch (Month 1-3) | <2K | Free | $0 |
| Growth (Month 4-6) | 3K-5K | Free | $0 |
| Scale (Month 7-12) | 10K-50K | Team | $26/mo |

---

## Risks & Mitigations

1. **SDK bundle size**: @sentry/react-native adds ~200KB — acceptable for our target
2. **Rate limiting**: Free tier's 5K/month could be exhausted by noisy errors — add client-side sampling
3. **Vendor lock-in**: Sentry is open-source (self-hostable) — migration path exists

---

**Approved by**: Marcus Chen (CTO), Nadia Kaur (Cybersecurity)
**Next action**: SDK integration in Sprint 122
