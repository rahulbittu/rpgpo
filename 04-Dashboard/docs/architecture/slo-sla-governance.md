# SLO/SLA Governance

## 6 Internal SLOs
| SLO | Target | Unit |
|-----|--------|------|
| Approval Response Time | 24 | hours |
| Escalation Triage Time | 4 | hours |
| Execution Success Rate | 90 | % |
| Release Verification Success | 95 | % |
| Provider Fallback Rate | 10 | %_max |
| Promotion Evaluation Latency | 5000 | ms |

## Budget Tracking
Each SLO has budget_remaining showing margin before breach.

## Alert Rules
3 default rules: execution failure, approval SLA, active incidents threshold.

## API
- `GET /api/slo-sla` — Statuses + definitions
- `GET /api/alerts` — Alerts + rules
- `GET /api/service-health` — Unified health view
