# Write a post-mortem template for a production incident. Include timeline, root c

## 1. Context

- **Task ID**: `t_mmrzv7ggtyx7`
- **Engine**: general
- **Status**: done
- **Created**: 2026-03-15T16:54:10

### User Request

> Write a post-mortem template for a production incident. Include timeline, root cause analysis, impact assessment, action items, and lessons learned. Make it blame-free and actionable.

## 2. Board Deliberation

- **Objective**: Create a comprehensive and actionable post-mortem template for production incidents.
- **Strategy**: Research existing post-mortem templates to gather best practices and common elements. Synthesize these findings into a clear, concise, and actionable template that aligns with the request for a blame-free approach.
- **Subtasks**: 2

## 3. Subtask Execution

### Subtask 1: Research Post-Mortem Templates
- Model: perplexity | Stage: audit | Status: done

### Subtask 2: Synthesize Post-Mortem Template
- Model: openai | Stage: report | Status: done

## 4. Final Output

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
   - **Why**: Identifies underlying issues that need addressing to prevent future incidents.
   - **Expected Outcome**: Systematic improvements and reduced recurrence of similar incidents.
   - **First Step**: Train team members on conducting effective root cause analysis using the provided templates.

4. **Create Specific and Accountable Action Items**
   - **What**: Develop action items with specific tasks, owners, and deadlines.
   - **Why**: Ensures accountability and tracks progress on resolving issues.
   - **Expected Outcome**: Timely implementation of improvements and reduced incident recurrence.
   - **First Step**: Assign a project manager to oversee the creation and tracking of action items post-incident.

5. **Document and Share Lessons Learned**
   - **What**: Document lessons learned from each incident and share them across teams.
   - **Why**: Promotes organizational learning and prevents similar incidents.
   - **Expected Outcome**: A more resilient and informed team capable of handling future challenges.
   - **First Step**: Set up a shared repository for lessons learned and encourage regular team reviews.
