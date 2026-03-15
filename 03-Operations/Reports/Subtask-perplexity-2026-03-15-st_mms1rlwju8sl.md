# Subtask Output — Research Graph Databases and Neo4j vs Amazon Neptune
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Neo4j Key Updates and Features
- **Market Presence on AWS**: Neo4j is available on AWS Marketplace with positive customer reviews; it uses an all-in-one architecture for data loading, ETL, queries, and storage on the same compute resources, contrasting with more distributed options.[1]
- **Query Language**: Native Cypher query language, with a steep learning curve for clustered instances requiring operational expertise; supports hybrid search combining graph traversal and semantic search for GraphRAG workflows.[4]
- **Enterprise Focus**: Market leader for production-grade RAG applications with native vector search; best for complex enterprise apps but high setup effort.[4]
- **Migration Considerations to Neptune**: Differences include language/feature support, server architecture, and storage; Neo4j relies on structured schema management and features like `LOAD CSV`, while lacking Neptune's dynamic scaling.[1]

Source: https://www.oreateai.com/blog/neo4j-on-aws-marketplace-a-look-at-customer-reviews-and-migration-paths/519cbd06675d1d8af402b9d8dcc1ec84[1]; https://fast.io/resources/best-knowledge-graph-databases-rag/[4]

## Amazon Neptune Key Updates and Features
- **Latest Release**: Engine version 1.4.7.0 deployed as of March 3, 2026; now available in Asia Pacific (Hyderabad) region (ap-south-2) since March 10, 2026.[2]
- **Query Languages**: Supports Gremlin, SPARQL, and openCypher (production-ready since engine 1.1.1.0); openCypher is SQL-inspired, originally from Neo4j (open-sourced 2015 under Apache 2.0), but Neptune's implementation differs—requires query rewrites for Neo4j Cypher migration.[2][5]
- **Architecture and Scaling**: Fully managed with native quad-model, distributed shared storage that auto-expands; no explicit schemas, dynamic node/edge/property addition; separates compute/storage for dynamic scaling; uses AWS Glue or custom code for data loading instead of Neo4j-style tools.[1][4]
- **Analytics and Performance**: Neptune Analytics is memory-optimized for GraphRAG/vector search, returning context in milliseconds; graph neural networks (GNNs) via Neptune boost prediction accuracy >50% over non-graph ML; suits high-throughput, millisecond-latency for connected datasets.[3][4]
- **Tools Integration**: Compatible with gdotv for query visualization, slow query logs from CloudWatch, profile API (one-click traversal explanations), and audit logs; supports Property Graph and RDF models.[3][5]
- **Comparison Strengths**: Low setup effort as managed service; best for AWS teams needing scalability without tuning; vs. Neo4j: managed graph type, vector search via Analytics, Gremlin/SPARQL queries.[4]

Source: https://docs.aws.amazon.com/neptune/latest/userguide/doc-history.html[2]; https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-opencypher.html[5]; https://gdotv.com/amazon-neptune-graph-visualization-tool/[3]; https://fast.io/resources/best-knowledge-graph-databases-rag/[4]; https://www.oreateai.com/blog/neo4j-on-aws-marketplace-a-look-at-customer-reviews-and-migration-paths/519cbd06675d1d8af402b9d8dcc1ec84[1]

## Direct Comparison Table (Neo4j vs. Amazon Neptune)

| Feature              | Neo4j                                      | Amazon Neptune                                   |
|----------------------|--------------------------------------------|--------------------------------------------------|
| **Primary Type**     | Native Graph                               | Managed Graph                                    |
| **Vector Search**    | Native                                     | Via Analytics                                    |
| **Query Lang**       | Cypher                                     | Gremlin/openCypher/SPARQL                        |
| **Setup Effort**     | High                                       | Low (Managed)                                    |
| **Scaling**          | All-in-one compute; structured schemas     | Distributed shared storage; auto-expands         |
| **Best Use**         | Enterprise RAG with community support      | AWS scale, serverless GraphRAG                   |[1][4]

No results found for pricing, exact market share numbers, or revenue data in the last 30 days (post-February 15, 2026). Refine search with terms like "Neo4j revenue 2026 Q1" or "Neptune vs Neo4j benchmarks March 2026" for updates.
