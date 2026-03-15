# Write a post-incident review template that promotes learning over blame. Include

## Phase 1: User Context
- **Task ID**: `t_mms6ynxldoa3`
- **Engine**: general
### Request
> Write a post-incident review template that promotes learning over blame. Include timeline format, contributing factors, and action items.

## Phase 2: Board Deliberation
**Objective**: Create a post-incident review template that focuses on learning and improvement rather than assigning blame.
**Strategy**: Research best practices for post-incident reviews that emphasize learning over blame. Synthesize findings into a structured template that includes a timeline, contributing factors, and action items. Ensure the template is clear, concise, and actionable.

## Phase 3: Execution

### Step 1: Research Best Practices for Post-Incident Reviews [perplexity]
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
- Trend analysis acros

### Step 2: Synthesize Post-Incident Review Template [openai]
## Key Findings

1. **Structured Four-Stage Framework**: Effective post-incident reviews should follow a structured four-stage process focusing on recap, review, analysis, and planned improvements to promote learning and systemic improvements over individual blame.

2. **Timeline Reconstruction**: Utilize specific data points such as monitoring alerts, ticketing timestamps, communication logs, and event flow documentation to accurately reconstruct the incident timeline. This aids in understanding the sequence of events without exhaustive investigation.

3. **Blameless Analysis for Contributing Factors**: Focus on documenting what went well, areas for improvement, and underlying systemic issues rather than individual mistakes. This encourages a culture of learning and continuous improvement.

## Detailed Analysis

### Four-Stage Framework

- **Post-Incident Recap**: Begin with a clear documentation of the expectations and context before the incident occurred. This sets the stage for understanding deviations from the norm.
  
- **Incident Review**: Detail the incident with specifics on what happened, who was involved, and the timing and location of events. This factual recounting helps in setting a baseline for analysis.

- **Incident Analysis**: Evaluate the incident by identifying successful strategies that can be replicated and areas where the response fell short. Focus on systemic issues rather than individual errors to foster a learning environment.

- **Planned Improvements**: Define actionable steps to prevent future incidents, assign responsibilities, and set timelines for follow-up. This ensures accountability and progress tracking.

### Timeline Reconstruction

- **Monitoring Alerts**: Capture all automated system notifications that were triggered during the incident.
  
- **Ticketing System Timestamps**: Record the creation, escalation, and resolution times from ticketing systems to understand the response flow.

- **Communication Logs**: Include records of any client or vendor escalations to identify communication gaps or delays.

- **Event Flow Documentation**: Document the sequence of events, highlighting any delays, miscommunications, or missed alerts.

### Blameless Analysis

- **What Went Well**: Identify and document successful strategies or risk mitigation efforts that exceeded expectations. This helps in reinforcing positive practices.

- **Areas for Improvement**: Analyze what didn't work and why, focusing on systemic issues rather than individual performance.

- **Systemic Issues**: Identify underlying systemic problems that contributed to the incident to address root causes effectively.

## Recommended Actions

1. **Implement the Four-Stage Framework**: 
   - **What to Do**: Adopt the structured four-stage framework for all post-incident reviews.
   - **Why**: This promotes a culture of learning and continuous improvement.
   - **Expected Outcome**: Enhanced organizational resilience and reduced recurrence of incidents.
   - 

## Phase 4: Deliverable
- /api/intake/task/t_mms6ynxldoa3/export?fmt=md
