# GPO Documentation

## Start Here

| If you want to... | Read this |
|---|---|
| Understand what GPO is | [System Overview](system-overview.md) |
| Navigate the repository | [Repo Map](repo-map.md) |
| Use GPO as an operator | [Operator Guide](operator-guide.md) |
| Understand how tasks execute | [Task Lifecycle](task-lifecycle.md) |
| Understand the Board of AI | [Board of AI Guide](board-of-ai-guide.md) |
| Review test results | [Validation Scoreboard](testing/engine-maturity-scoreboard.md) |
| Review a specific test case | [Test Review Guide](testing/test-review-guide.md) |

## Product

- [System Overview](system-overview.md) — Architecture, 15 engines, providers, how it works
- [Repo Map](repo-map.md) — Every directory and key file explained
- [Task Lifecycle](task-lifecycle.md) — Submit → Route → Deliberate → Execute → Deliver
- [Board of AI Guide](board-of-ai-guide.md) — Three perspectives, provider selection, context injection
- [Operator Guide](operator-guide.md) — Dashboard navigation, submitting tasks, keyboard shortcuts
- [Canonical Naming](product/canonical-naming-map.md) — Internal domain IDs → canonical engine names

## Validation & Testing

- [Scoreboard](testing/engine-maturity-scoreboard.md) — 338/361 PASS (93.6%), strict grading
- [Harness Summary](testing/harness-summary.md) — 360-case V2 harness execution details
- [Verdict Rubric](testing/strict-verdict-rubric.md) — How PASS/PARTIAL/FAIL are assigned
- [Case Classification](testing/canonical-case-classification.md) — Canonical vs retries vs legacy
- [Review Guide](testing/test-review-guide.md) — How to review any case in 2 or 10 minutes
- [Evidence Index](testing/test-evidence-index.md) — Where every artifact lives
- [Board Traceability](testing/board-traceability-guide.md) — Trace any Board decision
- [Case Reports](testing/case-reports/) — 361 individual full-flow reports

## Agent Collaboration

- [ChatGPT Handoff Contract](handoff/chatgpt-handoff-contract.md) — Claude↔ChatGPT protocol, defect assessment
