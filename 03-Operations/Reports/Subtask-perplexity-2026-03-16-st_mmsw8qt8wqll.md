# Subtask Output — Research Current Best Practices for Engineering RFCs
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Best Practices for Engineering RFCs and Design Documents

**Core structure of effective RFCs includes six mandatory sections: Problem Statement, Proposed Solution, Constraints, Non-Goals, Open Questions, and Acceptance Criteria.** This model, validated across Uber (scaled from tens to thousands of engineers), Google (design docs), Facebook, Microsoft, and Amazon, prevents failures like scope creep by defining the "why" first and clear finish lines via acceptance criteria.[2] Use RFC 2119 keywords in uppercase—MUST/REQUIRED for hard rules (e.g., output formats), SHOULD/RECOMMENDED for strong preferences with deviation allowed, MAY/OPTIONAL for nice-to-haves (often omit to keep specs clean)—to eliminate ambiguity, as practiced in technical documentation and AI agent prompts.[1]

**Incorporate diagrams, plain language, and visual aids to communicate across teams.** Avoid jargon excluding cross-team reviewers; visuals like diagrams clarify complex ideas faster than text.[6]

**Treat specs as durable infrastructure, not disposable docs.** In AI-native workflows, specs guide both humans and agents by anchoring implementation (e.g., phased PR plans, architectural boundaries for refactors); anticipate pitfalls via agent-assisted exploration during drafting.[3]

## Real-World Examples

**Uber's five-step RFC process: (1) plan before building, (2) document, (3) seek approval, (4) distribute for feedback, (5) iterate.** Scaled successfully to thousands of engineers; Gergely Orosz at The Pragmatic Engineer documented this.[2]

**IETF RFC guidelines (draft-ietf-opsawg-rfc5706bis-03, updated 2026-03-02):** Authors follow specific instructions for clarity/completeness; drafts gain traction via feedback before review by experts like Benoit Claise, Joe Clarke; intended as Best Current Practice for operations/management in specs.[4][7]

**Agent SOPs at Amazon (Senior Principal Engineer level):** Apply 3-level communication—Level 1 vetoes (hard rules), Level 2 advisory (references), Level 3 optional—mirroring RFC 2119 for precise instructions to teams/AI.[1]

## Common Challenges and Solutions

- **Missing Problem Statement:** Leads to endless projects without "why," affecting stakeholders/costs; solution: Start with "What problem? Who? Cost of inaction?"[2]
- **Design-Implementation Gap:** Theoretical specs fail at scale (e.g., bad APIs/data models); hits junior engineers hardest as they can't predict pitfalls; solution: Spike prototypes first (2 days), then document learnings (constraints, surprises).[3][5]
- **Over-Specification for Internal Teams:** 200-page docs unnecessary without IETF-style interoperability; wastes time vs. direct Slack/repo collaboration; solution: One-paragraph problem statement + post-spike doc.[5]
- **Ambiguity in Coordination:** Strangers (e.g., Mozilla/Google/Siberia dev) need detailed RFCs for compatibility; internal teams don't; solution: Match doc depth to coordination needs (e.g., public APIs yes, 8-person team no).[5]

**Next Steps:** Draft your next RFC using the 6-section template from Iago Cavalcante (adapt for prompts: problem=context, constraints=rules).[2] Prototype via AI agent for 48 hours, then iterate per Uber process.[2][3] Review against RFC 2119 keywords.[1]
