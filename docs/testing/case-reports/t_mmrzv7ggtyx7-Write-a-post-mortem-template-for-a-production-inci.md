# Write a post-mortem template for a production incident. Include timeline, root c

## Phase 1: User Context

- **Task ID**: `t_mmrzv7ggtyx7`
- **Engine**: general
- **Urgency**: normal
- **Created**: 2026-03-15T16:54:10

### Operator Context (auto-injected)
- Rahul, Senior Data Engineer / Entrepreneur, Austin TX
- Output style: Specific, actionable, cited. No generic frameworks.

### Request
> Write a post-mortem template for a production incident. Include timeline, root cause analysis, impact assessment, action items, and lessons learned. Make it blame-free and actionable.

## Phase 2: Board of AI Deliberation

**Chief of Staff**: "Create a comprehensive and actionable post-mortem template for production incidents."

**Strategy**: Research existing post-mortem templates to gather best practices and common elements. Synthesize these findings into a clear, concise, and actionable template that aligns with the request for a blame-free approach.

**Risk**: green | **Code Task**: No

**Execution Plan**:

| Step | Task | Model | Stage |
|------|------|-------|-------|
| 1 | Research Post-Mortem Templates | perplexity | audit |
| 2 | Synthesize Post-Mortem Template | openai | report |

## Phase 3: Execution

### Step 1: Research Post-Mortem Templates [perplexity]

**Status**: done | **Stage**: audit

## Google Cloud Blameless Postmortem Template
OneUptime provides a structured template for blameless postmortems on Google Cloud incidents, emphasizing learning over blame. Key sections include Summary (date, duration, severity, affected GCP services, impact), Timeline table (UTC times for alerts, acknowledgment, root cause, fix, recovery), Root Cause (specific GCP resources/configurations/code), Detection (method, delay, missed alerts), Response (diagnosis, mitigation, resolution steps), Contributing Factors (systems/processes/tooling list), What Went Well/What Could Be Improved (bulleted lists), Action Items table (action, owner, priority, due date, status), and Lessons Learned.[1]

**Example Timeline Table Format:**
| Time | Event |
|------|-------|
| HH:MM | First alert triggered |
| HH:MM | On-call engineer acknowledged |[1]

## Terraform Incident Postmortem Template
OneUptime's Terraform-specific template (in YAML format) covers incident ID, date, severity, duration, impact, timeline (detection time/method), and action items (with duration notes like 10 minutes for defining assignable items). Best practices: Maintain blameless culture by questioning system allowances for mistakes; investigate near-misses (e.g., plans caught in review); use structured investigation for declarative state management gaps between plan/apply.[2]

**Example YAML Snippet:**
```
incident:
  id: "INC-XXXX"
  date: "YYYY-MM-DD"
  severity: "P1/P2/P3"
```
[2]

## General Blameless Post-Incident Review (PIR) Template
IT Leadership Hub outlines a PIR document with Summary (1-3 sentences on what happened, duration, resolution), Impact (quantified: users affected, degradation duration, SLA/revenue loss). Process: Schedule review in 48-72 hours; build shared timeline collaboratively (from normal state to resolution, using logs); separate factors (people/process/technology/context); generate 5-8 SMART action items with single owners. Post-review: Publish draft in 24 hours, track in project tool, 30-day follow-up, quarterly pattern reviews.[3]

**Follow-Through Checklist Items:**
- Draft PIR published within 24 hours
- Action items with owner/due date acknowledged
- Priority assigned; stakeholders briefed (no blame)
- PIR searchable for reference[3]

## UX Teams Postmortem Best Practices
NN Group recommends UX postmortems with psychological safety (facilitator states "improve system, not blame"), root-cause via "five whys" (e.g., high checkout abandonment → why? → unverified participants), and system-focused deliverables (e.g., "Add stakeholder-review gate post-research"; "Update recruitment checklist"; "Prelaunch analytics review"). Document: 2-3 pages covering overview/goals, metrics/outcomes, findings, deliverables/owners, timeline. Changes target processes (checklists/reviews) or culture (e.g., default designer-researcher pairing).[4]

## Industry Metrics and Repeat Prevention
Sherlocks.ai highlights postmortems reducing repeats: Aim for zero incidents recurring in 30 da

*... truncated (3851 chars total)*

### Step 2: Synthesize Post-Mortem Template [openai]

**Status**: done | **Stage**: report

## Key Findings

1. **Structured and Blameless Approach**: Both Google Cloud and Terraform templates emphasize a structured and blameless approach to post-mortems, focusing on learning and improvement rather than assigning blame. This is crucial for fostering a culture of openness and continuous improvement.

2. **Comprehensive Timeline and Root Cause Analysis**: The templates provide detailed sections for timeline and root cause analysis, allowing for a clear understanding of the sequence of events and underlying issues.

3. **Actionable Items and Lessons Learned**: Both templates stress the importance of actionable items and lessons learned, ensuring that the team can implement changes to prevent future incidents.

## Detailed Analysis

- **Timeline Section**: A detailed timeline is crucial for understanding the sequence of events. The Google Cloud template uses a table format to log specific times for alerts, acknowledgments, and resolutions, which helps in pinpointing delays or inefficiencies in the response process.

- **Root Cause Analysis**: This section should delve into specific configurations, code, or resources that contributed to the incident. The focus should be on understanding how the system allowed the issue to occur, rather than who caused it.

- **Impact Assessment**: Both templates include an impact assessment, detailing the severity and duration of the incident, as well as the affected services. This helps in quantifying the incident's effect on the business and prioritizing response efforts.

- **Action Items**: Action items should be specific, with clear ownership, priorities, due dates, and status updates. This ensures accountability and tracks progress on implementing improvements.

- **Lessons Learned**: A reflective section that captures insights and knowledge gained from the incident, which can be shared across teams to prevent recurrence.

## Recommended Actions

1. **Implement a Blameless Post-Mortem Culture**
   - **What**: Adopt a blameless post-mortem culture as outlined in the Google Cloud and Terraform templates.
   - **Why**: Encourages open discussion and learning from incidents without fear of blame.
   - **Expected Outcome**: Improved team morale and more effective incident management.
   - **First Step**: Conduct a team meeting to discuss the benefits of a blameless culture and introduce the new post-mortem process.

2. **Utilize a Detailed Timeline Format**
   - **What**: Use a detailed timeline format for documenting incidents.
   - **Why**: Provides clear visibility into the incident's progression and helps identify response delays.
   - **Expected Outcome**: Enhanced understanding of incident dynamics and quicker identification of process improvements.
   - **First Step**: Integrate the timeline table format into your incident reporting tool.

3. **Conduct Thorough Root Cause Analysis**
   - **What**: Focus root cause analysis on system and process failures.
   - **Why**: Identifies underlying issues tha

*... truncated (4094 chars total)*

## Phase 4: Deliverable

- **Status**: done
- **Subtasks**: 2/2 completed
- **Download MD**: /api/intake/task/t_mmrzv7ggtyx7/export?fmt=md
- **Download JSON**: /api/intake/task/t_mmrzv7ggtyx7/export?fmt=json
