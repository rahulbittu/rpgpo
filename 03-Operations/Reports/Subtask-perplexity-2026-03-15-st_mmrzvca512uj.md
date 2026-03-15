# Subtask Output — Research Post-Mortem Templates
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Google Cloud Blameless Postmortem Template
OneUptime provides a structured template for blameless postmortems on Google Cloud incidents, emphasizing learning over blame. Key sections include Summary (date, duration, severity, affected GCP services, impact), Timeline table (UTC times for alerts, acknowledgment, root cause, fix, recovery), Root Cause (specific GCP resources/configurations/code), Detection (method, delay, missed alerts), Response (diagnosis, mitigation, resolution steps), Contributing Factors (systems/processes/tooling list), What Went Well/What Could Be Improved (bulleted lists), Action Items table (action, owner, priority, due date, status), and Lessons Learned.[1]

**Example Timeline Table Format:**
| Time | Event |
|------|-------|
| HH:MM | First alert triggered |
| HH:MM | On-call engineer acknowledged |[1]

## Terraform Incident Postmortem Template
OneUptime's Terraform-specific template (in YAML format) covers incident ID, date, severity, duration, impact, timeline (detection time/method), and action items (with duration notes like 10 minutes for defining assignable items). Best practices: Maintain blameless culture by questioning system allowances for mistakes; investigate near-misses (e.g., plans caught in review); use structured investigation for declarative state management gaps between plan/apply.[2]

**Example YAML Snippet:**
```
incident:
  id: "INC-XXXX"
  date: "YYYY-MM-DD"
  severity: "P1/P2/P3"
```
[2]

## General Blameless Post-Incident Review (PIR) Template
IT Leadership Hub outlines a PIR document with Summary (1-3 sentences on what happened, duration, resolution), Impact (quantified: users affected, degradation duration, SLA/revenue loss). Process: Schedule review in 48-72 hours; build shared timeline collaboratively (from normal state to resolution, using logs); separate factors (people/process/technology/context); generate 5-8 SMART action items with single owners. Post-review: Publish draft in 24 hours, track in project tool, 30-day follow-up, quarterly pattern reviews.[3]

**Follow-Through Checklist Items:**
- Draft PIR published within 24 hours
- Action items with owner/due date acknowledged
- Priority assigned; stakeholders briefed (no blame)
- PIR searchable for reference[3]

## UX Teams Postmortem Best Practices
NN Group recommends UX postmortems with psychological safety (facilitator states "improve system, not blame"), root-cause via "five whys" (e.g., high checkout abandonment → why? → unverified participants), and system-focused deliverables (e.g., "Add stakeholder-review gate post-research"; "Update recruitment checklist"; "Prelaunch analytics review"). Document: 2-3 pages covering overview/goals, metrics/outcomes, findings, deliverables/owners, timeline. Changes target processes (checklists/reviews) or culture (e.g., default designer-researcher pairing).[4]

## Industry Metrics and Repeat Prevention
Sherlocks.ai highlights postmortems reducing repeats: Aim for zero incidents recurring in 30 days; track repeat rate as key metric (broken if >0). Benchmarks: <5 actionable pages/engineer/week; 30-50% alert-to-action ratio; minimal MTTR variance. Questions for audits: Can any engineer resolve top 5 types? Last postmortem's systemic fix date?[5]

**Key Metrics Table:**
| Metric | Healthy Benchmark |
|--------|-------------------|
| Repeat incident rate | Zero in 30 days |
| Pages per engineer/week | Under 5 actionable |
| Alert-to-action ratio | 30-50% |[5]

**Next Steps:**
- Adopt Google Cloud template for cloud incidents: Customize tables in Google Docs, run first review within 72 hours of next production issue.
- For Terraform: Implement YAML template in repo, schedule blameless meeting for any plan/apply near-miss.
- Track actions: Use Jira/Linear for items; review repeats monthly via query "incidents recurring 30 days".[1][2][3]
