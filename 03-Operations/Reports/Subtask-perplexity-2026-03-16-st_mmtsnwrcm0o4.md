# Subtask Output — Research Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Best Practices in Architecture Review Boards (ARBs)

ARBs enable faster decisions through tiered models, pre-approved patterns, and automation, reducing review cycles significantly in real implementations. A capital markets firm restructured its ARB as a rotating "Guild" with auto-generated dependency graphs, dropping review time from **21 days to 5 days** while preserving regulatory compliance.[1]

- Implement a **two-tier model**: Fast Track for pre-approved "golden templates" with automatic approval via guardrails; Deep Dive for high-risk cases using collaborative sessions.[1]
- Maintain a **golden pattern catalog** with diagrams, IaC modules, and security/compliance mappings; enforce **checklist-as-code** in PR templates covering SLOs, data classifications, and dependencies.[1]
- Schedule **weekly ARB office hours** for co-creation and **decision logging** synced to GRC tools for audits.[1]
- Form cross-functional boards including enterprise architecture, data engineering, security, business, and legal to align with strategy without slowing teams.[3]
- Use **reference architectures (RAs)** via a formal process: Enterprise Architecture team identifies needs, board prioritizes, sponsors ensure strategy fit, and per-RA review boards arbitrate issues.[5]
- Require **decision gates** before new code: inventory internal reuse, research buy options, justify with TCO/ROI, and get ARB sign-off using standardized checklists and build justification templates.[4]
- Track metrics quarterly: time-to-market, maintenance hours/month, defect rates, security incidents.[4]

## Common Bottlenecks in Architecture Review Boards

Bottlenecks include slide-heavy gates, long cycles, siloed decisions, and retrofitted governance, often leading to duplicate builds or evasion of policies. Pre-production reviews by governance boards risk introducing delays if not streamlined.[6]

- **Manual, slide-based reviews**: ARBs as "gates staffed by slides" create friction; resolved by automation and fast tracks.[1]
- **Long review cycles**: 21-day averages in legacy setups due to formal processes; guilds and patterns cut to 5 days.[1]
- **Lack of visibility into reuse**: Teams duplicate capabilities without inventorying internal systems, APIs, or cloud resources.[4]
- **Siloed local decisions**: Without executive sponsorship and cross-functional boards, coherence evaporates across teams.[3]
- **Retrofitted governance**: Skipping early model cards, audits, and ethics scorecards before scaling increases costs.[3]
- **Insufficient representation**: RA processes fail without broad stakeholder collaboration for shared solutions.[5]

## Real-World Examples and Next Steps

| Example | Key Change | Impact | Source |
|---------|------------|--------|--------|
| Capital Markets Platform (BFSI firm) | ARB to rotating "Guild" with dependency graphs | 21 to 5-day cycles | [1] https://www.arika.dev/blog/legacy-modernization/13-governance-and-compliance/ |
| University of Washington IT | RA Process with sponsors and per-RA boards | Quick establishment/revision of RAs | [5] https://it.uw.edu/guides/it-sourcing-standards/enterprise-architecture/resources/reference-architectures/ |
| ServiceNow Platform | Pre-production ARB reviews | Mitigate architectural risks | [6] https://www.servicenow.com/community/developer-blog/technical-architecture-governance-on-the-servicenow-platform/ba-p/3505328 |

**Concrete Next Steps**:
- Map your current ARB process end-to-end, flagging manual steps (1-2 days).[1]
- Pilot a fast-track golden catalog with 3-5 patterns and checklist-as-code in one team (1 week).[1][4]
- Form a cross-functional board (5-7 members) and run office hours weekly (start next week).[1][3]
- Inventory reuse via API gateway/cloud scans; track first metrics in 30 days.[4]
