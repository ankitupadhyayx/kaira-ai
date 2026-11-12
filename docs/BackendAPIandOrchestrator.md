# Phase 3 — Backend API & Orchestrator

## 🎯 Goal

Build the backend foundation responsible for receiving chat requests, validating incoming data, orchestrating request processing, and returning standardized responses.

This phase establishes the application's request pipeline and backend architecture. No AI logic, greeting detection, gibberish detection, or fast-path processing is implemented yet. The focus is on creating a scalable backend that future phases can build upon.

---

# Objectives

Create a backend that is:

- Modular
- Scalable
- Secure
- Maintainable
- Observable
- Production-ready

The backend should be capable of handling incoming chat requests through a centralized orchestration layer while providing consistent validation, logging, and error handling.

---

# Expected Outcome

At the end of this phase, the backend should provide:

- RESTful Chat API
- Standardized API responses
- Request validation
- Response schema
- Global error handling
- Middleware pipeline
- Logging system
- Request tracing
- Rate limiting
- Performance monitoring
- Health endpoints
- Ready for AI service integration

---

# Backend Architecture

```
Frontend

      │

      ▼

Express Server

      │

      ▼

Global Middleware

      │

      ▼

Route

      │

      ▼

Controller

      │

      ▼

Orchestrator

      │

      ▼

Response Formatter

      │

      ▼

Client
```

---

# High-Level Request Flow

```
Incoming Request

↓

Request ID Generation

↓

Security Middleware

↓

Request Logging

↓

Rate Limiting

↓

Validation

↓

Controller

↓

Orchestrator

↓

Response Formatter

↓

Response Logging

↓

Client
```

---

# Folder Structure

```
backend/

src/

├── app.ts
├── server.ts

├── config/
│   ├── env.ts
│   ├── cors.ts
│   ├── logger.ts

├── routes/
│   ├── index.ts
│   ├── chat.routes.ts
│   ├── health.routes.ts

├── controllers/
│   ├── chat.controller.ts
│   ├── health.controller.ts

├── orchestrator/
│   ├── orchestrator.service.ts

├── services/

├── middleware/
│   ├── requestId.ts
│   ├── logger.ts
│   ├── errorHandler.ts
│   ├── notFound.ts
│   ├── rateLimiter.ts
│   ├── validate.ts

├── validators/
│   ├── chat.validator.ts

├── schemas/
│   ├── apiResponse.ts

├── utils/

├── constants/

├── types/

└── logger/
```

---

# API Endpoints

## Health

```
GET /api/health
```

Returns application status.

---

## Chat

```
POST /api/chat
```

Receives a chat message.

Current behavior:

- Validate request
- Pass to orchestrator
- Return mock response

Future phases will add:

- Greeting detection
- Gibberish detection
- Fast path
- AI integration

---

# Request Format

The API should accept a structured request object.

Example fields:

- User message
- Conversation ID
- User ID (optional)
- Timestamp
- Metadata

All requests must be validated before entering the business layer.

---

# Response Format

Every API response should follow a consistent structure.

Include:

- Success flag
- Status code
- Message
- Data
- Request ID
- Timestamp

This ensures a predictable API contract for frontend integration.

---

# Request Validation

Validate every incoming request before processing.

Examples of validation:

- Required fields
- Empty message
- Maximum message length
- Invalid data types
- Malformed JSON

Reject invalid requests with meaningful error messages.

---

# Orchestrator

## Purpose

The orchestrator is the central decision-making layer.

It receives validated requests and decides which service should process them.

At this phase it simply returns a mock response.

Future phases will route requests to:

- Greeting Engine
- Gibberish Detector
- Fast Path Engine
- AI Service

---

# Future Orchestrator Flow

```
Message

↓

Greeting?

↓

Gibberish?

↓

Fast Path?

↓

AI Service?

↓

Response
```

Only the orchestrator structure should exist in this phase.

---

# Middleware Pipeline

Implement reusable middleware for:

- Request ID generation
- Request logging
- Security headers
- CORS
- JSON parsing
- Validation
- Rate limiting
- Error handling
- Not Found handling

Middleware should remain independent and reusable.

---

# Request ID

Every request must receive a unique identifier.

Purpose:

- Debugging
- Log correlation
- Performance tracking
- Error tracing

The request ID should be available throughout the request lifecycle.

---

# Logging

Create a centralized logging system.

Log:

- Incoming requests
- Response status
- Response time
- Errors
- Warnings
- Server startup
- Health checks

Logs should be structured and easy to read.

---

# Error Handling

Implement a global error handler.

Handle:

- Validation errors
- Internal server errors
- Unknown routes
- Unexpected exceptions

Never expose internal implementation details to clients.

---

# Rate Limiting

Protect the API from abuse.

The backend should:

- Limit excessive requests
- Return appropriate HTTP status codes
- Provide informative responses

Configuration should be centralized for easy modification.

---

# Performance Monitoring

Track request execution time.

Measure:

- Total processing time
- API latency
- Slow requests

These metrics will help optimize future AI integrations.

---

# Health Endpoint

Provide a dedicated endpoint for monitoring.

Health response should indicate:

- Server running
- Application version
- Environment
- Uptime

Future phases may include:

- Redis status
- AI service status
- Database status

---

# Configuration

Centralize all configuration.

Examples:

- Environment variables
- Server port
- API prefix
- Rate limit values
- Logging settings
- CORS configuration

Avoid hardcoded values.

---

# Constants

Create reusable constants for:

- HTTP status codes
- API messages
- Error messages
- Route names
- Header names

---

# Type Safety

Use TypeScript throughout the backend.

Define shared types for:

- Chat request
- Chat response
- API response
- Error response
- Middleware extensions

Avoid using `any`.

---

# Code Quality

Follow clean architecture principles.

Guidelines:

- Controllers remain thin.
- Business logic stays outside controllers.
- Middleware has a single responsibility.
- Reusable utilities are centralized.
- Configuration is isolated.
- Code should be modular and easy to test.

---

# Security Foundation

Prepare the backend with basic security practices.

Include:

- Helmet
- CORS
- Input validation
- Request size limits
- Secure HTTP headers

Authentication will be implemented in future phases.

---

# Testing Preparation

Organize the project so future unit and integration tests can be added without restructuring the codebase.

Keep controllers, middleware, and services independent.

---

# Deliverables

By the end of this phase, the backend should include:

- Express + TypeScript setup
- Modular folder structure
- Chat API endpoint
- Health API endpoint
- Request validation
- Standard API responses
- Orchestrator layer
- Middleware pipeline
- Request ID generation
- Logging system
- Global error handling
- Rate limiting
- Performance timing
- Configuration management
- Clean architecture
- Ready for AI integration

---

# Success Criteria

This phase is complete when:

- The backend starts successfully without errors.
- Health endpoint returns application status.
- Chat endpoint accepts validated requests.
- Invalid requests are rejected gracefully.
- Every request receives a unique request ID.
- Logs capture request and response details.
- Errors are handled consistently.
- Response format is standardized across endpoints.
- Controllers remain lightweight.
- The orchestrator layer is implemented and ready for future routing.
- The backend is structured for seamless integration with greeting detection, gibberish detection, fast-path processing, and AI services in upcoming phases.