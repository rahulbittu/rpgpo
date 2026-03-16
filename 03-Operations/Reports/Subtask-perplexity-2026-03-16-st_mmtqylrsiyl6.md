# Subtask Output — Research On-Call Management Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Shift Scheduling
- Use tools like **PagerDuty** for structured on-call rotations across teams, ensuring predictable scheduling and avoiding ad-hoc escalations to specific individuals.[1]
- Implement **rotating shifts** with defined backups for coverage during vacations or absences, documented in business continuity plans.[6]
- SRE teams maintain **on-call rotations** for incidents outside working hours, with fair distribution to protect engineers.[5][7]

## Escalation Policies
- Default to on-call engineer owning all roles (incident commander, communications, operations), delegating as needed; escalate SEV-1/SEV-2 via structured paths.[1]
- Flux CD example: Level 1 (on-call, 30 min: health check, runbook); Level 2 (platform lead, 1 hour: logs, suspend resources, #platform-oncall Slack); Level 3 (architect, 2 hours: scale down, PagerDuty page); external (Flux community via GitHub).[2]
- Categorize factors in post-incident reviews: People, Process (escalation paths, rotations), Technology, Context.[3]

**Source:** https://flightaware.engineering/blast-from-the-past-driving-reliability-at-flightaware/[1]; https://oneuptime.com/blog/post/2026-03-06-create-flux-cd-runbook-on-call-engineers/view[2]; https://itleadershiphub.com/best-practices/blameless-post-incident-review/[3]; https://asana.com/resources/work-schedule-types[6]; https://www.ilert.com/blog[7]

## Runbook Standards
- Link **every alert to a runbook** with step-by-step procedures; test quarterly via tabletop exercises; document all emergency actions with tickets.[2][4]
- Flux CD template: Quick health check first; emergency suspend reconciliation; match CLI version to cluster; cover common incidents like cascading failures.[2]
- Actionable alerts only (e.g., "scale up due to CPU saturation" vs. generic "CPU high"); use symptom-based alerting (error rate >1%, P99 >2s) over cause-based.[4]

**Source:** https://oneuptime.com/blog/post/2026-03-06-create-flux-cd-runbook-on-call-engineers/view[2]; https://oneuptime.com/blog/post/2026-02-20-monitoring-alerting-best-practices/view[4]

## Incident Response Templates
- **Roles:** Incident Commander (progress oversight), Communications (updates), Operations (technical fixes); on-call starts, delegates via PagerDuty.[1]
- **Timeline example:** 02:14 alert (API error >5%); 02:19 ack/investigate; 02:31 escalate DBA; 02:47 fix; 02:58 resolved; 03:12 status page.[3]
- Blameless PIR: Build shared timeline collaboratively; categorize factors; remote: shared doc, note-taker, cameras on first 15 min, 60-min max, 24h async comments.[3]
- Postmortem for all SEV-1/SEV-2; require trip through process.[1]

**Source:** https://flightaware.engineering/blast-from-the-past-driving-reliability-at-flightaware/[1]; https://itleadershiphub.com/best-practices/blameless-post-incident-review/[3]

## On-Call Compensation Guidelines
- No specific compensation numbers or guidelines found in recent searches (last 30 days prioritized); general SRE practices mention rotations but lack pay data.[5]

**Source:** [no URL available; limited results on compensation specifics]

## Burnout Prevention Strategies
- **Reduce alert fatigue:** Actionable alerts only; symptom-based (page on error rate >1%, availability <99.9%); burn rate alerts on error budget; regular alert reviews; grouping/deduplication.[4]
- **Fair rotations** with clear paths, tooling for noise reduction, regular training.[7]
- **Blameless reviews** to protect morale; categorize beyond single causes.[3]
- Remote PIR adjustments: 60-min limit to combat video fatigue; structured turns.[3]

**Source:** https://oneuptime.com/blog/post/2026-02-20-monitoring-alerting-best-practices/view[4]; https://www.ilert.com/blog[7]; https://itleadershiphub.com/best-practices/blameless-post-incident-review/[3]

**Next Steps:**
- Adopt PagerDuty for rotations: Schedule demo at pagerduty.com (integrates escalations).[1]
- Build Flux-style runbook: Customize template from OneUptime, test Q1 2026.[2]
- Run blameless PIR template: Use shared Google Doc for next incident, limit to 60 min.[3]
- Audit alerts: Review weekly, implement burn rates targeting <1% error fire rate.[4]
