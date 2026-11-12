# Enterprise AI Chatbot — Web Admin Dashboard Specification (`ADMIN_PANEL.md`)

## 1. Dashboard Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               ENTERPRISE ADMIN DASHBOARD                               │
│                                                                                        │
│   Next.js 15 App Router | React 19 | Tailwind CSS | Lucide Icons | NextAuth.js JWT      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API / JWT Bearer
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND ADMIN SERVICES                                  │
│                                                                                        │
│   ├── AuthController & RBAC Middleware (Admin / Knowledge Manager / Auditor)            │
│   ├── DocumentIngestionController (File upload, status tracking, SHA-256 deduplication)│
│   ├── FastPathRuleController (Dynamic FAQ CRUD, Regex validation, Cache invalidation)   │
│   ├── AnalyticsController (Token usage, latency histograms, cost breakdown)            │
│   └── SystemHealthController (Redis stats, Vector DB indices, FastAPI status)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Specifications

---

### Module 1: Authentication & Role-Based Access Control (RBAC)

- **Auth System**: NextAuth.js JWT with HTTP-only secure cookie storage.
- **Roles**:
  - `SUPER_ADMIN`: Full access to system configuration, API keys, user management, and prompt engineering.
  - `KNOWLEDGE_EDITOR`: Access to Document Ingestion, Fast Path FAQ rule editor, and Knowledge Base management.
  - `AUDITOR`: View-only access to Chat Logs, Analytics, Cost Reports, and Evaluation Metrics.

---

### Module 2: Knowledge Base & Document Manager

- **Features**:
  - Drag-and-drop document upload (PDF, DOCX, XLSX, PPTX, MD, HTML).
  - Processing status tracking: `Queued ➔ Extracting ➔ Chunking ➔ Embedding ➔ Indexed`.
  - Chunk preview modal showing generated text chunks, token counts, and vector IDs.
  - One-click document deletion & vector index purge.

---

### Module 3: Dynamic Fast Path Rule Editor

- **Features**:
  - Visual editor to add, edit, or disable Fast Path intents without restarting the server.
  - Input field for regex patterns with ReDoS validation test runner.
  - Priority slider (1–100) for resolving keyword intent overlaps.
  - Instant Redis cache invalidation button.

---

### Module 4: Analytics, Token Usage & Cost Monitor

- **Key Performance Metrics Displayed**:
  - **Fast Path Hit Rate**: % of queries answered at $0 cost under 15ms.
  - **LLM Token Consumption**: Total prompt tokens and completion tokens consumed per day/month.
  - **Estimated Cost Savings**: Financial savings achieved by skipping LLM calls.
  - **Response Latency Breakdown**: P50, P90, P99 latency graphs across pipeline stages.

---

### Module 5: Chat Audit Logs & Human Feedback Loop

- **Features**:
  - Searchable audit log of user conversations with filter by date, rating (thumbs up/down), and stage handled.
  - Inspection drawer showing exact retrieved context chunks and confidence scores for a specific response.
  - "Promote to Fast Path" button to turn a frequent user query directly into a cached Fast Path FAQ.

---

### Module 6: System Health & Microservice Monitor

- **Real-Time Indicators**:
  - Node.js API Gateway (Uptime, Memory RSS, CPU Usage).
  - Python FastAPI Service (Active workers, inference time).
  - Redis Cluster (Memory used, connected clients, cache keys).
  - Vector DB Index Status (Total vector count, collection size).
