# Enterprise AI Architect — Step-by-Step Learning Roadmap (`LEARNING_PATH.md`)

## 1. Executive Learning Overview

This step-by-step curriculum is designed specifically for software engineers building their first enterprise AI chatbot. Instead of jumping straight to complex LLM frameworks, this path teaches core concepts sequentially—from string distance algorithms and rule engines up to Vector Databases, Hybrid RAG, Guardrails, and Multi-Agent Orchestration.

---

## 2. Curriculum Modules

---

### Module 1: Chatbot Foundations & Microservices Architecture

#### Why it exists
Modern enterprise applications split responsibilities between a high-speed API Gateway (Node.js/Express) and heavy data processing/AI microservices (Python/FastAPI) to allow independent scaling.

#### Real-World Usage
Uber, Netflix, and Shopify route high-throughput user requests through Node.js API gateways while delegating machine learning inference to Python services via async HTTP/gRPC.

#### Industry Examples
- **API Gateway**: Handles rate-limiting, authentication, logging, metrics, and request sanitization.
- **AI Microservice**: Manages model loading, vector search, embeddings, and LLM orchestration.

#### Common Mistakes
- Putting Python AI code directly inside Node.js scripts using child processes (unscalable).
- Synchronous blocking calls without timeouts or circuit breakers.

#### Mini Project & Practice Tasks
1. Build a basic Express gateway on port 5000 and a FastAPI service on port 8000.
2. Implement a `/health` ping between Node.js and FastAPI using Axios with a 2-second timeout.

