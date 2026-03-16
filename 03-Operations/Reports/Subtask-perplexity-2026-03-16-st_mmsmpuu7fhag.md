# Subtask Output — Research Idempotent API Design
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Finding 1: Idempotent Processing for Pub/Sub Message Deduplication
OneUpTime blog outlines making processing logic **idempotent** as the cleanest strategy for handling duplicates in subscriber applications, where reprocessing the same message yields identical results. Examples include SQL `UPDATE users SET status = 'active' WHERE id = 123`, upserts with unique keys, and deterministic file writes. For non-idempotent cases, use Redis-based message ID tracking with TTL (e.g., 24 hours) to check existence before processing[2].

**Code Example (Python with BigQuery MERGE for database-level dedup):**
```
query = """
MERGE `analytics.events` AS target
USING (SELECT @event_id AS event_id, @event_type AS event_type,
              @payload AS payload, @timestamp AS event_timestamp) AS source
ON target.event_id = source.event_id
WHEN NOT MATCHED THEN
  INSERT (event_id, event_type, payload, event_timestamp)
  VALUES (source.event_id, source.event_type, source.payload, source.event_timestamp)
"""
```
This inserts only if `event_id` doesn't exist, ensuring idempotency. Published 2026-02-17.
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-handle-pubsub-message-deduplication-in-subscriber-applications/view[2]

## Finding 2: Hash-Based Deduplication for Exact Matches in APIs and Data Pipelines
Tendem.ai's 2026 guide recommends **exact match deduplication** as the first pass for APIs handling scraped or ingested data: compute hashes (e.g., MD5 or SHA-256) across all fields and remove matching records. Follow with **key-based deduplication** using composite keys like SKU + retailer (catches 80-90% of duplicates in product data per guide benchmarks). For near-duplicates, apply fuzzy matching with Levenshtein distance or Jaro-Winkler (threshold >0.85 similarity), assigning confidence scores (>0.95 auto-merge, <0.75 flag for review). Standardize formats first (e.g., normalize addresses)[1].

Fast.io details hash-based pre-upload validation for AI agent APIs: compute SHA-256 hashes on files >1MB, compare against index, discard matches. Use webhooks for real-time post-upload scans via Model Context Protocol (MCP) tools like `list_files`[3].
Source: https://tendem.ai/blog/cleaning-scraped-data-guide[1]
Source: https://fast.io/resources/ai-agent-file-deduplication/[3]

## Finding 3: Database and Query-Level Deduplication Patterns
Apache Pinot docs (latest as of 2026) specify **upsert and dedup** for real-time tables: partition streams by primary key, use `strictReplicaGroup` routing (`instanceSelectorType: "strictReplicaGroup"`, `numInstancesPerPartition: 1`), and enable dedup indexing to retain latest record per key. Memory overhead: 2-3x higher than standard tables due to key bookkeeping[7].

Google Chronicle's YARA-L queries use `dedup` operator on fields like `principal.ip` or `principal.hostname` to collapse duplicate events (e.g., multi-system logs of one login). Example query dedups network connections by IP before aggregating bytes:
```
dedup: principal.ip
```
Shortest time ranges recommended to minimize false uniques[6].
Source: https://docs.pinot.apache.org/manage-data/data-import/upsert-and-dedup/dedup[7]
Source: https://docs.cloud.google.com/chronicle/docs/investigation/deduplication-yaral[6]

## Limitations of Search Results
No results directly matched "idempotent APIs" with retry handling (e.g., exponential backoff, circuit breakers) or distributed transactions (e.g., Saga pattern, 2PC in Kafka Streams). Deduplication strategies dominate (e.g., Redis TTL, BigQuery MERGE, hashes), applicable to API idempotency via client-provided `idempotency-key` headers checked in databases. For retries, infer from idempotency: safe with unique constraints (success rate >99% in Pub/Sub per [2]). Next steps: Implement BigQuery MERGE prototype (test with 10k events), benchmark hash compute time (<50ms/file on SHA-256)[1][2][3].
