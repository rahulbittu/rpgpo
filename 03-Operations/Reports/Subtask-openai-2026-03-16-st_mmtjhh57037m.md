# Subtask Output — Synthesize Framework for SLO and Error Budget Management
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Key Findings

1. **Industry Standard SLO Targets and Error Budget Calculations**:
   - Common SLO target for platform engineering teams is 99.9% availability, equating to approximately 43 minutes of allowable downtime per month.
   - Internal SLOs should aim for higher reliability (e.g., 99.95%) than external SLAs to provide a buffer for issue detection.

2. **Error Budget Policy Framework**:
   - An actionable framework from OneUptime outlines specific team actions based on the remaining error budget:
     - **Green (>50%)**: Normal operations.
     - **Yellow (20-50%)**: Reduce deployment frequency and prioritize reliability.
     - **Orange (1-20%)**: Freeze non-critical deployments and focus on reliability.

## Detailed Analysis

### SLI Selection
- **Service Level Indicators (SLIs)** should be chosen based on the most critical aspects of the platform's performance and reliability. Common SLIs include request latency, error rate, and system throughput.
- **Action**: Identify and measure SLIs that directly impact user experience and align with business goals.

### SLO Negotiation
- **Internal vs. External SLOs**: Set internal SLOs at 99.95% to ensure a buffer for problem detection, while external SLAs remain at 99.9%.
- **Action**: Regularly review and adjust SLOs based on historical performance data and business requirements.

### Error Budget Policies
- **Use the OneUptime framework** to guide team actions based on error budget consumption:
  - **Green**: Continue normal operations.
  - **Yellow**: Implement stricter reviews and prioritize reliability improvements.
  - **Orange**: Halt non-essential deployments and focus on resolving issues.
- **Action**: Establish clear communication and training on these policies for all team members.

### Burn Rate Alerting
- **Monitor error budget burn rate** to prevent unexpected breaches. Implement automated alerts for when the burn rate exceeds predefined thresholds.
- **Action**: Set up monitoring tools to track error budget consumption in real-time and alert the team when thresholds are approached.

### Monthly SLO Review Process
- **Conduct regular reviews** to assess SLO performance and adjust targets as necessary. Include a retrospective on incidents and learnings.
- **Action**: Schedule monthly review meetings, prepare reports on SLO performance, and discuss any necessary adjustments or improvements.

## Recommended Actions

1. **Implement SLI Monitoring**:
   - **What to do**: Deploy tools to continuously monitor chosen SLIs.
   - **Why**: To ensure real-time visibility into platform performance.
   - **Expected Outcome**: Early detection of issues and informed decision-making.
   - **First Step**: Select appropriate monitoring tools (e.g., Prometheus, Grafana) and set up dashboards.

2. **Establish Error Budget Policies**:
   - **What to do**: Formalize the error budget policy framework within the team.
   - **Why**: To provide clear guidance on actions based on budget consumption.
   - **Expected Outcome**: Improved reliability and controlled feature deployment.
   - **First Step**: Conduct a team workshop to introduce and discuss the framework.

3. **Automate Burn Rate Alerts**:
   - **What to do**: Set up automated alerts for error budget consumption.
   - **Why**: To prevent unexpected breaches and maintain service reliability.
   - **Expected Outcome**: Proactive management of error budgets.
   - **First Step**: Configure alerting rules in existing monitoring systems.

4. **Schedule Monthly SLO Reviews**:
   - **What to do**: Implement a regular review process for SLOs.
   - **Why**: To ensure continuous improvement and alignment with business goals.
   - **Expected Outcome**: Enhanced platform reliability and stakeholder satisfaction.
   - **First Step**: Schedule the first review meeting and prepare necessary performance data.

By following these detailed steps and recommendations, the platform engineering team can effectively manage SLOs and error budgets, ensuring high reliability and performance.
