# Automation Safety Rules

## Core Rules

1. **No unreviewed executable tools.** Every tool in the registry is manually reviewed and risk-classified.
2. **No hidden side effects.** Every action that affects external systems requires explicit approval.
3. **No random community tool ingestion.** GPO uses a private curated registry, not a public marketplace.
4. **No uncontrolled self-modifying behavior.** Workflow improvements require approval gates.
5. **No silent behavior drift.** All learned signals are traceable to source events.
6. **No outbound communication without confirmation.** Emails, messages, and API calls to external services require explicit operator approval.
7. **Rollback-safe changes only.** Any automated change must be reversible.
8. **Cost awareness.** API calls are logged and cost-tracked. The system prefers cheaper providers when quality is equivalent.
9. **Audit everything.** All tool executions, approvals, and behavior changes are logged.
10. **Fail safe, not fail dangerous.** On error, the system stops and reports rather than retrying aggressively.
