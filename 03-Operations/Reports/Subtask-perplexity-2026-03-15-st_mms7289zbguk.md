# Subtask Output — Research Data Lineage and Cataloging
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Intelligent Databases for Data Lineage Tracing
Tencent Cloud's TDSQL distributed database, created March 6, 2026, uses metadata collection, automated AI-driven lineage mapping, and ML-powered insights for tracing data from sources through ETL to destinations, supporting GDPR/HIPAA compliance. It captures schema, transformations, and dependencies; visualizes flows (e.g., financial transaction data from logs to risk models); detects anomalies and suggests optimizations. Paired with Tencent Cloud Data Lake Explorer for governance and auditing.
Source: https://www.tencentcloud.com/techpedia/142217[1]

## Finding 2: Types and Examples of Data Lineage
Kanerika defines forward lineage (source to target transformations), backward lineage (origins), and horizontal lineage (intra-system dependencies); distinguishes technical lineage (ETL steps) from business lineage (organizational context). Example: Breadcrumb trail of a dataset's origin, processing, and end-use for quality and debugging. Differs from data models, which describe structure vs. lineage's history.
Source: https://kanerika.com/blogs/data-lineage/[2]

## Finding 3: Microsoft Purview and Fabric for Data Cataloging with Lineage
Microsoft Purview Data Catalog (updated July 2, 2025) extracts lineage across data lifecycle for troubleshooting, compliance, and self-service discovery, integrating with Azure Data Factory for ingestion and Apache Atlas API. Microsoft Fabric provides native lineage; scanning Fabric tenants imports Power BI metadata into Purview. Primary feature: Shows dependencies from raw data to products via transformations.
Source: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/cloud-scale-analytics/govern-lineage[3]

## Finding 4: Data Lineage Critical for Enterprise AI in 2026
Ertas.ai emphasizes tracing training dataset records through transformations, redactions, and annotations back to origins as essential for AI teams.
Source: https://www.ertas.ai/blog/what-is-data-lineage-ai-enterprise[4]

## Finding 5: Data Lineage Drives EBITDA via Governance (March 19, 2026)
CDO Magazine reports expert McQuillan: Start with data lifecycle (not AI-only), prioritizing core datasets for quality, lineage, cataloging; traces pipelines from provisioning to AI output, reducing troubleshooting drag on teams (product/legal/engineering). Well-governed AI needs labeled data, clear lineage, strong pipelines; confirms AI suitability before GenAI use.
Source: https://www.cdomagazine.tech/aiml/how-data-lineage-and-ai-governance-translate-into-ebitda-gains[5]

## Finding 6: Key Features of Data Lineage Tools
Ovaledge highlights visual representation of data flows and relationships as core for lineage tools.
Source: https://www.ovaledge.com/blog/top-features-data-lineage-tool?hs_amp=true[6]

**Next Steps**: Evaluate TencentDB/TDSQL (free trial at tencentcloud.com) or Microsoft Purview (scan Fabric tenant for lineage import); test Kanerika tools via demo booking for forward/backward tracing[1][2][3].
