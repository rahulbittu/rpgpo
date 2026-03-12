# Incident Response Runbook — TopRanker v1.0

**Owner:** Sarah Nakamura (Lead Eng)
**Last Updated:** 2026-03-09 (Sprint 216)

## Severity Levels

| Level | Definition | Response Time | Escalation |
|-------|-----------|---------------|------------|
| **SEV-1** | Service down, all users affected | 15 min | CTO + full team |
| **SEV-2** | Major feature broken, >50% impact | 30 min | Lead Eng + relevant team |
| **SEV-3** | Minor feature broken, <50% impact | 2 hours | Assigned engineer |
| **SEV-4** | Cosmetic/low-impact issue | Next sprint | Backlog |

## First Response (All Incidents)

1. **Verify:** Run `npx tsx scripts/smoke-test.ts <production-url>`
2. **Assess:** Check `/api/health` for uptime, memory, version
3. **Log:** Note time, symptoms, affected endpoints
4. **Communicate:** Post in #incidents channel with severity level

## SEV-1: Service Down

### Diagnosis
```bash
# Check if server is responding
curl -s <production-url>/api/health | jq .

# Check Railway deployment status
railway status

# Check recent deploys
git log --oneline -5

# Check error tracking
curl -s <production-url>/api/admin/errors?limit=10 -H "Cookie: <admin-session>"
```

### Resolution Steps
1. **If deployment caused:** Rollback immediately
   ```bash
   npx tsx scripts/rollback-checklist.ts
   git revert HEAD --no-edit
   git push origin main
   ```
2. **If database caused:** Check connection pool, restart if needed
3. **If memory caused:** Restart Railway service, investigate leak
4. **If external dependency:** Document, implement graceful degradation

### Post-Incident
- Run smoke tests to verify recovery
- Write incident report within 24 hours
- Schedule blameless retrospective

## SEV-2: Major Feature Broken

### Common Scenarios

#### Rankings not loading
1. Check `/api/leaderboard?city=dallas` response
2. Verify database connectivity via health check
3. Check for slow queries in perf stats

#### Authentication failing
1. Check `/api/auth/me` returns expected 401 or 200
2. Verify session cookie configuration
3. Check Google OAuth credentials (not expired)

#### Payments broken
1. Check Stripe dashboard for webhook failures
2. Verify STRIPE_SECRET_KEY is set in Railway
3. Check `/api/webhooks/stripe` endpoint accessibility

### Resolution
- Hotfix: Branch → fix → test → merge → deploy
- If fix >30 min: Consider feature flag / graceful degradation

## SEV-3/4: Minor Issues

- Log in GitHub Issues with appropriate labels
- Prioritize for next sprint
- Monitor for escalation

## Monitoring Commands

```bash
# Real-time monitoring (continuous)
npx tsx scripts/launch-day-monitor.ts <production-url> 30

# One-time health check
npx tsx scripts/launch-day-monitor.ts <production-url> --once

# Full smoke test
npx tsx scripts/smoke-test.ts <production-url>

# Security audit
npx tsx scripts/pre-launch-security-audit.ts

# Rollback safety check
npx tsx scripts/rollback-checklist.ts

# Launch readiness gate
npx tsx scripts/launch-readiness-gate.ts
```

## Key Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| CTO | Marcus Chen | Final escalation, GO/NO-GO |
| Lead Eng | Sarah Nakamura | Incident commander |
| Architecture | Amir Patel | System design decisions |
| Security | Nadia Kaur | Security incidents |
| Compliance | Jordan Blake | Data breach protocol |
| CFO | Rachel Wei | Business impact assessment |

## Post-Launch Monitoring Schedule

| Time | Action | Owner |
|------|--------|-------|
| T+0 to T+8h | Hourly smoke tests + monitor | Sarah Nakamura |
| T+8h to T+24h | Every 2 hours | On-call engineer |
| T+1d to T+7d | Every 4 hours | On-call engineer |
| T+7d onwards | Daily automated check | CI pipeline |
