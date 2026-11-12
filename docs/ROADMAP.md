# Enterprise AI Chatbot — Master Future Roadmap (`ROADMAP.md`)

## 1. Current Architecture Audit

### 1.1 Implemented Architecture (Phases 1 – 9)

```text
User Request
     │
     ▼
Next.js 15 Chat UI (App Router)
     │  (Axios HTTP Client)
     ▼
Node.js Express Backend (Gateway)
     │  ├── Helmet Security & CORS
     │  ├── Express Rate Limiter
     │  ├── Winston Structured Logger & File Transports
     │  └── System Metrics Tracker (/api/v1/metrics)
     │
     ▼
Orchestrator Pipeline (Sequential Execution & Early Return)
     │
     ├── Stage 1: GreetingEngineStage (Levenshtein + Prefix + Fuzzy Matcher)
     │     └── [Early Return if isGreeting = true]
     │
     ├── Stage 2: GibberishEngineStage (7-Detector Pipeline: Character, Vowel, Symbol, Numeric, Keyboard Smash, Dictionary, Entropy)
     │     └── [Early Return if isGibberish = true]
     │
     ├── Stage 3: FastPathEngineStage (Pattern + Keyword + Fuzzy Matcher + Redis Fallback Cache)
     │     └── [Early Return if fastPathMatched = true]
     │
     └── Stage 4: AiServiceInferenceStage (Python FastAPI Microservice Client)
           └── Resilient HTTP Client (Axios + TimeoutHandler + RetryHandler + CircuitBreaker)
                 │
                 ▼
     Python FastAPI AI Microservice (Port 8000)
           ├── PreprocessingService (Unicode NFKD, normalize, tokenize)
           ├── RapidFuzz SimilarityService (ratio, partial_ratio, token_set_ratio)
           ├── IntentService (Hybrid Keyword + RapidFuzz)
           └── ConfidenceService (Threshold check & Fallback response generator)
```

---

### 1.2 Audit Findings Matrix

| Evaluation Aspect | Current Status | Missing Capabilities | Priority Action Required |
|---|---|---|---|
| **Early Return Routing** | ✅ Implemented in `OrchestratorService` | Stage-skipping based on conversation context | Add dynamic context-aware pipeline skip flags |
| **Deterministic Fast Path** | ✅ Implemented with JSON dataset | Dynamic database CRUD, Regex rules, Alias engine | Build Admin DB store & dynamic Regex Engine |
| **Greeting Engine** | ✅ Implemented with Levenshtein fuzzy | Multilingual detection, time-based greetings, memory | Integrate FastText language ID & user session memory |
| **Gibberish Detection** | ✅ Implemented with 7 statistical detectors | ML-based toxicity/spam classifier & repeat detection | Add lightweight ML classification & sliding window buffer |
| **Python AI Microservice** | ✅ FastAPI with RapidFuzz intent prediction | Embeddings, Vector DB, RAG, LLM orchestration | Implement LangChain/LlamaIndex RAG & Vector Indexing |
| **Knowledge Base** | ❌ None (Static JSON intents) | PDF/Word/Excel multi-format document parser | Build Document Ingestion & Chunking Pipeline |
| **Vector Database** | ❌ None | Dense/Sparse Vector Search (Qdrant / Pinecone) | Deploy Qdrant/Milvus Vector DB cluster |
| **LLM Guardrails & RAG** | ❌ None | Citation verification, hallucination checks, guardrails | Integrate NeMo Guardrails & Ragas Evaluation |
| **Admin Dashboard** | ❌ None | Document management, Prompt editor, Analytics, RBAC | Build Enterprise Admin Portal (Next.js Admin) |

---

## 2. Future Cost & Latency Optimization Strategy

### 2.1 The 8-Layer Decision Hierarchy

To achieve **enterprise-grade performance** with **minimal operational costs**, the system follows a strict 8-layer evaluation hierarchy. An incoming query is evaluated sequentially and **stops at the earliest possible layer**:

```text
                      [ Incoming Request ]
                               │
                               ▼
    Layer 1 ➔        [ Greeting Engine ]           (< 5 ms, Cost: $0.00)
                               │ (Not a Greeting)
                               ▼
    Layer 2 ➔     [ Spam / Gibberish Engine ]      (< 10 ms, Cost: $0.00)
                               │ (Clean Input)
                               ▼
    Layer 3 ➔       [ Fast Path FAQ Engine ]       (< 15 ms, Cost: $0.00)
                               │ (No FAQ Match)
                               ▼
    Layer 4 ➔      [ Intent Detection Engine ]     (< 30 ms, Cost: $0.00)
                               │ (No Pre-built Intent)
                               ▼
    Layer 5 ➔      [ Keyword Knowledge Search ]    (< 50 ms, Cost: $0.00)
                               │ (No Exact Match)
                               ▼
    Layer 6 ➔    [ Vector RAG Retrieval Engine ]   (< 120 ms, Cost: $0.0001)
                               │ (Sufficient Context Found)
                               ▼
    Layer 7 ➔     [ LLM Synthesis & Guardrails ]   (< 400 ms, Cost: $0.0015)
                               │ (LLM Generation Failed/Refused)
                               ▼
    Layer 8 ➔     [ Graceful Fallback Handler ]   (< 5 ms, Cost: $0.00)
```

