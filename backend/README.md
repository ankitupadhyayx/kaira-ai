# Enterprise Deterministic Chatbot Backend

## Stage 1 — Foundation Architecture

This workspace contains the enterprise-grade deterministic chatbot backend skeleton.

### Architecture Overview

- `src/ingestion/`: Channel adapters, API gateway, session initialization.
- `src/normalization/`: Unicode, whitespace, slang, typo, similarity pipeline.
- `src/engines/`: Greeting, gibberish, fast-path intent matching, rule engine.
- `src/knowledge/`: Domain models, schema validators, versioning, caching.
- `src/conversation/`: Context management, memory store, disambiguation, response building.
- `src/arbitration/`: Priority resolution and stage fallback arbitration.
- `src/fallback-gate/`: Safe fallback and escalation handling.
- `src/shared/`: Config, logging, errors, constants, types, interfaces, utils.
- `src/observability/`: Health endpoints, metrics, feature flags.

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```
