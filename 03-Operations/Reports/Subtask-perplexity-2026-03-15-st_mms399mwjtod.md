# Subtask Output — Research Best Practices for Knowledge Graphs
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: GraphRAG by Microsoft for Knowledge Graph Construction
GraphRAG combines knowledge graphs with retrieval-augmented generation (RAG) to connect entities like skills, projects, and relationships with 3x better accuracy than baseline RAG; process includes entity/relationship extraction from documents, community detection, and LLM-generated summaries stored for queries.  
Supports personal use by mapping project history, collaboration patterns, and expertise; in a 2024 case study, it enabled multi-hop reasoning to identify subject matter experts via verified connections, reducing search time for internal resources.  
**Implementation steps**: Extract entities/relationships → Build graph → Detect communities → Generate summaries (upfront cost offsets query efficiency).  
**Costs**: 3-5x higher than baseline RAG due to extraction; use for multi-hop questions connecting skills/projects/goals.  
Source: https://www.articsledge.com/post/graphrag-retrieval-augmented-generation (published 2024-07-02)

## Finding 2: Memgraph Database in GraphRAG for Personal/Career Graphs
Memgraph graph database powers real-time knowledge graphs connecting medical/social data (adaptable to skills/interests/projects); Precina Health case (2024) mapped **1.6 million relationships** for diabetes management, uncovering hidden connections via multi-hop queries.  
Another 2024 case used it for internal expert matching: connected project histories and roles for faster onboarding and mobility matching based on verified experience.  
**Security for personal graphs**: Differential privacy on structures, relationship anonymization, query-level access control.  
**Next steps**: Integrate with GraphRAG pipeline; start with Memgraph Community Edition for prototyping skills-projects-career nodes.  
Source: https://www.articsledge.com/post/graphrag-retrieval-augmented-generation (Memgraph Case Studies, 2024)

## Finding 3: Enterprise RAG Guide Recommending GraphRAG for Relationship Mapping
GraphRAG structures relationships between entities (e.g., skills to projects to goals) via Documents → Entity/Relationship Extraction → Knowledge Graph → Community Detection → Graph Traversal + Vector Search.  
**Best for**: Cross-document reasoning (e.g., "How do my projects relate to career goals?"), global summarization across personal notes.  
**Tradeoffs**: Extraction costs 3–5× more than vector RAG; layer on fine-tuned LLM for domain tone. By 2027, 60% of RAG deployments include evaluation; update knowledge base for freshness without retraining.  
**Next steps**: Phase 5 - Scale incrementally, add user feedback loops, monitor embedding drift.  
Source: https://www.synvestable.com/enterprise-rag.html (2026 guide)

No additional specific tools or best practices for **personal** knowledge graphs (e.g., Obsidian plugins, Logseq, Tana for skills-interests-projects-career) found in results matching 2026 timeframe; results focus on enterprise GraphRAG. Refine search to "personal knowledge graph tools Obsidian 2026" or "Roam Research career graph best practices" for more targeted hits.
