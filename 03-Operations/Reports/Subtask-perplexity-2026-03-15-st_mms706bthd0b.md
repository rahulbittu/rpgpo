# Subtask Output — Research Best Practices for Post-Incident Reviews
## Model: sonar
## Stage: audit
## Date: 2026-03-15

# Post-Incident Review Best Practices: Learning-Focused Approach

**Effective post-incident reviews prioritize organizational learning by using structured templates, rapid timeline reconstruction, and blameless analysis to identify systemic improvements rather than individual fault.**

## Core Structure: Four-Stage Framework

Post-incident reviews follow a **four-stage process**[2]:

1. **Post-incident recap** — Document expectations and context before the incident
2. **Incident review** — Describe what actually happened, who was involved, and when/where events occurred
3. **Incident analysis** — Evaluate what went well, what didn't, and why
4. **Planned improvements** — Define corrective actions, assign responsibility, and set follow-up timelines

## Timeline Reconstruction: Essential Data Points

Build incident timelines using these specific inputs[1]:

- **Monitoring alerts** — Automated system notifications that triggered
- **Ticketing system timestamps** — Creation, escalation, and resolution times
- **Communication logs** — Client or vendor escalation records
- **Event flow documentation** — Identifies delays, miscommunications, or missed alerts during response

This approach provides clarity without requiring exhaustive forensic investigation[1].

## Identifying Contributing Factors: Blameless Analysis

The analysis phase should document[2]:

- **What went well** — Employee performance, effective strategies, or risk mitigation that exceeded expectations (to replicate in future incidents)
- **Challenges encountered** — Failed technology, cascading threats, or systemic gaps
- **Root causes** — Focus on **primary cause and prevention rather than individual blame**[1]

Ensure every participant has an opportunity to share their experience[2], creating psychological safety for honest discussion.

## Structuring Action Items for Improvement

**Prevention-focused deliverables** should include[1]:

- **Prevention notes** — Attached to standard operating procedure (SOP) documentation
- **RCA trend analysis** — Share insights during governance meetings and quarterly business reviews (QBRs)
- **Lessons-learned sessions** — Formal meetings with all response team members to identify security control gaps and plan adjustments[5]
- **Responsible parties and timelines** — Assign ownership and deadlines for each corrective action[2]

## Practical Implementation: Lightweight Template

Keep post-incident reviews **concise and efficient** using[1]:

- **One-page RCA template** — Reduces burden while maintaining accountability
- **Automated input collection** — Gather evidence and timeline data programmatically to reduce manual effort
- **Plain-language client summary** — Present findings in clear language to build trust and transparency[1]
- **Narrow scope** — Focus on actionable insights rather than exhaustive technical deep dives[1]

## Documentation and Continuous Improvement

**Archive RCA reports** for[1]:

- Compliance verification
- Trend analysis across multiple incidents
- Continuous service improvement
- Long-term pattern identification

This creates institutional memory and prevents recurring incident types[3].
