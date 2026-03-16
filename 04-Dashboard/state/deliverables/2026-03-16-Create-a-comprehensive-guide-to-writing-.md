# Create a comprehensive guide to writing an effective engineering RFC/design docu

**Domain:** writing | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Current Best Practices for Engineering RFCs
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

## Synthesize Guide for Writing Engineering RFCs
## Comprehensive Guide for Writing Effective Engineering RFCs

### RFC Template Structure

1. **Problem Statement**
   - Clearly define the issue or opportunity the RFC addresses.
   - **First Step**: Gather data and metrics to quantify the problem.

2. **Proposed Solution**
   - Detail the solution, including technical specifics and how it resolves the problem.
   - **First Step**: Draft a high-level overview and refine through iterations.

3. **Constraints**
   - List any limitations or requirements that the solution must adhere to.
   - **First Step**: Identify technical, resource, or time constraints.

4. **Non-Goals**
   - Specify what is out of scope to prevent scope creep.
   - **First Step**: Discuss with stakeholders to align on priorities.

5. **Open Questions**
   - Highlight unresolved issues or areas needing further research.
   - **First Step**: Engage with experts or stakeholders to address these questions.

6. **Acceptance Criteria**
   - Define clear, measurable outcomes that signify the RFC's success.
   - **First Step**: Collaborate with QA and stakeholders to set realistic criteria.

### Stakeholder Identification

- **Identify Key Stakeholders**: Include team leads, engineers, product managers, and cross-functional team members.
- **First Step**: Create a stakeholder map to ensure all relevant parties are engaged early.

### Trade-off Analysis Format

- **Criteria**: List the factors to evaluate (e.g., cost, time, performance).
- **Options**: Present different approaches with pros and cons.
- **Decision**: Recommend a course of action based on the analysis.
- **First Step**: Gather data for each criterion to support objective decision-making.

### Decision Record

- **Document Decisions**: Record the rationale, alternatives considered, and final decision.
- **First Step**: Use a decision log template to maintain consistency and clarity.

### Strategies for Fostering Productive Review Discussions

- **Use Clear Language**: Avoid jargon; ensure the document is accessible to all reviewers.
- **Visual Aids**: Incorporate diagrams and flowcharts to simplify complex concepts.
- **Feedback Loops**: Implement structured feedback sessions with clear timelines.
- **First Step**: Schedule a kickoff meeting to align on review expectations and timelines.

### Additional Best Practices

- **Use RFC 2119 Keywords**: Apply MUST, SHOULD, and MAY to clarify requirements and preferences.
- **Durable Documentation**: Treat RFCs as living documents that evolve with the project.
- **First Step**: Establish a version control system to track changes and updates.

By following this guide, engineering teams can create effective RFCs that facilitate clear communication, align stakeholders, and drive successful project outcomes. [Sources: 1, 2, 3, 6]

**Word Count: 448**