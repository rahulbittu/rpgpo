# GPO Documentation

## Start Here

| If you want to... | Read this |
|---|---|
| Understand what GPO is | [System Overview](system-overview.md) |
| Understand GPO's philosophy | [Operating Doctrine](product/gpo-operating-doctrine.md) |
| Navigate the repository | [Repo Map](repo-map.md) |
| Use GPO as an operator | [Operator Guide](operator-guide.md) |
| Understand how tasks execute | [Task Lifecycle](task-lifecycle.md) |
| Understand the Board of AI | [Board of AI Guide](board-of-ai-guide.md) |
| Understand behavior learning | [Behavior Learning](behavior-learning.md) |
| Understand local retrieval | [Local Retrieval Guide](retrieval/local-retrieval-guide.md) |
| Understand the tool registry | [Private Tool Registry](tools/private-tool-registry.md) |
| Manage the system (admin) | [Admin Guide](admin-guide.md) |
| Review test results | [Validation Scoreboard](testing/engine-maturity-scoreboard.md) |
| Understand the architecture | [Component Index](architecture/component-index.md) |

## Product

- [System Overview](system-overview.md) — Architecture, 15 engines, providers, how it works
- [Operating Doctrine](product/gpo-operating-doctrine.md) — 10 principles: reliability, governance, privacy
- [Reliability Over Agent Theater](product/reliability-over-agent-theater.md) — Why GPO chooses predictability
- [Repo Map](repo-map.md) — Every directory and key file explained
- [Task Lifecycle](task-lifecycle.md) — Submit → Route → Deliberate → Execute → Deliver
- [Board of AI Guide](board-of-ai-guide.md) — Three perspectives, provider selection, context injection
- [Operator Guide](operator-guide.md) — Dashboard navigation, submitting tasks, keyboard shortcuts
- [Admin Guide](admin-guide.md) — System management, API keys, costs, monitoring, troubleshooting
- [Canonical Naming](product/canonical-naming-map.md) — Internal domain IDs → canonical engine names

## Intelligence

- [Behavior Learning](behavior-learning.md) — Event capture, signal derivation, execution guidance
- [Behavior Baseline](behavior-baseline.md) — Starting metrics for measuring improvement
- [Privacy & Learning Boundaries](privacy-and-learning-boundaries.md) — What GPO learns and doesn't learn
- [Local Retrieval Guide](retrieval/local-retrieval-guide.md) — Context reuse, caching, cost reduction

## Tools & Governance

- [Private Tool Registry](tools/private-tool-registry.md) — Curated tools, risk classification
- [Human Control Boundaries](governance/human-control-boundaries.md) — Where AI acts vs where humans decide
- [Automation Safety Rules](governance/automation-safety-rules.md) — 10 safety rules for governed execution

## Architecture

- [Component Index](architecture/component-index.md) — Server, Worker, Dashboard, pipeline explained
- [Module Map](architecture/module-map.md) — All 251 TypeScript modules categorized

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
