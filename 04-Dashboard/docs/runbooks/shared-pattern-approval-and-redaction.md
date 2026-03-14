# Runbook: Shared Pattern Approval and Redaction

## Creating a Pattern Candidate
1. Identify a useful pattern (recipe, heuristic, lesson, etc.)
2. Submit via `POST /api/pattern-exchange/candidates`
3. System automatically redacts project-specific identifiers

## Reviewing Candidates
1. Check `GET /api/pattern-exchange/candidates` for pending candidates
2. Review the `redacted_content` (never the raw content)
3. Verify no project-specific secrets leaked through redaction
4. Approve or reject

## After Approval
- Pattern becomes a SharedPattern with `experimental` state
- Available to projects based on scope (engine_shared or operator_global)
- Usage is tracked per project

## Deprecation
When a pattern is no longer useful: `POST /api/shared-patterns/:id/deprecate`
Deprecated patterns cannot be used but remain in the record.
