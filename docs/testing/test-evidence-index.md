# GPO Test Evidence Index

## Artifact Locations

### Machine-Readable
| File | Contents |
|---|---|
| `artifacts/testing/strict-case-verdicts.json` | 361 case verdicts with confidence scores |
| `artifacts/testing/canonical-case-classification.json` | Report classification (canonical vs retry vs ad-hoc) |
| `artifacts/testing/execution-results.json` | Raw execution log (360 entries) |
| `artifacts/testing/gap-classification.json` | 10 identified gaps with fix status |
| `artifacts/testing/provider-role-index.json` | Provider usage statistics |
| `artifacts/testing/score-improvement-log.json` | Score progression over time |
| `artifacts/testing/session_state.json` | Current session state for recovery |
| `artifacts/testing/normalized-test-cases.json` | All 360 harness cases with predictions |
| `artifacts/testing/handoff-failures.json` | Claude↔ChatGPT handoff issues |

### Human-Readable
| File | Contents |
|---|---|
| `docs/testing/engine-maturity-scoreboard.md` | Official results and score history |
| `docs/testing/harness-summary.md` | Execution summary and L3 blockers |
| `docs/testing/strict-verdict-rubric.md` | How verdicts are assigned |
| `docs/testing/canonical-case-classification.md` | Report bucket definitions |
| `docs/testing/board-traceability-guide.md` | How to trace Board decisions |
| `docs/testing/test-review-guide.md` | How to review a case |
| `docs/testing/deliverables-index.md` | Index of all deliverable files |

### Case Reports (361 files)
Location: `docs/testing/case-reports/`
Format: `{task_id}-{title-slug}.md`
Each contains: Context → Deliberation → Execution → Deliverable

### Deliverable Files (~400 files)
Location: `04-Dashboard/state/deliverables/`
Format: `{date}-{title-slug}.md` and `{task_id}.json`

### Subtask Reports (~800 files)
Location: `03-Operations/Reports/`
Format: `Subtask-{provider}-{date}-{subtask_id}.md`
