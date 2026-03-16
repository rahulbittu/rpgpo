# Subtask Output — Research Vector Databases
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Embedding Generation
Vector databases integrate embedding generation into ML workflows by storing multi-dimensional embeddings from text, images, and user activities, often using external services like Mosaic AI Model Serving for preprocessing billions of text records into high-dimensional vectors (e.g., 768 dimensions).[1][5] In public sector RAG applications, embeddings process ~80% unstructured data (PDFs, audio, video) into searchable numerical formats, enabling semantic understanding like linking "public records" to "FOIA requests."[4]

## HNSW Indexing
No direct mentions of HNSW (Hierarchical Navigable Small World) indexing in recent results; sources focus on alternatives like IVF (Inverted File Index) for billion-scale search, clustering vectors around centroids for independent fetching from object storage without full in-memory indexing.[5] PostgreSQL extensions like pgvector provide vector similarity search, with benchmarks claiming faster performance than dedicated vector DBs via GPU acceleration.[2]

## Similarity Search Algorithms
Qdrant uses flexible vector search for nearest neighbor retrieval in dynamic, multimodal data (text, images, audio, video), supporting agentic AI with thousands of real-time queries across contexts; built in Rust for production-scale RAG to reduce LLM hallucinations.[3] Databricks' Storage Optimized Vector Search employs IVF with PQ (Product Quantization) codes for ANN search on >1B vectors at 768 dims, decoupling storage (object storage) from compute for order-of-magnitude ingestion speedups on Spark clusters.[5] Elastic achieves 12x faster query speeds and 30% accuracy uplift via vector compression like Better Binary Quantization (BBQ).[4]

**Source:** https://siliconangle.com/2026/03/12/qdrant-raises-50m-bring-flexible-vector-search-production-ai-systems/[3]  
**Source:** https://www.databricks.com/blog/decoupled-design-billion-scale-vector-search[5]  
**Source:** https://fedresources.com/what-public-sector-agencies-need-to-know-about-vector-databases-and-creating-llm-powered-applications/[4]

## Metadata Filtering
Databricks generates keyword inverted indexes alongside vector indexes for metadata filtering and hybrid search, stored separately from raw full-precision embeddings for on-demand re-ranking.[5] General-purpose DBs like PostgreSQL (pgai/pgvector) and Elasticsearch support hybrid techniques balancing vector similarity with standard queries on source content (text, sequences).[2]

## Hybrid Search (Vector + Keyword)
Hybrid search combines vector similarity with lexical/keyword search for context-aware results in e-commerce and chatbots; trending for RAG pipelines.[1] TigerData (PostgreSQL) enables hybrid via pgai (auto-updates vectors on source changes) and pgvector; Elasticsearch extends text search with vectors; advised for most LLM apps over pure vector DBs unless specialized performance needed.[2] Databricks outputs include keyword indexes for hybrid paths.[5]

**Source:** https://www.tredence.com/blog/vector-databases[1]  
**Source:** https://www.lpi.org/blog/2026/03/06/databases-for-ai-should-you-use-a-vector-database/[2]  
**Source:** https://www.databricks.com/blog/decoupled-design-billion-scale-vector-search[5]

## Scaling Strategies
- **Qdrant:** $50M funding (March 12, 2026) for composable, modular design handling terabytes of dynamic multimodal data; prioritizes query time over 99% precision for large-scale ops.[3]
- **Databricks:** Storage Optimized scales to >1B vectors (vs. 320M cap), using ephemeral Spark clusters for ingestion (ACID transactions from Delta Tables), IVF/PQ for object storage decoupling; order-of-magnitude build speedups.[5]
- **Cloud/Edge Trends:** Cloud-native for low-latency (IoT/edge), integration with SQL/NoSQL (e.g., MySQL/MariaDB vectors, Neo4j GenAI).[1][2][6]
- **TigerData Benchmarks:** PostgreSQL outperforms vector DBs on vectors + source data via GPU; pgai/pgvector for AI connectivity.[2]

**Source:** https://siliconangle.com/2026/03/12/qdrant-raises-50m-bring-flexible-vector-search-production-ai-systems/[3]  
**Source:** https://www.databricks.com/blog/decoupled-design-billion-scale-vector-search[5]  
**Source:** https://www.lpi.org/blog/2026/03/06/databases-for-ai-should-you-use-a-vector-database/[2]

**Next Steps:** Test pgvector on PostgreSQL for hybrid SQL/vector (free extension); benchmark Qdrant Cloud free tier (post-$50M scalability focus, March 2026); ingest sample data via Databricks Delta for 1B-scale simulation. No HNSW specifics found—search "HNSW vector DB benchmarks 2026" for deeper dive.
