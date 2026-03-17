# Backend Capability Audit

## Summary
Backend has 400+ API endpoints. V2 uses 12. Massive capability gap.

## TIER 1 — Core (V2 uses these)
| API | What it does | V2 coverage |
|-----|-------------|-------------|
| `/api/status` | Server/worker uptime, provider states | Partial — shows ready/not |
| `/api/costs` | Today/week cost, calls, by-provider | Partial — basic numbers |
| `/api/intake/run` | Submit task | Full |
| `/api/intake/tasks` | List all tasks | Full |
| `/api/intake/task/:id` | Task detail + subtasks | Full |
| `/api/intake/task/:id/feedback` | Submit feedback | Full |
| `/api/intake/task/:id/export` | Export MD/JSON | Full |
| `/api/intake/pending-approvals` | Pending approvals list | Full |
| `/api/subtask/:id/approve` | Approve subtask | Full |
| `/api/engines` | Engine list + display names | Partial |
| `/api/diag/keys` | API key status | Partial |
| `/api/behavior/events` | Activity events (paginated) | Full |
| `/api/behavior/stats` | Behavior stats summary | Partial — settings only |
| `/api/events` | SSE stream | Full |

## TIER 2 — Powerful, NOT surfaced in V2
| API | What it does | Real data? |
|-----|-------------|-----------|
| `/api/chief-of-staff/brief` | Full operational brief + recommended actions | YES — rich |
| `/api/chief-of-staff/actions` | Prioritized action items | YES — real actions |
| `/api/chief-of-staff/engine/:domain` | Per-engine brief | YES |
| `/api/behavior/signals` | 25+ learned signals about operator | YES — rich |
| `/api/behavior/guidance` | Auto-approve recommendation + depth | YES |
| `/api/behavior/context` | Scoped execution context | YES |
| `/api/memory-viewer` | Operator profile + learned memory | YES — rich |
| `/api/memory-viewer/search` | Search memory | YES |
| `/api/memory-viewer/domain/:domain` | Memory by domain | YES |
| `/api/provider-registry` | Full provider details + strengths/weaknesses | YES |
| `/api/provider-reliability` | Success rates, health per provider | YES |
| `/api/provider-latency` | Avg/P95 latency per provider | YES |
| `/api/provider-cost` | Per-provider pricing tiers | YES |
| `/api/provider-incidents` | Provider incident history | YES |
| `/api/provider-governance-summary` | Provider governance overview | YES |
| `/api/costs/history` | Full cost event log | YES — detailed |
| `/api/costs/settings` | Budget limits, model config | YES |
| `/api/service-health` | Subsystem health (execution, governance, etc.) | YES |
| `/api/governance-health` | Exception/drift/tuning counts | YES |
| `/api/observability` | Throughput, success%, failure%, blocked% | YES |
| `/api/subtasks` | All subtasks across tasks | YES |
| `/api/subtask/:id/reject` | Reject subtask | Available |
| `/api/subtask/:id/revise` | Request subtask revision | Available |
| `/api/settings` | Full settings + provider states | YES |
| `/api/intake/current` | Currently executing task | YES |
| `/api/intake/task/:id/deliberate` | Trigger board deliberation | Available |
| `/api/intake/task/:id/approve-plan` | Approve execution plan | Available |

## TIER 3 — Governance/Enterprise (scaffolded, likely less data)
- Execution graphs, approval gates, review contracts
- Operator policies, autonomy budgets, escalation rules
- Promotion dossiers, policy simulation, governance tests
- Release orchestration, environment pipeline, rollback control
- Tenant admin, subscription ops, secret governance
- And 200+ more governance/enterprise endpoints

## Key Finding
The frontend hides 90% of the backend's real power. The most critical unsurfaced APIs:
1. Chief of Staff brief/actions — gives operational intelligence
2. Behavior signals/memory — shows what GPO has learned
3. Provider details — reliability, latency, cost breakdown
4. Cost history — full spend tracking
5. Service/governance health — system trustworthiness
6. Observability — real metrics
7. Subtask reject/revise — full governance actions
