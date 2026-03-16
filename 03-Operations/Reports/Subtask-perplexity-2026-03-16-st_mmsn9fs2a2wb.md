# Subtask Output — Research ADRs
## Model: sonar
## Stage: research
## Date: 2026-03-16

## ADR Templates

**Standard ADR template includes these core sections:** Title (sequential number and short description), Status (Proposed, Accepted, Deprecated, Superseded), Context (problem background), Decision (chosen option), Options Considered (alternatives with pros/cons), Rationale (why chosen), Consequences (positive/negative impacts), and Date.[4]

**Salesforce-specific example template:**
```
Title: ADR-001: Use Permission Set Groups over Profiles
Status: Accepted
Context: Scaling access model for growing org with complex permissions.
Options: Profiles (legacy, less composable); Permission Set Groups (modern, scalable).
Decision: Adopt Permission Set Groups.
Rationale: Better composability and maintainability at scale.
Consequences: + Easier scaling; - Migration effort from profiles.
Date: 2026-03-01
```
[3]

**Nygard-style minimal template:** Context, Decision, Consequences (lightweight for quick capture).[1][4]

## Real-World Examples

**Uber's ADR example (from Gist):** Documents switch to federated decision authority; includes team-level (autonomous), cross-team (Architecture Advisory Group review), org-level (CTO approval). Stored in central repo; implementation blocked until published.[1]

**ABP.IO ADR summary:** Justifies .NET framework choice for high-availability systems; highlights AI-optimized structure reducing token usage by predictable conventions (e.g., fewer hallucinations in AI code gen).[6]

**ServiceNow ADR versioning:** Creates evolving records (e.g., v1 Proposed → v2 Accepted); auto-numbers versions with status/date; view via dropdown in Enterprise Architecture Workspace (updated March 12, 2026).[7]

## Best Practices for Maintaining an ADR Log

- **Central, searchable repo:** Store in GitHub alongside code; use PRs for review/audit trail; version with code for single source of truth.[1][2]
- **Immutable events + snapshots:** Treat ADRs as event stream (one per decision/meeting); AI-generate current architecture snapshot from log (e.g., replay for "big picture").[5]
- **Status tracking:** Update lifecycle (Proposed → Accepted → Superseded); enables traceability/compliance.[2][4][7]
- **Team access/ownership:** Visible to all; no email silos; federated authority (team auto-approve isolated changes).[1]
- **AI integration:** Use for context in design/refactoring; structured format reduces AI errors.[2][5][6]

## Guidelines: When to Create or Update ADRs

**Create for significant decisions** (not all tech choices):
- Architecture-impacting: Database (e.g., PostgreSQL), monolith vs microservices, REST/GraphQL, auth strategy, event-driven shifts.[1][4]
- Long-term constraints: Data replication vs virtualization, permission models.[3]
- Cross-team/org impact: New languages/infra (AAG/CTO review).[1]

**Update/Supersede when:** Context changes (e.g., scale/compliance shifts); create new version for evolution/alternatives; revisit if risks materialize.[3][4][7]

**Threshold:** If future teams need explanation or alternatives were weighed; start with next decision, not retro.[3][4]
