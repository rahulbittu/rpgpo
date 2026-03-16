# Subtask Output — Research Current Best Practices for ADRs
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Architecture Decision Records (ADRs): Current Best Practices and Examples

**Architecture Decision Records are lightweight documents that capture individual architectural decisions, their rationale, alternatives considered, and conditions for revisiting them—enabling teams to preserve institutional knowledge and avoid repeating past debates.**

## Core Best Practices for Writing Effective ADRs

**Keep ADRs focused and concise.** Each ADR should document a single decision[2]. If you find yourself documenting multiple related decisions, split them into separate ADRs[2]. The template should be simple enough to complete in 15 minutes or less; if it takes longer, your template is too complex[3].

**Write ADRs at the time of the decision, not retroactively.** Context is freshest when the decision is being made[2]. Writing ADRs after the fact loses important nuance and reasoning[2].

**Include sufficient context for unfamiliar readers.** A new team member should understand why the decision was made without needing additional explanation[2]. A well-written ADR answers these critical questions[1]:
- What alternatives were considered?
- What constraints mattered at the time?
- What risks were knowingly accepted?
- Under what conditions should this decision be revisited?

**Store ADRs as numbered markdown files in your repository** (e.g., `docs/decisions/0001-use-postgresql.md`)[3]. This keeps decisions versioned alongside the code they describe and makes them discoverable through code search[3].

**Link ADRs to implementation pull requests and vice versa.** This creates traceability between decisions and the code that implements them[2].

**Never modify accepted ADRs.** If a decision changes, create a new ADR that supersedes the old one and link them[3]. This preserves the historical record of how your architecture evolved[3].

## Key Decision Categories Worth Documenting

**Data architecture decisions** are especially critical to document because they are the hardest to reverse—they affect every query, report, and downstream system[3]. Examples include schema design, data partitioning strategy, backup approach, retention policies, and data ownership boundaries[3].

**API design decisions** create contracts with external consumers that are difficult to change[3]. Document versioning strategy, authentication method, error format, and pagination approach[3].

**Security and compliance decisions** are often made once and assumed forever[3]. Document authentication mechanisms, authorization models, encryption standards, audit logging, and data classification rules[3].

**Salesforce-specific decisions** with lasting consequences include data replication vs. virtualization (affecting reporting architecture and data freshness) and Permission Set Groups vs. profiles (determining how composable and maintainable permissions remain as the org scales)[1].

## Implementation Process and Review Workflow

A structured review process ensures quality and team alignment[2]:

1. **Draft phase**: Author writes ADR in proposed status as a pull request
2. **Review phase**: Team reviews with feedback from at least 2 team members; platform and security teams review relevant decisions (5 business day timeline)[2]
3. **Discussion phase**: Address feedback and discuss alternatives via PR comments or meetings[2]
4. **Decision phase**: Technical lead or architecture team accepts, modifies, or rejects the ADR[2]
5. **Implementation phase**: Implement the decision and link implementation PRs to the ADR[2]

**Review ADRs periodically.** Some decisions may need to be revisited as the organization grows or technology changes[2].

## AI-Powered ADR Workflows (Emerging Practice)

Recent approaches leverage AI to reduce administrative overhead[4]. Automation strategies include:

- **Meeting transcription**: Convert meeting recordings to ADR drafts automatically[4]
- **Chat monitoring**: Deploy bots that monitor architecture-related conversations in Slack or Teams and flag decisions for ADR creation[4]

When using AI assistance, instruct it to write as concisely as possible—the more verbose the output, the higher the risk of hallucination and the harder it becomes to review[4].

## Enforcement and Governance

**Use architecture fitness functions and code review checklists** to detect violations of documented decisions[3]. An ADR that is consistently violated indicates either that the decision was wrong (and should be superseded) or that the team lacks enforcement mechanisms[3].

**Integrate ADRs with data governance frameworks.** Enterprise systems should link ADRs to role-based access control, data lineage tracking, audit logs, and version control[5].

---

**Sources:**
- https://www.salesforceben.com/how-to-make-salesforce-architecture-decisions-that-actually-last/
- https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-architecture-decision-records/view
- https://techdebt.best/architectural-decisions/
- https://shinglyu.com/architecture/2026/02/17/adr-as-event-sourcing.html
- https://www.techment.com/blogs/rag-architectures-enterprise-use-cases-2026/
