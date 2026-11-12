# Phase 3 — Backend API Architecture & Request Orchestrator

## 📌 Overview

Phase 3 establishes a high-performance, modular, and production-ready Express API architecture and Request Orchestration layer for the **Mobiloitte Technologies Enterprise Smart Chatbot**.

---

## 🏗️ Request Flow Diagram

```text
Incoming HTTP Request
        │
        ▼
[1] Performance Timer Middleware (Attaches high-res hrtime start)
        │
        ▼
[2] Request ID Middleware (Generates UUID v4 & sets X-Request-ID header)
        │
        ▼
[3] Security & Compression (Helmet, Compression, CORS, Express JSON Parser)
        │
        ▼
[4] Rate Limiter Middleware (Window & Max Request Enforcement)
        │
        ▼
[5] Request Logger Middleware (Winston / Morgan logging)
        │
        ▼
[6] Route Matcher (/api/v1/chat or /api/v1/health)
        │
        ▼
[7] Zod Validation Middleware (chatRequestSchema validation)
        │
        ▼
[8] Controller Layer (ChatController / HealthController)
        │
        ▼
[9] Orchestrator Service Pipeline (Sequential IPipelineStage execution)
        ├─► [Stage 1] GreetingEngineStage (Phase 4 Placeholder)
        ├─► [Stage 2] GibberishEngineStage (Phase 5 Placeholder)
        ├─► [Stage 3] FastPathEngineStage (Phase 6 Placeholder)
        └─► [Stage 4] AiServiceInferenceStage (Phase 7 Fallback Placeholder)
        │
        ▼
[10] ApiResponse Formatter Utility (Standardized JSON payload)
        │
        ▼
Client Response (Returns HTTP 200 / 400 / 500 with X-Request-ID & X-Response-Time)
```

---

## 📁 Directory Structure

```text
backend/src/
├── config/               # Environment (Zod validated), CORS, rate limiter, & logger configs
├── constants/            # HTTP status codes & standard API messages
├── controllers/          # ChatController & HealthController
├── errors/               # CustomError abstract base class & specific error subclasses
├── logger/               # Winston logger instance
├── middleware/           # RequestID, Timer, RequestLogger, RateLimiter, Validation, Error handlers
├── orchestrator/         # Pipeline Orchestrator & Stage placeholder implementations
│   ├── interfaces/       # IPipelineStage & IOrchestratorService contracts
│   ├── stages/           # Greeting, Gibberish, FastPath, and AI Service stage placeholders
│   └── orchestrator.service.ts
├── responses/            # Unified ApiResponse builder & IApiResponse interface
├── routes/               # Versioned routes (/api/v1/chat, /api/v1/health)
├── services/             # HealthService
├── types/                # Chat DTOs, Orchestrator types, & Express Request declaration
├── utils/                # TimerUtil high-resolution timing helper
├── validators/           # Zod ChatRequestSchema validators
├── app.ts                # Express application assembly & middleware pipeline order
└── server.ts             # Graceful bootstrap, uncaught exception handling, & server startup
```

---

## 🔌 Orchestrator Stage Registration Contract (`IPipelineStage`)

All future pipeline stages (Phases 4 through 7) implement the `IPipelineStage` contract:

```typescript
export interface IPipelineStage {
  readonly name: string;
  shouldExecute(context: PipelineContext): Promise<boolean> | boolean;
  execute(context: PipelineContext): Promise<PipelineContext> | PipelineContext;
}
```

### Registering a New Stage in Phase 4-7

To plug a new stage (e.g. `GreetingEngineStage`) into the backend orchestrator:

1. Create a stage class implementing `IPipelineStage`.
2. Register it in `OrchestratorService.registerStage(new GreetingEngineStage())`.
3. Zero architectural changes or route restructurings are required!

---

## 🚀 API Endpoint Specifications

### 1. Chat Endpoint

```http
POST /api/v1/chat
Content-Type: application/json
```

#### Request Body:
```json
{
  "message": "Hello Mobiloitte"
}
```

#### Success Response (HTTP 200 OK):
```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "processingTime": "1.25ms",
  "message": "Request processed successfully",
  "data": {
    "message": "placeholder response"
  },
  "timestamp": "2026-07-23T17:22:08.000Z"
}
```

#### Validation Error Response (HTTP 400 Bad Request):
```json
{
  "success": false,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "processingTime": "0.45ms",
  "message": "Request body validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed",
    "details": [
      {
        "field": "message",
        "message": "Message cannot be empty",
        "rule": "too_small"
      }
    ]
  },
  "timestamp": "2026-07-23T17:22:08.000Z"
}
```

---

### 2. Health Endpoint

```http
GET /api/v1/health
```

#### Success Response (HTTP 200 OK):
```json
{
  "success": true,
  "service": "backend",
  "status": "healthy",
  "uptime": "142.50s",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "processingTime": "0.32ms",
  "timestamp": "2026-07-23T17:22:08.000Z"
}
```
