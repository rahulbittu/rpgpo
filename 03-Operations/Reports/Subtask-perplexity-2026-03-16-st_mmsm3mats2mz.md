# Subtask Output — Research Data Governance Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Data Classification Best Practices
- **Classify data by sensitivity and business context** to enable consistent policy application; categorize as part of initial governance setup for analytics environments[1].
- **Assign data owners and stewards** for accountability in classification and approval processes[1][6][7].
- **Embed classification in ingestion workflows** with automated metadata refresh and ML-powered tests, reducing compliance violations by 52% in governed organizations[2].

## Access Controls Best Practices
- **Implement RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control)** with least privilege and separation of duties to prevent privilege creep[1][7].
- **Enforce time-bound access requests, approvals, and automated revocation**; conduct periodic reviews and audits for anomalies[1].
- **Use role-based access with audit trails** for data definitions and standards, ensuring traceable changes; integrate with security tools[1][7].
- **Apply Governance as Code (GaC)** for automated policy enforcement across environments, especially with new regulations[4].

## Retention Policies Best Practices
- **Define data lifecycle management** including retention in governance policies; uphold quality standards (accurate, complete, consistent, up-to-date) to support retention decisions[6].
- **Integrate retention into workflows** with ongoing monitoring, automated checks, and audits during ingestion and operations[2].
- **Manage existing systems iteratively**, focusing on high-value/critical data for quick benefits in retention harmonization (tested 2024-2025)[3].

## GDPR and CCPA Compliance Best Practices
- **Establish comprehensive policies** covering classification, access controls, and compliance requirements as foundational practices[2].
- **Conduct Privacy Impact Assessments (PIAs/DPIAs), data minimization, transparency, and lawful basis checks**; build on existing privacy mapping and vendor risk processes[5].
- **Integrate oversight in workflows** with automated compliance monitoring and alerts; align with business goals for ROI, including regulatory standards[2].
- **Use structured inventories and risk management** previewed in U.S. agency AI governance (applicable to data practices), with gates for vendor assessments, security reviews, and incident response[5].

## Key Frameworks and Tools (2026)
| Framework/Tool | Key Features | Source |
|---------------|--------------|--------|
| **OvalEdge Platform** | Centralized policy management, automated compliance workflows, RBAC/ABAC support[1] | https://www.ovaledge.com/blog/complete-guide-to-data-access-governance |
| **Decube** | Automated crawling, ML tests, smart alerts for ingestion governance (66% security boost)[2] | https://www.decube.io/post/4-best-practices-to-enhance-your-data-ingest-process |
| **Adnia's 6 Pillars** | Strategic IDGC team, tools for lineage/catalogs, gradual deployment (2024-2025 tested)[3] | https://adniaconseils.ca/en/the-6-pillars-of-effective-data-governance-a-simple-and-operational-model-for-2026/ |
| **Governance as Code (GaC)** | Auto-enforces policies at data creation for multi-environment compliance[4] | https://www.tierpoint.com/blog/cloud/trends-in-data-management/ |
| **Atlan** | Domain stewards, entry-point validation (40-60% fewer issues), naming as policy[7] | https://atlan.com/know/data-standardization-best-practices/ |

**Next Steps**: Audit current access patterns using tools like OvalEdge (start with free trial at linked site); pilot RBAC/ABAC on one dataset, targeting 52% violation reduction per Decube benchmarks; map GDPR/CCPA gaps via PIAs as in OneTrust guide[1][2][5].
