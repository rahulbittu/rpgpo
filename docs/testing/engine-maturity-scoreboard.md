# GPO Engine Maturity Scoreboard

Generated: 2026-03-15 | Harness: V2 (360 cases, 15 engines)

## Engine → GPO Domain Mapping

| Harness Engine | GPO Domain | Dedicated? | Core Cases | Avg Rank | Avg Demand | Predicted |
|---|---|---|---|---|---|---|
| Code & Product Engineering | topranker | Yes | 10 | 83 | 77 | PARTIAL |
| Writing & Documentation | general | No | 10 | 83 | 75 | PARTIAL |
| Research & Analysis | general | No | 10 | 106 | 73 | PARTIAL |
| Learning & Tutoring | general | No | 10 | 107 | 71 | PARTIAL |
| Scheduling & Life Operations | personalops | Yes | 10 | 126 | 69 | PARTIAL |
| Shopping & Buying Advisor | general | No | 10 | 145 | 66 | PARTIAL |
| Travel & Relocation Planner | general | No | 10 | 160 | 64 | PARTIAL |
| Career & Job Search | careeregine | Yes | 10 | 180 | 58 | PARTIAL |
| Personal Finance & Investing | wealthresearch | Yes | 10 | 187 | 62 | PARTIAL |
| Startup & Business Builder | topranker | Yes | 10 | 187 | 60 | PARTIAL |
| Health & Wellness Coach | general | No | 10 | 225 | 68 | PARTIAL |
| Screenwriting & Story Development | screenwriting | Yes | 10 | 231 | 53 | PARTIAL |
| Home & Lifestyle Design | personalops | Yes | 10 | 283 | 44 | PARTIAL |
| Music & Audio Creation | music | Yes | 10 | 298 | 48 | FAIL |
| Filmmaking & Video Production | general | No | 10 | 307 | 51 | FAIL |

## Coverage Summary

- **Total cases:** 360 (150 Core, 150 Expansion, 60 Stretch)
- **Predicted PASS:** 0 (no live testing done yet)
- **Predicted PARTIAL:** 312 (87%)
- **Predicted FAIL:** 48 (13% — all Music + Film cases)
- **7 of 15 engines fall to `general`** — no dedicated routing or context
- **2 highest-demand engines without dedicated domains:** Writing (rank 83) and Research (rank 106)

## Critical Gaps

### Gap 1: Missing Domain Engines (7 engines route to general)
Writing, Research, Learning, Shopping, Travel, Health, Filmmaking all fall to `general` domain.
**Impact:** No tailored deliberation context, no domain-specific prompts, no specialized loop stages.

### Gap 2: No Audio/Video Generation
Blocks 48 cases (Music + Filmmaking). External tool integration required.
**Status:** BLOCKED_BY_PROVIDER — escalation needed.

### Gap 3: No Calendar/Scheduling API
Scheduling engine can only produce text plans, not real calendar entries.

### Gap 4: No Financial Modeling Tools
Finance engine cannot do spreadsheet calculations or projections.

## Priority Next Fixes (Evidence-Based)

1. Add `writing` domain with keyword routing — unblocks 24 Writing cases
2. Add `research` domain routing to existing Perplexity+OpenAI pipeline — unblocks 24 Research cases
3. Add `learning` domain with tutoring-specific prompts — unblocks 24 Learning cases
4. Live test top 10 Core 150 cases through actual GPO pipeline
5. Classify real vs predicted failures from live execution

## Maturity Scores (0-100, pre-testing)

| Engine | Routing | Context | Execution | Output | UX | Overall |
|---|---|---|---|---|---|---|
| Code & Product Engineering | 70 | 80 | 60 | ? | 70 | 56 |
| Writing & Documentation | 20 | 10 | 50 | ? | 30 | 22 |
| Research & Analysis | 30 | 20 | 70 | ? | 50 | 34 |
| Learning & Tutoring | 10 | 10 | 40 | ? | 20 | 16 |
| Scheduling & Life Ops | 50 | 40 | 40 | ? | 40 | 34 |
| Career & Job Search | 80 | 70 | 70 | ? | 60 | 56 |
| Personal Finance | 60 | 50 | 60 | ? | 50 | 44 |
| Startup & Business | 60 | 50 | 60 | ? | 50 | 44 |
| Shopping & Buying | 20 | 10 | 40 | ? | 30 | 20 |
| Travel & Relocation | 20 | 10 | 40 | ? | 30 | 20 |
| Health & Wellness | 10 | 10 | 40 | ? | 20 | 16 |
| Screenwriting | 60 | 40 | 40 | ? | 30 | 34 |
| Home & Lifestyle | 40 | 30 | 40 | ? | 30 | 28 |
| Music & Audio | 40 | 30 | 10 | ? | 20 | 20 |
| Filmmaking & Video | 10 | 10 | 10 | ? | 10 | 10 |
