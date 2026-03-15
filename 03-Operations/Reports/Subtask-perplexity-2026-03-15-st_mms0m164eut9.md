# Subtask Output — Research Data Governance Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Data Ownership
Data governance frameworks emphasize clear roles like data stewards and owners for accountability. Establish a governance framework specifying roles, processes, and ownership for data quality, including data stewards assigned to specific assets.[3] Practical implementation assigns accountability to data stewards with measurable thresholds per AI use case.[5] Source: https://www.ewsolutions.com/foundations-data-quality-management/[3]; https://agility-at-scale.com/ai/data/ai-data-quality-standards/[5].

**Next step:** Map your data assets to 3-5 stewards using a RACI matrix; review quarterly.

## Quality Standards
Core dimensions include accuracy (correct real-world values), completeness (no missing mandatory fields), consistency (one version of truth across systems), timeliness (up-to-date availability), validity (adheres to formats like CCYYMMDD), and uniqueness (no duplicates).[3] ISO 8000 provides the international benchmark framework across these dimensions.[4] Define business-aligned metrics like percentage of complete records tied to outcomes (e.g., reduced verification time).[6] Source: https://estuary.dev/blog/data-quality/[4]; https://www.ewsolutions.com/foundations-data-quality-management/[3]; https://in.springverify.com/blog/data-governance-best-practices/[6].

**Next step:** Audit 10 key datasets against these 6 dimensions; target 95% compliance in 30 days using tools like Apache Griffin.

## Access Controls
Incorporate metadata management for secure access control and approval flows, tracking lineage for compliance.[2] Designate approval flows in tools like Decube for governance.[2] Align with compliance like SOC 2, HIPAA, GDPR via clear organizational needs assessment.[9] Source: https://www.decube.io/post/4-best-practices-to-enhance-your-data-ingest-process[2]; https://app.daily.dev/posts/4-essential-data-quality-guidelines-for-data-engineers-ulqcswdve[9].

**Next step:** Implement role-based access in your metadata tool (e.g., Decube); test with 5 user roles this week.

## Documentation Requirements
Govern master data and metadata with timestamps for versioning and lineage tracing.[1] Maintain comprehensive metadata on sources, transformations, storage via automated crawling (e.g., Decube refreshes without manual updates).[2] Use data profiling to document structural characteristics, anomalies, relationships.[1] Source: https://www.xenonstack.com/insights/data-quality-management[1]; https://www.decube.io/post/4-best-practices-to-enhance-your-data-ingest-process[2].

**Next step:** Profile top 3 datasets with Apache Griffin; auto-generate metadata docs in JSON/CSV format.

## Monitoring
Automate quality checks at entry points (forms, APIs, ETL) to catch issues early, reducing costs by 30% and issues by 40-60%.[8] Use dashboards like OpenTSDB for continuous visibility (historical via Apache Griffin, real-time via AWS Deequ).[1] Automate reporting with alerts to email/Slack on anomalies via ML thresholds.[2] Apply DMAIC (Define, Measure, Analyze, Improve, Control) for systematic monitoring.[4] Source: https://www.xenonstack.com/insights/data-quality-management[1]; https://atlan.com/know/data-standardization-best-practices/[8]; https://www.decube.io/post/4-best-practices-to-enhance-your-data-ingest-process[2]; https://estuary.dev/blog/data-quality/[4].

**Next step:** Deploy AWS Deequ on one Spark pipeline; set 5 constraints and daily alerts targeting <1% anomaly rate.
