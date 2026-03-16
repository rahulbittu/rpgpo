# Subtask Output — Research Vector Embeddings and Similarity Search
## Model: sonar
## Stage: research
## Date: 2026-03-16

I'll search for current, specific information about vector embeddings, similarity search technologies, and the tools you mentioned.

## Finding 1: Vector Search 2.0 Performance Improvements

Google's Vector Search 2.0 achieves **30–40% improvement in search quality** using task-specific embeddings compared to generic embeddings[1]. The platform supports three search modes: semantic search (intent-based via embeddings), text search (keyword matching), and hybrid search (combining both)[1]. It scales from zero indexing to billion-scale indexes with millisecond latency using Approximate Nearest Neighbor (ANN) algorithms[1].

Source: https://codelabs.developers.google.com/vector-search-2-intro

## Finding 2: Embedding Model Benchmarking Framework

AI Multiple benchmarked leading embedding models (OpenAI, Gemini, Cohere, Mistral, Voyage AI) using **cosine similarity** as the core metric[2]. Cosine similarity scores range from 1 (identical orientation/maximum semantic similarity) to -1 (opposite meaning), with 0 indicating no semantic relationship[2]. The evaluation uses a two-tiered approach: measuring broad semantic relevance across top 5 retrieved documents and precise retrieval accuracy on rank-1 results[2].

Source: https://aimultiple.com/embedding-models

## Finding 3: Wholembed v3 Surpasses BM25 Benchmark

Mixedbread's **Wholembed v3** became the **first embedding model to score higher than BM25** on the LIMIT benchmark, breaking the historical paradigm where BM25 dominated with a score of 93.6[5]. This achievement is significant because production workflows have traditionally relied on hybrid retrieval combining BM25 with vector embeddings separately[5]. Wholembed v3's multimodal benchmarks are on par or better than Gemini Embedding 2[5].

Source: https://trilogyai.substack.com/p/late-interaction-colbert-to-wholembed

## Finding 4: Billion-Scale Vector Search Architecture

Databricks' decoupled vector search architecture maintains **90% recall even at 1 billion vectors** using IVF (Inverted File Index) clustering with object storage[6]. At 768 dimensions and top-10 results, recall stays above 94% at 10 million vectors and above 91% at 100 million vectors[6]. The IVF approach clusters vectors around learned centroids and searches only nearest clusters, allowing independent data fragment retrieval without loading the entire index[6].

Source: https://www.databricks.com/blog/decoupled-design-billion-scale-vector-search

## Finding 5: ANN Algorithms for Efficient Similarity Search

Production vector search relies on **Approximate Nearest Neighbor (ANN) algorithms** including HNSW (Hierarchical Navigable Small World), IVF (Inverted File Index), and PQ (Product Quantization)[3]. These algorithms deliver millisecond-latency searches over millions or billions of embeddings using specialized data structures like KD-Trees, Ball Trees, HNSW graphs, and LSH (Locality-Sensitive Hashing) indices[3]. Cosine similarity is the standard metric for text and semantic similarity, while Euclidean distance suits geometric/spatial data and dot product is common in deep learning[3].

Source: https://blogs.oracle.com/developers/how-do-i-store-and-query-vector-embeddings

## Finding 6: Google's Semantic Search Implementation

Google Search uses **semantic similarity via vector embeddings and cosine similarity** as a fundamental component, with this approach baked into FastSearch (which powers Gemini's search-grounding)[4]. Using 768-dimensional Nomic embeddings, cosine similarity captures semantic relationships on a 0.0–1.0 scale, allowing Google to equate concepts like "US" and "America" while ignoring minor differences that don't impact relevance[4].

Source: https://moz.com/blog/do-keywords-matter-in-2026

---

**Note on search coverage:** The provided search results contain current information about vector embeddings, similarity metrics, and large-scale indexing (including FAISS-adjacent technologies like IVF). However, the results do not include specific details about Word2Vec, Sentence Transformers, FAISS by name, or pgvector with concrete metrics, dates, or URLs. To provide complete coverage of those specific tools with real numbers and sources, additional targeted searches would be needed.
