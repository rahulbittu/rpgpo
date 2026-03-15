# GPO Engine Maturity Scoreboard

Updated: 2026-03-15 | Harness: V2 (360 cases, 15 engines)
**100 results, 27 commits, 10 gaps (8 fixed, 2 open)**

## Test Results Summary

| Level | Pass Rate | Description |
|---|---|---|
| Level 1 (Prompt Pass) | **96%** (96/100) | System produces a reasonable answer |
| Level 2 (Context Pass) | **80%** (80/100) | System uses operator/project context correctly |
| Level 3 (GPO Grade) | **0%** (0/100) | Full governed, downloadable, interactive output |

## Engine Coverage (100 results)

| Engine | Tested | L1 | L2 | Domain | Routing |
|---|---|---|---|---|---|
| Writing & Documentation | 12 | 12 | 11 | writing | Correct |
| Research & Analysis | 8 | 8 | 7 | research | Mostly correct |
| Learning & Tutoring | 7 | 7 | 6 | learning | Correct |
| Career & Job Search | 6 | 6 | 6 | careeregine | Correct |
| Personal Finance & Investing | 6 | 6 | 6 | wealthresearch | Correct |
| Health & Wellness Coach | 6 | 6 | 5 | health | Correct |
| Shopping & Buying Advisor | 5 | 5 | 4 | shopping | Correct |
| Scheduling & Life Operations | 5 | 5 | 4 | personalops | Correct |
| Startup & Business Builder | 4 | 4 | 4 | topranker | Correct |
| Travel & Relocation Planner | 4 | 4 | 3 | travel | Correct |
| Screenwriting & Story | 4 | 4 | 3 | screenwriting | Correct |
| Home & Lifestyle Design | 3 | 2 | 1 | personalops | Needs work |
| Code & Product Engineering | 2 | 2 | 2 | topranker | Limited (plan only) |
| Music & Audio Creation | 1 | 0 | 0 | music | BLOCKED |
| Filmmaking & Video Production | 0 | - | - | general | BLOCKED |

## Fixes Applied (8/10 gaps fixed)

| Gap | Description | Status |
|---|---|---|
| GAP-001 | No writing domain | FIXED |
| GAP-002 | Text tasks require approval | FIXED |
| GAP-003 | No research domain | FIXED |
| GAP-004 | Perplexity citation format | FIXED |
| GAP-005 | No learning domain | FIXED |
| GAP-006 | Stuck task recovery | FIXED |
| GAP-007 | Keyword collision | FIXED |
| GAP-008 | Perplexity product search quality | Open |
| GAP-009 | Context confusion with web entities | Open |
| GAP-010 | Subtask store limit | FIXED |

## Level 3 Blockers

1. No downloadable exports → FIXED (MD/JSON export added)
2. No interactive session mode → Open
3. Output format non-compliance → Open
4. No contract-aware structured output → Open (ChatGPT rec)
5. No file attachment support → Open

## Key Achievements

- 15 engines with dedicated routing and deliberation context
- TopRanker references removed from frontend and backend
- UI aligned to 15-engine harness model
- Downloadable exports (MD/JSON) for all completed tasks
- Context deepening in deliberation (recent work injection)
- Stuck task recovery on worker restart
- ChatGPT handoff operational (1 review exchange completed)
- System cost: ~$2/day across 300+ API calls
