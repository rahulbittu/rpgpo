# Subtask Output — Research Data Lakehouse Components
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Storage Layer
Data lakehouse architectures use cloud object storage for scalable, cost-effective raw data storage in open formats, often with transactional overlays for ACID compliance.

- **Amazon S3, Azure Data Lake Storage (ADLS), Google Cloud Storage (GCS)**: Primary storage backends; e.g., GCP setup uses separate buckets like `gs://myproject-lakehouse-bronze` (raw), `gs://myproject-lakehouse-silver` (cleaned), `gs://myproject-lakehouse-gold` (aggregated) with lifecycle rules for cost optimization.[1][4]
- **Transactional formats**: Delta Lake, Apache Iceberg, Apache Hudi for ACID transactions, schema enforcement, time travel, and versioning; enables concurrent writes and rollbacks on S3-like storage.[1][2]
- Source: https://sawaat.com/the-data-lakehouse-guide-architecture-top-platforms-and-how-databricks-powers-modern-data-teams/[1]; https://elvenite.se/en/articles/what-is-a-modern-data-platform/[2]; https://oneuptime.com/blog/post/2026-02-17-how-to-build-a-data-lakehouse-architecture-on-gcp-using-cloud-storage-dataproc-and-bigquery/view[4]

## Compute Layer
Compute is decoupled from storage for independent scaling, supporting ETL, ML, and analytics workloads via engines like Spark.

- **Apache Spark, Dataproc (GCP), EMR/Glue (AWS)**: Core processing; e.g., Dataproc with Spark transforms bronze-to-silver/gold layers in GCP lakehouse.[3][4]
- **Databricks Mosaic AI, Lakeflow Spark Declarative Pipelines**: Handles ETL, streaming (Spark Structured Streaming), ML/AI from data prep to model serving.[3]
- Source: https://docs.databricks.com/aws/en/lakehouse-architecture/scope[3]; https://oneuptime.com/blog/post/2026-02-17-how-to-build-a-data-lakehouse-architecture-on-gcp-using-cloud-storage-dataproc-and-bigquery/view[4]

## Governance Layer
Governance ensures data quality, security, and compliance via metadata management, access controls, and lineage.

- **Unity Catalog (Databricks)**: Central governance for access control, auditing, metadata, lineage, and monitoring across data/AI assets.[3]
- **Glue (AWS), BigQuery Metastore (GCP with Iceberg)**: Metadata catalogs; includes fine-grained access, column-level security, schema validation, data quality checks.[1][2][4]
- Source: https://sawaat.com/the-data-lakehouse-guide-architecture-top-platforms-and-how-databricks-powers-modern-data-teams/[1]; https://docs.databricks.com/aws/en/lakehouse-architecture/scope[3]

## Query Engines
Multiple engines query the same storage for BI, SQL analytics, and ML without data movement.

- **Apache Spark, Presto, Trino, BigQuery, Athena, Redshift**: Analytical SQL engines; e.g., BigQuery external tables over gold layer in GCP; Athena/Redshift for AWS serving.[1][2][4]
- **Databricks SQL (DWH/BI), operational DBs**: Supports warehouse-like queries alongside ML.[3]
- Source: https://sawaat.com/the-data-lakehouse-guide-architecture-top-platforms-and-how-databricks-powers-modern-data-teams/[1]; https://elvenite.se/en/articles/what-is-a-modern-data-platform/[2]; https://docs.databricks.com/aws/en/lakehouse-architecture/scope[3]; https://oneuptime.com/blog/post/2026-02-17-how-to-build-a-data-lakehouse-architecture-on-gcp-using-cloud-storage-dataproc-and-bigquery/view[4]

**Next Steps**: Deploy GCP prototype using `gcloud storage buckets create` commands from [4] (Feb 17, 2026 guide); test Delta Lake on S3 via Databricks free trial for Unity Catalog governance.[1][3][4]