#### Why This Reduces LLM Cost by 85–92%:
1. **70% of Enterprise Inquiries** are Greetings, Spam, or Top-20 FAQs (handled by Layers 1–4 at **$0 cost**).
2. **15% of Inquiries** match internal documentation via Keyword/Vector Retrieval (Layer 5–6).
3. **Only 15% of Complex Queries** ever invoke the Large Language Model (Layer 7).

---

## 3. Future Implementation Roadmap (Phases 10 – 17)

---

### Phase 10 — Advanced Multilingual Greeting & Intent Scoring Engine

#### Objective
Transform the static Greeting Engine into a multilingual, context-aware, time-sensitive, personalized greeting processor.

#### Concepts to Learn
- Language Identification (`fasttext-langdetect` / `langdetect`)
- Conversation Session State & Temporal Normalization
- Weighted Fuzzy Intent Scoring

#### Industry Implementation
Enterprise platforms (Intercom, Zendesk AI) detect user locale from HTTP headers and message text to respond in native languages instantly without LLM calls.

#### Architecture & Component Changes
- **Backend (`backend/src/greeting/`)**:
  - `language.detector.ts`: Integrates FastText language detection.
  - `personalized.greeting.ts`: Time-aware (Morning/Evening) & User-name injection.
- **Python AI Service (`ai-service/app/services/`)**:
  - `multilingual_greeting.py`: Language translation fallback for non-English greetings.

#### Deliverables & Test Cases
- ✅ Test: `Bonjour` ➔ Recognized as French greeting ➔ French response.
- ✅ Test: `Good morning` at 8:00 AM ➔ Time-tailored Morning response.

---

### Phase 11 — ML-Based Spam, Toxicity & Abuse Detection

#### Objective
Protect system resources and corporate reputation by filtering toxic, abusive, and automated spam queries using lightweight machine learning classifiers.

#### Concepts to Learn
- TF-IDF Vectorization & Logistic Regression / Naive Bayes
- Toxicity & Profanity Classification Models
- Sliding-Window Message Frequency Analysis (Spam Flooding)

#### Industry Implementation
Cloudflare and AWS WAF use token-rate sliding windows alongside micro ML models to drop malicious traffic before invoking backend inference.

#### Architecture & Component Changes
- **Backend (`backend/src/gibberish/`)**:
  - `rate.window.detector.ts`: Tracks message repetition over a rolling 10-second window.
- **Python AI Service (`ai-service/app/services/`)**:
  - `toxicity_detector.py`: Scikit-Learn TF-IDF classifier predicting toxicity probability score.

#### Deliverables & Test Cases
- ✅ Test: User sends same message 5 times in 3 seconds ➔ Spam Flood Shield active.
- ✅ Test: Profanity/Abusive input ➔ Friendly refusal policy response.

---

### Phase 12 — Production-Grade Dynamic Fast Path Engine

#### Objective
Upgrade Fast Path from static JSON files to a dynamic Redis-backed rule engine supporting Regex patterns, aliases, priority rules, and business logic.

#### Concepts to Learn
- Regular Expression Compilation & ReDoS (Regex Denial of Service) Safety
- Redis Hash Invalidation & Priority B-Trees
- Cost Reduction Analytics & Cache Hit Rate Monitoring

#### Industry Implementation
Companies like Notion AI and Perplexity pre-cache structured answers for top search queries in Redis, serving millions of requests under 15ms.

#### Architecture & Component Changes
- **Backend (`backend/src/fastpath/`)**:
  - `regex.matcher.ts`: ReDoS-safe Regex matcher.
  - `alias.resolver.ts`: Maps brand names, product codes, and acronyms.
  - `dynamic_repository.ts`: Loads intent rules dynamically from PostgreSQL / Redis.

#### Deliverables & Test Cases
- ✅ Test: Pattern `^pricing for (mobile|web)$` ➔ Instant Regex Match.
- ✅ Test: Acronym `ML` ➔ Expands to `Machine Learning` ➔ Matched.

---

### Phase 13 — Enterprise Document Ingestion & Multiformat Parser Pipeline

#### Objective
Build an automated document ingestion pipeline capable of parsing PDF, DOCX, PPTX, XLSX, Markdown, HTML, and web links into clean structured text.

#### Concepts to Learn
- Document Parsing (`PyPDF2`, `pdfplumber`, `python-docx`, `unstructured`)
- Table Structure Extraction & HTML Sanitization
- File Hashing & Incremental Ingestion

#### Industry Implementation
Enterprise RAG platforms process multi-format company files by converting them into unified JSON schemas containing text, page numbers, titles, and section hierarchy.

