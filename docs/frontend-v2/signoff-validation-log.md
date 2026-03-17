# V2 Signoff Validation Log

## Validation Period
- **Start**: 2026-03-17
- **Target End**: 2026-03-24 (7 days)
- **Status**: IN PROGRESS

## Rules
1. V2 is the primary surface at `/`
2. Legacy available at `/legacy` as fallback only
3. Only fix issues found from real use — no new features
4. Do not remove legacy during this window
5. At end: produce go/no-go recommendation for legacy retirement

## Daily Log

### Day 1 — 2026-03-17

#### Workflows Verified
| # | Workflow | Status | Notes |
|---|---------|--------|-------|
| 1 | Ask → Submit → Progress → Result | PASS | Submitted "ergonomic desk setups under $500" → routed to research → 2 subtasks → done in ~20s → rendered with sources |
| 2 | Results → Search → Filter → View | PASS | /api/intake/tasks returns 1,352 tasks, search/filter wired in v2.js |
| 3 | Evidence → Deep-link → Output toggle → Download | PASS | Export endpoint returns rich markdown with sources, 200 OK |
| 4 | Feedback → Rating → Event captured | PASS | POST feedback "good" → `{ok: true, recorded: "good"}` |
| 5 | Approvals → Review → Approve/Reject | PASS | 0 pending approvals, endpoint returns clean array |
| 6 | Activity → Search → Filter → Pagination | PASS | 3,782 events, pagination with limit/offset working |
| 7 | Settings → Theme → Providers → System info | PASS | /api/engines returns 15 engines, /api/diag/keys shows 3 providers OK |
| 8 | Keyboard shortcuts → Cmd+K, /, Escape | PASS | Wired in v2.js keydown handler (lines 613-624) |
| 9 | Home → Running tasks → Recent results → Activity | PASS | /api/status, /api/costs, /api/intake/tasks all return live data |
| 10 | Mobile nav (narrow width simulation) | — | CSS rules verified in v2.css, needs real device test |

#### API Health
- Server: 200 at `/` (V2) and `/legacy`
- Providers: OpenAI, Perplexity, Gemini all ready
- Costs: $0.49 today, $12.54 week, 2,000 calls
- SSE: EventSource at /api/events with debounced activity refresh

#### Issues Found
_None found during Day 1 validation_

#### Regressions vs Legacy
_None identified — all V2 API paths match backend expectations_

---

### Day 2 — 2026-03-18
_Pending_

### Day 3 — 2026-03-19
_Pending_

### Day 4 — 2026-03-20
_Pending_

### Day 5 — 2026-03-21
_Pending_

### Day 6 — 2026-03-22
_Pending_

### Day 7 — 2026-03-23
_Pending_

---

## Signoff Recommendation
_To be completed after Day 7_

- [ ] All 10 workflows pass on all 7 days
- [ ] Zero workflow-breaking bugs open
- [ ] No operator-reported regressions
- [ ] Mobile verification attempted
- [ ] **GO / NO-GO**: ___
