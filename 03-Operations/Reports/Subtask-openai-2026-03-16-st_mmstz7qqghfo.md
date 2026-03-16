# Subtask Output — Synthesize Incident Response Playbook
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Analysis

### Severity Classification Framework
- **Matrix-Based System**: Implement a quantifiable severity classification using a matrix that evaluates incidents based on impact and urgency. This approach is widely adopted in the industry to ensure consistency and objectivity.[1]
  - **Impact Levels**: Define impact levels (e.g., Critical, High, Medium, Low) based on the number of affected users, financial impact, and brand reputation.
  - **Urgency Levels**: Determine urgency based on time sensitivity, such as immediate, within 24 hours, or longer.
  - **Example Matrix**:
    - Critical: Affects all users, immediate action required.
    - High: Affects a significant portion of users, action required within 24 hours.
    - Medium: Affects a moderate portion of users, action required within 72 hours.
    - Low: Minimal user impact, action can be scheduled.

### Communication Templates
- **Internal Communication**: Establish pre-defined templates for internal updates to ensure clarity and consistency.
  - **Example Template**:
    ```
    Subject: [Severity Level] Incident Update - [Incident ID]
    Body:
    - Summary of the incident
    - Current status
    - Next steps
    - Estimated resolution time
    - Contact information for the incident commander
    ```
- **External Communication**: Create customer-facing templates to maintain transparency and manage expectations.
  - **Example Template**:
    ```
    Subject: Service Disruption Notification
    Body:
    - Brief description of the issue
    - Impact on services
    - Steps being taken to resolve the issue
    - Expected resolution time
    - Apology and contact information for support
    ```

### War Room Protocols
- **Establish a Virtual War Room**: Use collaboration tools like Slack or Microsoft Teams to create a dedicated channel for real-time communication during incidents.
- **Roles and Responsibilities**: Clearly define roles such as Incident Commander, Communication Lead, and Technical Lead to streamline decision-making and accountability.
- **Regular Updates**: Schedule updates every 30 minutes to an hour to keep all stakeholders informed.

### Post-Mortem Structure
- **Structured Review**: Conduct a post-mortem within 48 hours of incident resolution.
  - **Sections**:
    - Incident Summary
    - Timeline of Events
    - Root Cause Analysis
    - Impact Assessment
    - Lessons Learned
    - Action Items
- **Example Post-Mortem Template**:
  ```
  1. Incident Summary
  2. Timeline of Events
  3. Root Cause Analysis
  4. Impact Assessment
  5. Lessons Learned
  6. Action Items
  ```

### Action Item Tracking with SLA Enforcement
- **Tracking System**: Use a project management tool like Jira or Asana to track action items from post-mortems.
- **SLA Enforcement**: Define SLAs for action item completion based on severity (e.g., Critical items resolved within 7 days).
- **Regular Reviews**: Conduct weekly reviews to ensure compliance with SLAs and adjust priorities as necessary.

## Comparison
- **Matrix vs. Subjective Classification**: The matrix system provides a more objective and consistent approach compared to subjective classifications.
- **Pre-defined Templates vs. Ad-hoc Communication**: Templates ensure clear and consistent communication, reducing the risk of misinformation.
- **Structured vs. Unstructured Post-Mortems**: A structured approach ensures comprehensive analysis and actionable outcomes.

## Recommendation
1. **Adopt the Matrix-Based Severity Classification**: Implement this system to improve objectivity and consistency in incident response.
   - **First Step**: Develop a detailed matrix tailored to your organization's specific needs and train the team on its usage.
2. **Implement Communication Templates**: Use the provided templates to streamline internal and external communications.
   - **First Step**: Customize the templates to fit your brand voice and incident response needs.
3. **Establish a Virtual War Room Protocol**: Use collaboration tools to facilitate real-time communication during incidents.
   - **First Step**: Set up dedicated channels and assign roles for incident response.
4. **Conduct Structured Post-Mortems**: Use the template to ensure thorough analysis and learning from each incident.
   - **First Step**: Schedule regular post-mortem meetings and assign a facilitator.
5. **Track Action Items with SLAs**: Use project management tools to enforce SLAs and track action item completion.
   - **First Step**: Define SLAs for different severity levels and integrate them into your tracking system.

## Risks & Disclaimers
- **Over-reliance on Templates**: Ensure that templates are regularly reviewed and updated to remain relevant.
- **SLA Non-compliance**: Regular monitoring and management commitment are essential to enforce SLAs effectively.
- **Complexity of Matrix System**: Ensure the matrix is not overly complex to avoid confusion and ensure ease of use.

[1] Source: Industry-standard practices for SaaS incident response (2026)
