# Subtask Output — Research Platform Engineering Team Charters
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Platform Engineering Team Charters: Current Best Practices and Implementation

**Platform engineering team charters define mission, responsibilities, team structure, and operating models to enable self-service infrastructure while maintaining governance and security standards.**

## Finding 1: Core Charter Components and Mission Definition

A platform engineering charter should establish a clear mission focused on enabling developer self-service. The Terraform Center of Excellence example demonstrates this approach: the mission is to "Enable all engineering teams to use Terraform effectively, efficiently, and securely through standards, tooling, training, and support."[2]

Key charter elements include:

- **Core responsibilities:** Define and maintain coding standards, build shared module libraries, provide training and support, recommend version upgrade strategies[2]
- **Out-of-scope activities:** Explicitly list what the platform team does NOT own—such as day-to-day infrastructure operations, team-specific configurations, cloud account management, and application-level deployment decisions[2]
- **Team structure:** Specify core members (e.g., 2 senior platform engineers full-time, 1 security engineer part-time, 1 technical writer part-time) and community champions rotating from each engineering team every 6 months[2]

Source: https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-center-of-excellence/view

## Finding 2: Self-Service Portal and Golden Path Templates

Platform engineering implementation requires a structured approach to developer self-service. Within the first 7 days of platform launch, teams should:

- **Day 3:** Create one opinionated service template and CI pipeline to establish the "golden path"[3]
- **Day 5:** Implement a basic developer portal or catalog to surface available templates and services[3]
- **Day 6:** Add policy-as-code for a single guardrail to enforce standards without manual review[3]

The charter should define infrastructure abstraction layers through two primary patterns:

- **Cluster-per-team pattern:** Each team gets its own cluster with platform agents providing shared services—use when isolation and compliance are priorities[3]
- **Multi-tenant cluster with namespaces:** Shared cluster with strict RBAC and quotas—use when cost and resource utilization matter[3]

Source: https://www.devopsschool.nl/platform-engineering/

## Finding 3: Developer Experience Metrics and SLOs

Platform charters must tie success metrics to developer-facing outcomes rather than infrastructure metrics. Design SLOs for platform services based on:

- Pipeline availability[3]
- Template provisioning time[3]
- Developer portal uptime and search performance[3]

The charter should define mandatory telemetry including metrics, traces, and logs with standardized SDKs and sidecars, plus a tag taxonomy for ownership and cost allocation.[3]

Source: https://www.devopsschool.nl/platform-engineering/

## Finding 4: Team Interaction Contracts and Operating Model

Platform charters should establish clear ownership and escalation models:

- **Platform team ownership:** Controls the platform control plane and supporting automation[3]
- **Consumer team ownership:** Remains on-call for their applications[3]
- **Shared-operation model:** Platform on-call handles platform incidents; product teams handle application incidents with clearly defined escalation paths in runbooks[3]

The charter should specify engagement mechanisms including:

- Monthly anonymous surveys for feedback[2]
- Post-training feedback forms[2]
- Module feedback through GitHub issues[2]
- Quarterly retrospectives with community champions[2]
- Open Q&A sessions with rotating CoE member facilitators[2]

Source: https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-center-of-excellence/view

## Finding 5: Adoption Strategy and Best Practices

Effective platform charters include explicit adoption strategies:

- **Start small and grow organically:** Do not standardize everything at once; begin with the most impactful areas and expand as credibility builds[2]
- **Lead by example, not by mandate:** Teams adopt practices more readily when they see benefits firsthand rather than being told what to do[2]
- **Invest in documentation:** Standards, modules, and processes should be thoroughly documented and easy to find[2]

For team adoption, provide clear benefits, good developer experience, extension points, and support migration tooling.[3] Pilot changes with change champions before full rollout to secure early adoption and feedback.[6]

Source: https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-center-of-excellence/view

## Finding 6: Governance and Accountability Structures

Charters should establish role clarity using RACI matrices (Responsible, Accountable, Consulted, Informed) for major decisions and communications, aligned from portfolio to project level.[6] The charter should define:

- **Quarterly deliverables:** Quarterly reports to engineering leadership, updated roadmaps, new or revised standards documents, and training schedules[2]
- **Prerequisites before launch:** Inventory current clusters, services, and pipelines; define platform goals (velocity, cost, security tradeoffs); secure executive sponsorship and clear charter[3]

Source: https://www.devopsschool.nl/platform-engineering/
