# Subtask Output — Research Engineering Team Health Metrics
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Velocity Trends
- **Sprint Predictability**: Measures how closely actual velocity matches planned work; consistent alignment (e.g., within 10-20% variance) indicates reliable estimation and scoping, while slips across sprints signal unclear scope or dependencies[1][2][4].
- **Sprint Throughput**: Tracks features shipped per sprint; high performers maintain steady trends without overload, reviewed in retrospectives to spot scaling issues[2][5].
- **Planning Accuracy**: Gap between committed and completed work; teams with <10% slip operate with better upfront info like clearer requirements[4].

## Quality Metrics
- **DORA Metrics** (from Google's DevOps Research and Assessment, ongoing since 2014): Deployment Frequency (elite: daily), Lead Time for Changes (elite: <1 day), Change Failure Rate (elite: 0-15%), Mean Time to Recovery (MTTR, elite: <1 hour)[1][2].
- **Defect Escape Rate**: Bugs reaching production; high rates (>5%) indicate weak "done" definitions (e.g., missing post-merge observation); target explicit testing gates[4].
- **Change Failure Rate and Main Branch Success Rate**: Top 2026 teams hit >90% success with AI-driven changes; track branch-level throughput separately to diagnose integration issues[2][6].
- **Rework Rate**: Redos due to missed foundations (e.g., redesigns post-tooling); measure via milestone confidence scores (mechanical, electrical); good = improving confidence correlating to <5% surprises[3].

## Team Satisfaction Proxies
- **Employee NPS/eNPS**: Scores team loyalty/satisfaction; quarterly pulse surveys (5-10 questions) surface burnout early; act on top 2-3 themes with progress reports[1][2].
- **Developer Experience (DevEx) Scores**: Quarterly surveys on tooling, build times (<6s median for top teams), deployment friction; poor scores predict attrition and slowdowns[2][6].
- **Engagement Surveys**: Team-specific, quarterly; track voluntary turnover (<10% annual) and onboarding ramp (<2 weeks); share results transparently[2][5].

## Delivery Predictability
- **Cycle Time**: From ticket to merge/production; elite <1 day, balances with DORA for workflow efficiency[2][5].
- **Deployment Frequency and Lead Time**: DORA elites deploy daily with <1 day lead; 2026 top teams maintain 6s workflow duration via validation investments[1][2][5][6].
- **Context Switching Rates**: Task switches across projects; high rates erode predictability; limit to focus velocity[1].

## Early Warning Indicators
- **Incident Volume and MTTR Trends**: Rising incidents or MTTR >60min signals resilience gaps; 2026 winners trend downward (59.2min median)[1][6].
- **Uptime/Availability**: <99.9% warns of quality issues; pair with rollback frequency[1][5].
- **Branch Throughput Trends**: Rising feature branch but flat main branch = integration problems; review per sprint[6].
- **Confidence Scores at Milestones**: Declining team confidence predicts rework/schedule slips[3].

## Recommended Dashboard (3-5 Metrics)
Start with DORA set + one health proxy (e.g., eNPS or DevEx); review trends in sprint retros, not dashboards. Top 2026 pattern: Balance delivery (throughput), quality (failure rate), sustainability (health scores)[1][2][4][6].

**Next Steps**:
- Instrument Git/tools for DORA via free calculators (e.g., EM Tools)[2].
- Run quarterly DevEx survey; target build times <10s[2].
- Track 1 early warning (e.g., rework confidence) in next retrospective[3].
