# Subtask Output — Research Current Interview Trends
## Model: sonar
## Stage: research
## Date: 2026-03-16

## SQL Interview Questions for Senior Data Engineers

Senior data engineer interviews heavily emphasize multi-table operations (70% of Amazon SQL questions involve JOINs, CTEs, or subqueries), aggregation with GROUP BY/window functions, and filtering/sorting[1]. Common questions test boundary conditions, output grain (e.g., one row per department/employee/month), and readable logic without DISTINCT patches[1].

- **Multi-table merging example (Amazon-style):** Given `worker` and `titles` tables, find departments with max average salary for workers with official titles (preserve ties, filter post-aggregation). Strong solution uses window functions or subquery for max over filtered population[1].
- **Aggregation with date filter:** Count headcount by department for workers joined on/after a date (e.g., `worker` table: GROUP BY department, WHERE join_date >= '2020-01-01')[1].
- **Ticket analysis:** From `amazon_support_tickets` (status, satisfaction_score), compute average satisfaction per employee on resolved tickets (ignore NULLs, employee-level grain)[1].
- **MERGE statement:** Explain/use for upserting target table from source (combines INSERT/UPDATE/DELETE for sync)[2].
- **Optimization:** Use query hints, indexes, execution plans; profile bottlenecks[2].

## System Design Interview Questions

Focus on scalability: partitioning, sharding, caching for large-scale apps[2].

- **Design database schema for large app:** Normalize data, use foreign keys for relationships, index lookups; plan growth via partitioning/sharding/caching[2].
- **Data pipeline scalability:** Handle growth in volume/velocity (implied in schema design for performance/clarity)[2].

## Data Modeling Interview Questions

Emphasize normalization, relationships, and quality in pipelines[2].

- **Schema design basics:** Understand requirements, normalize to remove redundancy, define FKs/indexes[2].
- **Data quality in pipelines:** Ensure via validation checks; watch duplicates, nulls, inconsistencies, schema drift[3].

## Behavioral Interview Questions

Search results lack specific senior data engineer behavioral examples (e.g., leadership, failure stories). Common from knowledge: "Describe a pipeline failure and resolution" or "How do you mentor juniors?" – no live sources found for 2026 trends.

## Notable Trends (Last 30 Days)
No 2026-specific trends in results (most pre-2026). Emphasis persists on window functions, explicit population filtering, and grain clarity in SQL; scalable modeling for growth[1][2].

**Next Steps:**
- Practice 5 Amazon SQL questions on StrataScratch (filter by JOINs/aggregations).
- Mock system design: Diagram schema for 1B-row e-commerce table (normalize + shard).
- Review execution plans on sample DB (e.g., PostgreSQL EXPLAIN ANALYZE).

Sources:  
[1] https://www.stratascratch.com/blog/amazon-sql-interview-questions  
[2] https://www.simplilearn.com/top-sql-interview-questions-and-answers-article  
[3] https://www.netcomlearning.com/blog/data-engineer-interview-questions
