# GPO Engine Maturity Scoreboard

Updated: 2026-03-15 | Harness: V2 (360 cases, 15 engines)
**27 cases tested, 12 commits, 9 gaps, 6 fixes applied**

## Test Results Summary

| Level | Pass Rate | Description |
|---|---|---|
| Level 1 (Prompt Pass) | 93% (25/27) | System can produce a reasonable answer |
| Level 2 (Context Pass) | 44% (12/27) | System uses operator/project context correctly |
| Level 3 (GPO Grade) | 0% (0/27) | Full governed, context-rich, downloadable output |

## Engine Test Coverage

| Engine | Tested | L1 Pass | L2 Pass | Domain | Status |
|---|---|---|---|---|---|
| Writing & Documentation | 5 | 5 | 3 | writing | Routing fixed, auto-approval working |
| Research & Analysis | 5 | 5 | 3 | research | Routing fixed, good Perplexity+OpenAI chain |
| Learning & Tutoring | 3 | 3 | 0 | learning | Routing fixed, no interactive mode |
| Scheduling & Life Operations | 2 | 2 | 1 | personalops | Text plans only, no calendar |
| Career & Job Search | 2 | 2 | 2 | careeregine | Good results with operator context |
| Personal Finance & Investing | 2 | 2 | 2 | wealthresearch | Good personalized analysis |
| Startup & Business Builder | 2 | 2 | 2 | topranker | Good strategy output |
| Shopping & Buying Advisor | 1 | 1 | 0 | shopping/research | Routing needs work |
| Travel & Relocation Planner | 1 | 1 | 0 | travel | Basic capability |
| Health & Wellness Coach | 1 | 1 | 0 | health | Basic capability |
| Screenwriting & Story Development | 1 | 1 | 0 | screenwriting | Keyword collision issues |
| Home & Lifestyle Design | 1 | 0 | 0 | personalops | Perplexity search failure |
| Code & Product Engineering | 0 | - | - | topranker | Not yet tested (needs Claude builder) |
| Music & Audio Creation | 0 | - | - | music | BLOCKED: no audio generation |
| Filmmaking & Video Production | 0 | - | - | general | BLOCKED: no video generation |

## Gaps Classified (9)

| Gap | Category | Severity | Status | Fix |
|---|---|---|---|---|
| GAP-001 | routing | high | FIXED | Added writing domain |
| GAP-002 | deliberation | medium | FIXED | Non-code tasks use report stage, approval_required:false |
| GAP-003 | routing | high | FIXED | Added research domain |
| GAP-004 | output_quality | medium | FIXED | Perplexity citation format strengthened |
| GAP-005 | routing | medium | FIXED | Added learning domain |
| GAP-006 | execution | medium | FIXED | Stuck task recovery on worker startup |
| GAP-007 | routing | medium | FIXED | Keyword collision resolved (newsroom vs research) |
| GAP-008 | provider | medium | open | Perplexity search failure for product/design queries |
| GAP-009 | context | medium | open | Context confusion with external entities (TopRanker name) |

## Level 3 Blockers (why 0% GPO-grade pass)

1. **No downloadable deliverables** — output stays in JSON, no PDF/doc export
2. **No interactive modes** — tutoring, quizzing, follow-ups all one-shot
3. **Shallow project context** — operator profile used but specific project state not injected
4. **Output format non-compliance** — system produces good content but doesn't match requested format exactly
5. **No file attachment support** — can't review actual resumes, documents, etc.