#### Pipeline Flow:
```text
File Upload ➔ Validation ➔ Type Extraction ➔ Table Processing ➔ Clean Markdown Conversion
```

#### Deliverables & Test Cases
- ✅ Test: Upload 50-page PDF with tables ➔ Markdown text extracted with page metadata.
- ✅ Test: Re-upload identical file ➔ SHA-256 duplicate check skips reprocessing.

---

### Phase 14 — RAG Foundation, Hybrid Search & Vector DB Indexing

#### Objective
Implement a high-performance RAG pipeline using semantic chunking, dense embeddings, vector database indexing (Qdrant), and hybrid BM25 search.

#### Concepts to Learn
- Semantic Chunking (Recursive Character Chunking + Token-Aware Splitting)
- Dense Embeddings (`sentence-transformers/all-MiniLM-L6-v2` or `text-embedding-3-small`)
- Vector Databases & HNSW (Hierarchical Navigable Small World) Indexing
- Hybrid Search (BM25 Keyword + Vector Similarity) & Reciprocal Rank Fusion (RRF)

#### Architecture & Component Changes
- **Python AI Service (`ai-service/app/rag/`)**:
  - `chunker.py`: Recursive token-aware text splitter (512 tokens, 100 overlap).
  - `embedder.py`: Local HuggingFace / OpenAI embedding generator.
  - `vector_db.py`: Qdrant / Pinecone vector database connector.
  - `hybrid_retriever.py`: Combines BM25 sparse scores with Vector dense scores.

#### Deliverables & Test Cases
- ✅ Test: Ingest HR Policy ➔ Perform Hybrid Search for "maternity leave" ➔ Retrieve top 3 relevant chunks with scores > 0.82.

---

### Phase 15 — Context Memory & Multi-Agent Reranking Pipeline

#### Objective
Maintain multi-turn conversation context and introduce Cross-Encoder reranking for precision RAG retrieval.

#### Concepts to Learn
- Conversation Buffer Memory & Summary Memory
- Cross-Encoder Reranking (`bge-reranker-base`)
- Contextual Query Rewriting (Transforming "What is their price?" to "What is Mobiloitte's price?")

#### Architecture & Component Changes
- **Backend (`backend/src/services/ai/`)**:
  - `session.memory.ts`: Redis-backed conversation turn history.
- **Python AI Service (`ai-service/app/rag/`)**:
  - `reranker.py`: Re-scores top-20 retrieved chunks to top-3 using Cross-Encoder.
  - `query_rewriter.py`: Rewrites ambiguous follow-up questions using session history.

#### Deliverables & Test Cases
- ✅ Test: Turn 1: "Tell me about mobile app services." ➔ Turn 2: "What is the price?" ➔ Rewritten query: "What is the price for mobile app services?".

---

### Phase 16 — Guardrails, Citation & Hallucination Mitigation

#### Objective
Ensure LLM outputs are truthful, verifiable, compliant with corporate policy, and grounded strictly in retrieved documents.

#### Concepts to Learn
- Guardrails (Input/Output Safety Checking)
- Citation & Source Attribution Engine
- NLI (Natural Language Inference) Hallucination Checking (Ragas framework)

#### Architecture & Component Changes
- **Python AI Service (`ai-service/app/guardrails/`)**:
  - `output_guardrail.py`: Verifies generated response claims against retrieved source chunks.
  - `citation_engine.py`: Appends clickable file references (`[Doc.pdf, Page 12]`).

#### Deliverables & Test Cases
- ✅ Test: LLM attempts to generate information not in source docs ➔ Guardrail detects hallucination ➔ Replaces with safe fallback.

---

### Phase 17 — Enterprise Admin Dashboard & Management System

#### Objective
Provide a unified, secure Web Admin Dashboard for managing knowledge base documents, dynamic Fast Path rules, system prompts, vector index jobs, analytics, and user access.

#### Modules Included
1. **Auth & RBAC**: NextAuth.js JWT with Admin/Editor/Viewer roles.
2. **Knowledge Base Manager**: Upload, view, delete, and re-index documents.
3. **Fast Path Rule Editor**: Add/Edit FAQ intents, patterns, and dynamic responses.
4. **Analytics & Cost Tracker**: Real-time token usage, Fast Path hit rates, latency graphs.
5. **Chat Audit Logs & Feedback Loop**: Review user chats, upvotes/downvotes, and failure cases.
6. **Prompt & Guardrail Settings**: Tune LLM prompts, temperature, and confidence thresholds.

---

## 4. Summary Roadmap Matrix

```text
Current State (Phase 9) ──► Phase 10-12 (Advanced Rules & ML) ──► Phase 13-15 (RAG & Vector Search) ──► Phase 16-17 (Guardrails & Admin Portal)
   [Deterministic Foundation]           [Cost-Minimization Engines]                 [Enterprise RAG Pipeline]                   [Enterprise Management]
```
