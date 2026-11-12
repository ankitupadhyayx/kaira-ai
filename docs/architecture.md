# Enterprise AI Chatbot — System Architecture & Design Specification (`ARCHITECTURE.md`)

## 1. System Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND LAYER                                       │
│                                                                                        │
│   Next.js 15 App Router | React 19 | Tailwind CSS | Axios | Lucide Icons              │
│   - Widget Mode (Floating Bottom Modal) & Fullscreen Application Layout               │
│   - React.memo Message Bubbles | Error Boundary Fault Tolerance | Skeleton Loaders     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON (POST /api/v1/chat)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND GATEWAY LAYER                                   │
│                                                                                        │
│   Node.js | Express | TypeScript | Helmet Security | Winston Logger | Redis Cache      │
│   - Request ID & High-Precision Hrtime Timer Middleware                                │
│   - Global Rate Limiter & Compression Middleware                                      │
│   - Metrics Tracker (/api/v1/metrics) & Health Monitor (/api/v1/health)              │
│   - Centralized Global Error Sanitization & Graceful Shutdown Handler                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             ORCHESTRATOR PIPELINE LAYER                                │
│                                                                                        │
│   Sequential Execution Engine with Early Return Guarantee                             │
│   Context State: { requestId, message, isHandled, response, stageHistory }             │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Stage 1: GreetingEngineStage                                                   │   │
│   │ - Levenshtein Distance | Prefix Matcher | Fuzzy Score | Language Detector      │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ (If isHandled == false)                    │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Stage 2: GibberishEngineStage                                                  │   │
│   │ - 7 Detectors: Char Repetition, Vowel Ratio, Symbol, Numeric, Keyboard Smash,  │   │
│   │   Entropy Analyzer, Dictionary Scorer                                          │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ (If isHandled == false)                    │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Stage 3: FastPathEngineStage                                                   │   │
│   │ - Pattern Matcher | Keyword Resolver | Fuzzy Matcher | Synonym Expander       │   │
│   │ - L1 In-Memory LRU Cache & L2 ioredis Redis Cluster Fallback                  │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ (If isHandled == false)                    │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Stage 4: AiServiceInferenceStage                                               │   │
│   │ - Resilient Axios Client | CircuitBreaker (CLOSED/OPEN/HALF-OPEN)             │   │
│   │ - Exponential Backoff RetryHandler | TimeoutHandler (2.5s)                     │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │ HTTP / JSON (POST http://localhost:8000/api/v1/analyze)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PYTHON AI MICROSERVICE LAYER                              │
│                                                                                        │
│   FastAPI | Python 3.11 | RapidFuzz | SentenceTransformers | Qdrant Vector DB         │
│   - Unicode NFKD Preprocessor & Tokenizer                                             │
│   - RapidFuzz Intent Matcher (Ratio, Partial Ratio, Token Set Ratio)                  │
│   - RAG Vector Search & Cross-Encoder Reranker                                         │
│   - Guardrails & Citation Attribution Generator                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Data Flow & Sequence Diagram

```text
User            Next.js UI            Express Gateway           Orchestrator            FastPath/Redis           Python FastAPI
 │                  │                        │                        │                       │                        │
 │─── Send Message ─►│                        │                        │                       │                        │
 │                  │─── POST /api/v1/chat ─►│                        │                       │                        │
 │                  │                        │─── processChat(req) ──►│                       │                        │
 │                  │                        │                        │── Stage 1: Greeting ─►│                        │
 │                  │                        │                        │◄── (Not Greeting) ────│                        │
 │                  │                        │                        │                       │                        │
 │                  │                        │                        │── Stage 2: Gibberish ─►│                        │
 │                  │                        │                        │◄── (Clean Input) ─────│                        │
 │                  │                        │                        │                       │                        │
 │                  │                        │                        │── Stage 3: FastPath ──► Check Cache/Intents    │
 │                  │                        │                        │                       │── Check Match ────────►│
 │                  │                        │                        │◄── (Match Found!) ────│                        │
 │                  │                        │◄── Return FAQ Response ──│                       │                        │
 │                  │◄── HTTP 200 JSON ──────│                        │                       │                        │
 │◄── Render Bubble ─│                        │                        │                       │                        │
```

---

## 3. Detailed Component Architecture

### 3.1 Backend Orchestrator Interface & Context State

```typescript
export interface PipelineContext {
  requestId: string;
  request: ChatRequestDto;
  isHandled: boolean;
  response?: ChatResponseData;
  stageHistory: string[];
  metadata?: Record<string, unknown>;
}

export interface IPipelineStage {
  readonly name: string;
  readonly priority: number;
  shouldExecute(context: PipelineContext): Promise<boolean>;
  execute(context: PipelineContext): Promise<PipelineContext>;
}
```

### 3.2 Resilience Circuit Breaker Configuration

```typescript
export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation — requests pass through
  OPEN = 'OPEN',           // Circuit tripped — fast-fail requests immediately
  HALF_OPEN = 'HALF_OPEN', // Probe testing backend recovery
}

export interface ICircuitBreakerConfig {
  failureThreshold: number; // 5 consecutive failures trips circuit
  resetTimeoutMs: number;   // 15 seconds cooldown before testing recovery
}
```
