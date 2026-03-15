# Subtask Output — Research Vector Databases
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Elastic 9.3.0 Release with GPU-Accelerated Vector Indexing
Elastic released version 9.3.0 on March 2026, featuring NVIDIA cuVS integration for up to 12x faster vector indexing and 7x faster force merge operations in self-managed deployments, targeting RAG applications with high-dimensional vectors. This positions Elastic against specialized vector databases like Pinecone and Weaviate, enabling faster retrieval as datasets scale for AI-driven search in hybrid cloud environments.[2]  
**Source:** https://www.infoq.com/news/2026/03/elastic-9-3-gpu-vector-indexing/

## Finding 2: Aurora PostgreSQL with pgvector for Vector Embeddings
Aurora PostgreSQL with pgvector extension stores embeddings close to source data, simplifying pipelines for teams using relational databases; Amazon Titan Text Embedding v2 generates 1,024-dimension vectors, handling hundreds of millions of embeddings for domain-specific AI tasks in 2026.[1]  
**Source:** https://gainhq.com/blog/ai-model-selection/

## Finding 3: txtai Storage Backends with Faiss for Large-Scale Embeddings
txtai uses Faiss (Facebook AI Similarity Search) for datasets beyond RAM, supporting GPU acceleration, up to 75% memory reduction via quantization, and on-disk mmap for billion-scale indices; pgvector integrates with PostgreSQL for speed and simplicity in relational setups.[5]  
**Source:** https://fast.io/resources/txtai-storage-solutions/

## Finding 4: MongoDB Atlas Vector Search for GenAI Apps
MongoDB Atlas combines vector search with a flexible document model, allowing developers to build and scale generative AI applications without multiple databases.[4]  
**Source:** https://dev.to/grontis/building-pebbles-a-journey-in-ai-tooling-5e7h

## Finding 5: Vector Index Tuning Tools for HNSW and Quantization
Vector Index Tuning Claude Code Skill optimizes HNSW parameters (M, efConstruction, efSearch), Product Quantization (PQ), and binary encoding for RAG apps scaling to billions of vectors, balancing latency, recall, and memory.[3]  
**Source:** https://mcpmarket.com/tools/skills/vector-index-performance-tuning
