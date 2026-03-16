# Teach me about vector embeddings and similarity search from scratch. Cover word2

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Vector Embeddings and Similarity Search
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

## Compile Learning Guide with Python Examples
## Learning Guide on Vector Embeddings and Similarity Search

### Explanation

#### Vector Embeddings
- **Concept**: Vector embeddings convert data (like words or sentences) into numerical vectors, capturing semantic meaning.
- **Purpose**: They enable efficient similarity searches, crucial for tasks like recommendation systems and semantic search.

#### Word2Vec
- **Overview**: A model that produces word embeddings by training on large text corpora.
- **Mechanism**: Utilizes two architectures: Continuous Bag of Words (CBOW) and Skip-gram.
- **Output**: Words are represented as vectors in a high-dimensional space where semantically similar words are closer.

#### Sentence Transformers
- **Overview**: Extend word embeddings to sentences, capturing more context.
- **Mechanism**: Use transformer models like BERT to generate sentence embeddings.
- **Output**: Sentences are transformed into vectors, maintaining semantic relationships.

#### FAISS (Facebook AI Similarity Search)
- **Purpose**: A library for efficient similarity search and clustering of dense vectors.
- **Features**: Supports large-scale search with Approximate Nearest Neighbor (ANN) algorithms for fast retrieval.

#### pgvector
- **Overview**: An extension for PostgreSQL that adds support for vector embeddings.
- **Use Case**: Facilitates similarity searches directly within a relational database.

### Examples

#### Word2Vec Example
```python
from gensim.models import Word2Vec

# Sample data
sentences = [["hello", "world"], ["machine", "learning"], ["word", "embeddings"]]

# Train model
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)

# Get vector
vector = model.wv['hello']
print(vector)
```

#### Sentence Transformers Example
```python
from sentence_transformers import SentenceTransformer

# Load pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode sentences
sentence_embeddings = model.encode(['This is a sentence', 'This is another sentence'])

print(sentence_embeddings)
```

#### FAISS Example
```python
import faiss
import numpy as np

# Create random vectors
d = 64  # dimension
nb = 10000  # database size
np.random.seed(1234)
xb = np.random.random((nb, d)).astype('float32')

# Build index
index = faiss.IndexFlatL2(d)  # L2 distance
index.add(xb)  # add vectors to the index

# Search
k = 5  # number of nearest neighbors
D, I = index.search(xb[:5], k)  # search for nearest neighbors
print(I)
```

#### pgvector Example
```sql
-- Install extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE items (
  id serial PRIMARY KEY,
  embedding vector(3)
);

-- Insert data
INSERT INTO items (embedding) VALUES ('[1, 2, 3]'), ('[4, 5, 6]');

-- Query for nearest neighbors
SELECT id, embedding <-> '[1, 2, 3]'::vector AS distance
FROM items
ORDER BY distance
LIMIT 5;
```

### Practice Questions

1. **Explain the difference between Word2Vec's CBOW and Skip-gram models.**
2. **How does cosine similarity help in measuring semantic similarity between vectors?**
3. **What are the advantages of using FAISS for large-scale similarity searches?**

### Further Reading

- [Google's Vector Search 2.0](https://codelabs.developers.google.com/vector-search-2-intro)
- [AI Multiple's Embedding Model Benchmarking](https://aimultiple.com/embedding-models)
- [Wholembed v3 and BM25 Benchmark](https://mixedbread.com/wholembed-v3)

### Next Steps

1. **Explore Libraries**: Experiment with Gensim, Sentence Transformers, and FAISS to understand their capabilities.
2. **Benchmark Models**: Use cosine similarity to evaluate different embedding models on your data.
3. **Implement pgvector**: If using PostgreSQL, integrate pgvector for database-level similarity searches.

By following this guide, you can effectively understand, implement, and leverage vector embeddings and similarity search in your projects.