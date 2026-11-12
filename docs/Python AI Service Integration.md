# Phase 7 — Python AI Service Integration

## 🎯 Goal

Build a dedicated **Python AI Service** using **FastAPI** and integrate it seamlessly with the **Node.js Backend**. This service will handle all AI-related processing that cannot be resolved by the Greeting Engine, Gibberish Detection Engine, or Fast Path Engine.

The AI Service acts as the intelligent fallback layer, responsible for understanding user intent, calculating semantic similarity, and preparing the foundation for future capabilities such as RAG, embeddings, vector search, multilingual support, and LLM integration.

This phase focuses on establishing reliable communication between **Node.js** and **FastAPI**, ensuring that both services work together efficiently, securely, and with minimal latency.

---

# Objectives

Build a production-ready AI microservice that is:

- Independent
- Lightweight
- Fast
- Scalable
- Fault tolerant
- Easily extendable
- Ready for future AI capabilities

---

# Expected Outcome

At the end of this phase, the project should have:

- FastAPI AI Service
- Node.js ↔ FastAPI communication
- AI request pipeline
- Text preprocessing
- Similarity scoring
- Intent prediction
- Confidence scoring
- AI fallback processing
- Retry mechanism
- Timeout handling
- Circuit breaker
- Health monitoring

---

# Updated Request Flow

```
User

↓

Frontend (Next.js)

↓

Node.js Backend

↓

Orchestrator

↓

Greeting Engine

↓

Gibberish Detection

↓

Fast Path Engine

↓

No Match

↓

Python AI Service (FastAPI)

↓

Intent Prediction

↓

Similarity Scoring

↓

Response

↓

Node.js

↓

Frontend
```

---

# Responsibilities

The AI Service is responsible for:

- Text normalization
- Input preprocessing
- Similarity calculation
- Intent prediction
- Confidence estimation
- AI fallback response
- Returning structured results

The Node.js backend remains responsible for orchestration, security, validation, and response formatting.

---

# FastAPI Project Structure

```
ai-service/

app/

├── api/
│   ├── routes.py

├── services/
│   ├── preprocessing.py
│   ├── similarity.py
│   ├── intent.py
│   ├── confidence.py

├── models/
│   ├── request.py
│   ├── response.py

├── utils/
│   ├── logger.py
│   ├── timer.py

├── config/
│   ├── settings.py

├── main.py

tests/
```

---

# FastAPI Endpoints

## Health Check

```
GET /health
```

Purpose:

- Verify AI service availability
- Used by Node.js health monitoring
- Used during deployment

---

## AI Processing

```
POST /process
```

Purpose:

Receive requests from the Node.js backend and return structured AI results.

---

# Text Preprocessing

Every incoming message should be normalized before processing.

Tasks include:

- Convert to lowercase
- Trim whitespace
- Remove unnecessary punctuation
- Normalize repeated spaces
- Handle Unicode safely
- Preserve meaningful symbols where appropriate

The preprocessing layer ensures consistent input for downstream AI components.

---

# Similarity Scoring

The AI Service should compare incoming messages against known intents or example phrases.

Purpose:

- Improve intent recognition
- Handle paraphrased questions
- Support natural language variations

This layer should return a similarity score indicating how closely the user's message matches known examples.

---

# Intent Prediction

When Fast Path cannot determine an intent, the AI Service should predict the most likely intent.

Examples:

- Company Information
- Services
- Careers
- Internship
- Contact
- Office Hours
- Technologies
- AI Solutions

The predicted intent should include an associated confidence score.

---

# Confidence Scoring

Every AI prediction should include a confidence score.

Purpose:

- Determine prediction reliability
- Decide whether to return an answer or request clarification
- Support future analytics

Higher confidence indicates a stronger prediction.

---

# Fallback Processing

If the AI Service cannot confidently determine an intent, it should return a fallback response instead of guessing.

Example responses:

- I'm not completely sure what you mean. Could you provide more details?
- Could you rephrase your question?
- I need a little more information to help you.

This prevents incorrect or misleading answers.

---

# API Communication

