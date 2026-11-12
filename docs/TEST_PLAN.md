# Enterprise AI Chatbot — Master Test Plan (`TEST_PLAN.md`)

## 1. Test Suite Architecture

```text
                                [ Test Suite Execution ]
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         ▼                                 ▼                                ▼
[ Unit Test Matrix ]            [ Integration Pipeline ]         [ Performance & Security ]
- Greeting Engine               - Gateway to FastAPI             - Latency Benchmarks
- Gibberish Detectors           - RAG Vector Indexing            - Rate Limit & ReDoS
- Fast Path Matchers            - Admin DB Sync                  - Circuit Breaker Tripping
```

---

## 2. Module Test Specifications

---

### 2.1 Greeting Engine Test Suite

| Test ID | Input | Expected Output / Behavior | Target Latency | Status |
|---|---|---|---|---|
| **GR-01** | `hello` | Handled by `GreetingEngineStage`, confidence = 1.0 | < 5 ms | ✅ Passed |
| **GR-02** | `hiii` | Handled by `GreetingEngineStage`, confidence = 0.97 | < 5 ms | ✅ Passed |
| **GR-03** | `Good Morning` | Handled by `GreetingEngineStage`, time-aware morning text | < 5 ms | ✅ Passed |
| **GR-04** | `Bonjour` | Language detected French ➔ French Greeting | < 10 ms | 🔮 Phase 10 |
| **GR-05** | `hello pricing` | Recognized as Greeting prefix ➔ Matched `GreetingEngineStage` | < 5 ms | ✅ Passed |

---

### 2.2 Gibberish & Spam Engine Test Suite

| Test ID | Input | Expected Output / Behavior | Target Latency | Status |
|---|---|---|---|---|
| **GB-01** | `sdkfjskdf` | Flagged as No-Vowels Gibberish | < 5 ms | ✅ Passed |
| **GB-02** | `ftytityitty` | Flagged as Keyboard Smash / Sub-pattern repetition | < 8 ms | ✅ Passed |
| **GB-03** | `123123` | Flagged as Numeric Pattern Gibberish | < 5 ms | ✅ Passed |
| **GB-04** | `!!!!!!!` | Flagged as Symbol Ratio Gibberish | < 5 ms | ✅ Passed |
| **GB-05** | Repeated 5x in 2s | Rate-window spam shield triggered | < 2 ms | 🔮 Phase 11 |

---

### 2.3 Fast Path FAQ Engine Test Suite

| Test ID | Input | Expected Output / Behavior | Target Latency | Status |
|---|---|---|---|---|
| **FP-01** | `pricing` | Matched `pricing` intent ➔ Instant response | < 15 ms | ✅ Passed |
| **FP-02** | `office hours` | Matched `office_hours` intent | < 15 ms | ✅ Passed |
| **FP-03** | `contact` | Matched `contact` intent with phone/email | < 15 ms | ✅ Passed |
| **FP-04** | `careers` | Matched `careers` intent with hiring portal link | < 15 ms | ✅ Passed |
| **FP-05** | `tell me about your company` | Matched `about_company` intent | < 15 ms | ✅ Passed |

---

### 2.4 Document Processing & Ingestion Test Suite

| Test ID | Input File | Expected Output / Behavior | Target Latency | Status |
|---|---|---|---|---|
| **DOC-01** | Standard 10-page PDF | Clean text extracted with page numbers | < 2.0 s | 🔮 Phase 13 |
| **DOC-02** | Complex PDF with Tables | Tables formatted into Markdown tables | < 3.5 s | 🔮 Phase 13 |
| **DOC-03** | Duplicate PDF file upload | SHA-256 duplicate match ➔ Instant skip | < 50 ms | 🔮 Phase 13 |

---

### 2.5 Hybrid RAG & Vector Search Test Suite

| Test ID | Query | Expected Output / Behavior | Target Latency | Status |
|---|---|---|---|---|
| **RAG-01** | `What is the maternity leave policy?` | Retrieves HR Policy PDF Chunks with score > 0.80 | < 120 ms | 🔮 Phase 14 |
| **RAG-02** | Follow-up: `How long is it?` | Query rewritten with history ➔ Correct RAG match | < 150 ms | 🔮 Phase 15 |
| **RAG-03** | Out-of-bounds query | Hallucination Guardrail active ➔ Safe refusal | < 100 ms | 🔮 Phase 16 |

---

### 2.6 Security & Resilience Test Suite

| Test ID | Test Scenario | Expected Behavior | Target Status |
|---|---|---|---|
| **SEC-01** | 101 requests in 1 minute from 1 IP | Express Rate Limiter triggers HTTP 429 Too Many Requests | ✅ Passed |
| **SEC-02** | Python FastAPI server down | Circuit Breaker switches to OPEN ➔ Returns graceful fallback | ✅ Passed |
| **SEC-03** | Malformed JSON body | Express JSON parser returns HTTP 400 with clean error response | ✅ Passed |