#### References
- *Building Microservices* by Sam Newman.
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html).
- [FastAPI Official Documentation](https://fastapi.tiangolo.com/).

---

### Module 2: Rule-Based Matching, String Distance & Fuzzy Algorithms

#### Why it exists
Rule-based matching allows instant (< 5ms) answers for predictable queries (greetings, FAQs) with zero API costs.

#### Concepts Covered
- **Levenshtein Distance**: Minimum single-character edits (insertions, deletions, substitutions) to transform one string into another.
- **Jaro-Winkler Distance**: Variant emphasizing prefix matches (ideal for short names and greetings).
- **Token Set Ratio**: Ignores word ordering and duplicate tokens (`"mobile pricing"` vs `"pricing for mobile"`).

#### Common Mistakes
- Setting fuzzy thresholds too low (e.g. 0.30), causing false-positive intent hijacks.
- Running regex or string distance on raw un-normalized user input without lowercasing or trimming punctuation.

#### Mini Project & Practice Tasks
1. Implement a Levenshtein distance function in TypeScript without external libraries.
2. Build a fuzzy greeting matcher that correctly identifies `"h3llo"` and `"gud morning"` while ignoring `"help pricing"`.

#### References
- [RapidFuzz Python Documentation](https://github.com/maxbachmann/RapidFuzz).
- *Speech and Language Processing* by Daniel Jurafsky & James H. Martin.

---

### Module 3: Vector Embeddings & High-Dimensional Semantic Spaces

#### Why it exists
Traditional keyword search fails when users ask questions using different vocabulary (e.g., *"How much does it cost?"* vs *"What are your rates?"*). Embeddings map text into high-dimensional numerical vectors where similar meanings are geographically close to each other.

#### Real-World Usage
Google Search, Spotify recommendations, and Notion AI use vector embeddings to understand semantic intent beyond exact word matching.

#### Industry Standard Models
- `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions, ultra-fast CPU inference).
- `text-embedding-3-small` (OpenAI, 1536 dimensions).

#### Common Mistakes
- Comparing vectors of different dimensions.
- Mixing up similarity metrics (Cosine Similarity vs Euclidean Distance vs Dot Product).

#### Mini Project & Practice Tasks
1. Install `sentence-transformers` in Python.
2. Compute the cosine similarity between `"laptop"`, `"computer"`, and `"banana"`. Verify that `"laptop"` and `"computer"` score > 0.80 while `"banana"` scores < 0.20.

---

### Module 4: Vector Databases & High-Scale Indexing (Qdrant / Pinecone)

#### Why it exists
Searching millions of vector embeddings linearly ($O(N)$ brute-force dot product) is too slow for real-time applications. Vector databases index high-dimensional spaces using graph algorithms like **HNSW (Hierarchical Navigable Small World)** to enable sub-20ms approximate nearest neighbor (ANN) retrieval ($O(\log N)$).

#### Industry Examples
- **Qdrant**: Open-source, Rust-powered vector database with rich payload filtering.
- **Pinecone**: Fully managed cloud-native vector database.

#### Common Mistakes
- Storing large vector collections without payload indices for tenant filtering.
- Re-indexing the entire database for every new document insert instead of incremental upserting.

#### Mini Project & Practice Tasks
1. Spin up a local Qdrant instance using Docker (`docker run -p 6333:6333 qdrant/qdrant`).
2. Insert 10 document vectors into a collection named `company_docs` with payload metadata `{ category: "pricing", page: 1 }`.
3. Query the collection for the top-3 nearest neighbors.

---

### Module 5: Document Processing, Parsing & Semantic Chunking

#### Why it exists
Large files (100-page PDFs, Excel workbooks) exceed LLM context windows and degrade retrieval precision. Text must be extracted, cleaned, and broken into logical chunks before embedding.

#### Chunking Strategies
1. **Fixed-Size Chunking**: Split text every 500 characters (simple, but splits sentences).
2. **Recursive Character Chunking**: Splits by paragraphs (`\n\n`), then sentences (`. `), preserving semantic context.
3. **Semantic Chunking**: Splits text dynamically when the cosine similarity between consecutive sentences drops below a threshold.

#### Common Mistakes
- Naively splitting text across table rows or mid-sentence without context overlap.
- Ignoring PDF page headers and footers, which corrupt vector embeddings with repetitive noise.

#### Mini Project & Practice Tasks
1. Write a Python script using `pdfplumber` to extract text and tables from a PDF file.
2. Implement a recursive chunker with 512-token max size and 64-token overlap.

---

### Module 6: Hybrid Search, Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking

#### Why it exists
Vector search alone misses exact serial numbers, product codes, or acronyms. BM25 keyword search misses semantic synonyms. **Hybrid Search** combines both.

```text
User Query ──┬──► BM25 Keyword Search ─────► Top 20 Candidates ──┐
             │                                                  ├──► Reciprocal Rank Fusion (RRF) ──► Cross-Encoder Reranker ──► Top 3 Context Chunks
             └──► Dense Vector Search ────► Top 20 Candidates ──┘
```

#### Concepts Covered
- **Reciprocal Rank Fusion (RRF)**: Merges ranked lists from different search engines without needing score calibration: $RRF(d) = \sum \frac{1}{k + r(d)}$.
- **Cross-Encoder Reranking**: Uses a BERT-style model to jointly score the query and document chunk for ultra-high retrieval precision.

#### Mini Project & Practice Tasks
1. Implement BM25 search using `rank_bm25` in Python.
2. Write an RRF fusion algorithm combining BM25 and Qdrant vector search results.

---

### Module 7: LLM Orchestration, Prompt Engineering & Cost Optimization

#### Why it exists
Directly calling LLMs for simple queries leads to massive monthly bills and high latency. Engineers must master tokenomics, caching, and prompt compression.

#### Strategies Covered
- **Prompt Templates**: System instruction + Context Injection + User Query.
- **Structured Output**: Forcing JSON responses using Pydantic / Schema Enforcers.
- **Prompt Caching**: Reusing pre-computed KV-cache for static system prompts.

#### Mini Project & Practice Tasks
1. Create a dynamic prompt template that formats retrieved RAG chunks into a clean context block.
2. Enforce Pydantic JSON output validation for an LLM response.

---

### Module 8: Guardrails, Citation & Hallucination Mitigation

#### Why it exists
Enterprise AI models must never generate false financial figures, toxic content, or hallucinated facts.

#### Concepts Covered
- **Input Guardrails**: Prevents prompt injection attacks (`"Ignore previous instructions"`).
- **Output Guardrails**: Verifies generated claims against retrieved source documents.
- **Citation Attribution**: Mapping LLM claims back to specific page numbers and source URLs.

#### Mini Project & Practice Tasks
1. Build an input guardrail filter blocking prompt injection patterns.
2. Implement a citation verification function checking if key entities in the answer appear in source chunks.

---

### Module 9: Multi-Agent Workflows & Autonomous Tool Calling (ReAct)

#### Why it exists
Complex tasks (e.g. *"Check my order status and update my shipping address"*) require multi-step reasoning, external database API calls, and tool execution.

#### Concepts Covered
- **ReAct Framework** (Reasoning + Acting loop).
- **Function Calling**: Defining JSON schemas for external API tools.

#### Mini Project & Practice Tasks
1. Define a tool schema for `get_order_status(order_id: str)`.
2. Implement an agent loop that parses tool call arguments and executes mock database queries.
