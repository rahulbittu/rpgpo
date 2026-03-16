# Subtask Output — Research SLO and Error Budget Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# SLO and Error Budget Frameworks for Platform Engineering Teams

## Finding 1: Industry Standard SLO Targets and Error Budget Calculations

**99.9% availability (three nines) is the most common SLO target for platform engineering teams**, translating to approximately **43 minutes of allowable downtime per month**[1]. This represents a 0.1% error budget. The cost scaling principle is critical: **each additional nine of reliability costs roughly ten times more in infrastructure and engineering resources than the previous one**[1].

For platform engineering specifically, **internal SLOs should be stricter than external SLAs** to create a buffer for problem detection. A recommended approach is targeting **99.95% availability internally while promising 99.9% in customer-facing SLAs**[1].

Source: https://gainhq.com/blog/site-reliability-engineering-saas/

---

## Finding 2: Error Budget Policy Framework with Actionable Thresholds

**OneUptime published a concrete error budget policy framework (February 20, 2026)** that defines team actions based on budget consumption levels[2]:

| Budget Level | Remaining Budget | Team Actions |
|---|---|---|
| **Green** | >50% | Ship features at normal velocity; run planned experiments; perform standard maintenance |
| **Yellow** | 20-50% | Reduce deployment frequency; require extra review for risky changes; prioritize reliability work |
| **Orange** | 1-20% | Freeze non-critical feature deployments; all engineering effort on reliability; conduct incident review |
| **Red** | 0% | Complete feature freeze; all hands on reliability improvements; escalate to leadership; postmortem all budget-consuming incidents |

This framework operationalizes the reliability vs. velocity tradeoff with specific deployment gates tied to error budget consumption[2].

Source: https://oneuptime.com/blog/post/2026-02-20-sre-error-budgets/view

---

## Finding 3: Burn Rate Calculation and Monitoring

**Burn rate measures how quickly error budget is consumed relative to the ideal pace**. For a 99.9% SLO with an allowed error rate of 0.001, if your actual error rate over the last hour is 0.005, your **burn rate is 5x—meaning you're consuming budget five times faster than sustainable**[3].

**Best practices for burn rate monitoring include**[2]:
- Implement burn rate alerts at multiple thresholds
- Use rolling windows (e.g., 30 days) rather than calendar months
- Automate error budget tracking in dashboards
- Review error budget consumption in sprint planning

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-calculate-and-visualize-error-budget-burn-down-over-time-on-google-cloud/view

---

## Finding 4: Cost Integration into SLO Frameworks (2026 Update)

**APM Digest (2026) identifies that cost and reliability are now inseparable for platform engineering teams**[5]. Modern SRE practices require:

- **Cost telemetry embedded into the SLO loop**, especially for autoscaling and high-churn workloads
- **Rightsizing as ongoing maintenance**, not a quarterly exercise
- **Dynamic headroom allocation**, adjusted by risk and seasonality rather than fixed thresholds
- **Policies preventing idle resources**, including GPU reservations that never get reclaimed

This reflects a shift where platform teams must validate that cost optimizations (removing idle nodes, shrinking environments, replacing instance types) don't cause SLO violations[5].

Source: https://www.apmdigest.com/lets-face-it-sres-cost-and-reliability-are-now-inseparable

---

## Finding 5: Traditional vs. Modern SRE Implementation (2026 Guidance)

**Sherlock's AI (2026) provides decision criteria for which SRE model suits your platform engineering team**[6]:

**Traditional SRE fundamentals work best if**:
- Architecture is relatively monolithic
- Deployment cadence is weekly or less
- Reliability failures are predictable and well-documented
- Team is small enough for centralized ownership

**Most mature organizations use a hybrid approach**: modern tooling and AIOps layered on top of sound SLO and error budget fundamentals[6]. The critical success factor is **cultural shift—shared ownership across product and platform teams with leadership commitment to protect engineering time from toil**[6].

Source: https://www.sherlocks.ai/blog/traditional-sre-vs-modern-sre-what-every-engineering-leader-needs-to-know-in-2026

---

## Finding 6: Platform Engineering Scalability Standards

**Splunk's platform engineering guidance (2026) emphasizes that scalability strategies must include defined SLOs and error budgets that guide release decisions**[4]. This ensures horizontal scaling strategies align with reliability targets rather than operating independently.

Source: https://www.splunk.com/en_us/blog/learn/platform-engineering.html

---

## Actionable Next Steps for Your Platform Engineering Team

1. **Define SLOs before error budgets**—establish baselines from historical data, then set targets slightly better than current performance[2]
2. **Implement the four-level policy framework** (green/yellow/orange/red) with automated alerts tied to deployment gates[2]
3. **Embed cost telemetry into your SLO monitoring**—don't optimize costs in isolation from reliability impact[5]
4. **Use rolling 30-day windows** for error budget calculations, not calendar months[2]
5. **Treat error budget exhaustion as a signal, not punishment**—it's a shared language between product and engineering for the velocity-reliability tradeoff[6]