Communication between Node.js and FastAPI should use HTTP.

Responsibilities include:

- Sending validated requests
- Receiving structured responses
- Handling failures gracefully
- Logging request durations

All communication should remain internal to the application.

---

# HTTP Client (Node.js)

The backend should use a dedicated HTTP client for AI requests.

Responsibilities:

- Send POST requests
- Handle response parsing
- Capture response time
- Handle failures
- Maintain clean separation from business logic

---

# Timeout Handling

The backend should never wait indefinitely for the AI service.

Implement configurable request timeouts.

If the timeout is exceeded:

- Log the failure
- Return a graceful fallback
- Prevent blocking the request pipeline

---

# Retry Logic

Temporary failures should trigger automatic retries.

Retry only for recoverable situations such as:

- Temporary network issues
- Short service interruptions

Avoid excessive retries to protect system performance.

---

# Circuit Breaker

Implement a basic circuit breaker to improve resilience.

Behavior:

- Monitor repeated AI failures
- Temporarily stop calling the AI service when failures exceed a threshold
- Return fallback responses while the circuit is open
- Automatically recover after a cooldown period

This prevents cascading failures and protects application responsiveness.

---

# Logging

Log important AI interactions.

Examples:

- Incoming request
- Processing duration
- Predicted intent
- Similarity score
- Confidence score
- Timeout events
- Retry attempts
- Circuit breaker state

Avoid logging sensitive user information.

---

# Performance Monitoring

Track:

- AI response time
- Network latency
- Processing duration
- Retry count
- Timeout count
- Circuit breaker events

These metrics help identify bottlenecks and maintain system reliability.

---

# Error Handling

Gracefully handle:

- FastAPI unavailable
- Invalid AI responses
- Network failures
- Timeout errors
- Internal exceptions
- Unexpected payloads

The chatbot should always return a user-friendly response, even if the AI service is unavailable.

---

# Health Monitoring

The backend should periodically verify the AI service status.

Health monitoring helps detect:

- Service downtime
- Slow responses
- Connectivity issues

This information can be exposed through backend monitoring endpoints.

---

# Future AI Capabilities

The architecture should be designed so future enhancements can be added without major refactoring.

Examples include:

- Embeddings
- Vector Database
- RAG Pipeline
- LLM Integration
- Semantic Search
- Memory
- Conversation Context
- Multi-language Support
- Voice Processing
- Document Question Answering

---

# Folder Structure

```
backend/

src/

services/
└── ai/

    ├── aiClient.ts
    ├── ai.service.ts
    ├── timeout.handler.ts
    ├── retry.handler.ts
    ├── circuitBreaker.ts
    ├── ai.types.ts
    ├── ai.constants.ts
    └── index.ts

middleware/
└── aiHealth.middleware.ts

config/
└── ai.config.ts
```

---

# Testing Scenarios

The integration should correctly handle:

- Successful AI responses
- Low-confidence predictions
- Unknown intents
- FastAPI unavailable
- Request timeout
- Retry execution
- Circuit breaker activation
- Circuit recovery
- Invalid AI responses
- High request volume

---

# Deliverables

By the end of this phase, the project should include:

- FastAPI AI Service
- Health endpoint
- AI processing endpoint
- Text preprocessing
- Similarity scoring
- Intent prediction
- Confidence scoring
- Fallback processing
- Node.js HTTP client
- Timeout handling
- Retry mechanism
- Basic circuit breaker
- AI performance monitoring
- Structured request and response models
- Logging support
- Integration with the Orchestrator

---

# Success Criteria

This phase is complete when:

- Node.js communicates successfully with the FastAPI AI Service.
- AI requests and responses follow a standardized contract.
- Text preprocessing executes correctly before inference.
- Similarity scores and intent predictions are returned consistently.
- Confidence scores guide downstream decision-making.
- Timeout handling prevents stalled requests.
- Retry logic recovers from temporary failures.
- The circuit breaker protects the system during repeated AI failures.
- The backend remains responsive even when the AI service is unavailable.
- The architecture is fully prepared for future integration with RAG, embeddings, vector databases, and LLMs.