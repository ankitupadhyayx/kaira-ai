# Phase 6 — Fast Path Engine

## 🎯 Goal

Build a high-performance **Fast Path Engine** that instantly answers common Mobiloitte-related questions **without invoking AI or LLMs**.

The Fast Path Engine should identify predefined intents and return accurate responses within milliseconds, significantly reducing response time, server load, AI costs, and unnecessary processing.

This engine acts as the **primary response layer** after Greeting Detection and Gibberish Detection.

---

# Objectives

Build a Fast Path Engine that is:

- Extremely fast
- Highly accurate
- Easily configurable
- Business-friendly
- Scalable
- Maintainable
- AI-independent

---

# Expected Outcome

At the end of this phase, the chatbot should:

- Detect predefined intents
- Match user queries using keywords and fuzzy search
- Understand synonyms and natural language variations
- Return instant responses
- Load responses from JSON configuration
- Cache frequently used responses in Redis
- Track performance metrics
- Avoid unnecessary AI calls

---

# Position in Request Pipeline

```
User Message

↓

Normalize Input

↓

Greeting Engine

↓

Gibberish Detection

↓

Fast Path Engine

↓

Intent Found?

├── Yes → Return Instant Response
└── No → Forward to AI Service
```

The Fast Path Engine executes **before AI**.

---

# Responsibilities

The Fast Path Engine is responsible for:

- Intent identification
- Keyword matching
- Synonym matching
- Fuzzy matching
- Intent confidence calculation
- Returning predefined responses
- Redis caching
- Performance monitoring

---

# Why Fast Path?

Many visitors ask repetitive questions.

Examples:

- What does Mobiloitte do?
- Where is your office?
- How can I contact you?
- Do you provide internships?
- How can I apply for jobs?
- What technologies do you work on?

These questions do **not require AI reasoning**.

Returning predefined responses:

- improves speed
- reduces AI costs
- provides consistent information
- improves user experience

---

# Supported Business Intents

The engine should support predefined intents related to Mobiloitte.

---

## Company Information

Examples

- Tell me about Mobiloitte
- What is Mobiloitte?
- What does your company do?
- Company overview
- About the company
- About Mobiloitte

Response should include:

- Company introduction
- Business domains
- Core expertise
- Industries served

---

## Services

Examples

- What services do you provide?
- Your services
- What do you build?
- Solutions offered
- Development services

Possible categories:

- AI Solutions
- Mobile Apps
- Web Applications
- Blockchain
- Cloud Solutions
- IoT
- Enterprise Software
- DevOps
- Digital Transformation

---

## Technologies

Examples

- Which technologies do you use?
- Tech stack
- Programming languages
- AI technologies
- Cloud technologies
- Mobile technologies

Response should summarize major technologies used by Mobiloitte.

---

## Office Location

Examples

- Where is your office?
- Company address
- Office location
- Head office
- How can I visit?

Response should provide the official office location.

---

## Contact Information

Examples

- Contact number
- Phone number
- Email
- Customer support
- HR contact
- Sales contact

Return official contact information.

---

## Office Hours

Examples

- Office timing
- Working hours
- Business hours
- Opening hours
- When are you open?

Return official working hours.

---

## Careers

Examples

- Careers
- Jobs
- Current openings
- Hiring
- Vacancies
- Join Mobiloitte
- Recruitment

Response may include:

- Hiring process
- Career opportunities
- Internship information
- Official careers page

---

## Internship

Examples

- Internship
- Summer internship
- Training
- College internship
- Student program

Return internship-related information if available.

---

## Support

Examples

- Need help
- Customer support
- Technical support
- Contact support
- Raise issue

Return support information.

---

## Pricing

Examples

- Pricing
- Cost
- Development charges
- Project budget
- Service charges

Since pricing varies by project, return a predefined business response encouraging visitors to contact the sales team.

---

## Consultation

Examples

- Free consultation
- Talk to expert
- Book meeting
- Contact sales

Return consultation process.

---

## Industries

Examples

- Which industries do you serve?
- Healthcare
- Finance
- Retail
- Education
- Government

Return supported industries.

---

## AI Solutions

Examples

- AI development
- AI chatbot
- Machine learning
- Generative AI
- LLM solutions

Return AI capabilities.

---

## Blockchain

Examples

- Blockchain
- Web3
- NFT
- Smart contracts

Return blockchain offerings.

---

## Mobile App Development

Examples

- Android
- iOS
- Flutter
- React Native

Return mobile development services.

---

## Cloud Solutions

Examples

- AWS
- Azure
- Google Cloud
- Cloud Migration

Return cloud capabilities.

---

## Website Development

Examples

- Web development
- Website
- React
- Angular
- Next.js

Return web development services.

---

## Digital Transformation

Examples

- Enterprise software
- Automation
- ERP
- CRM

Return enterprise offerings.

---

# Intent Matching

The engine should use multiple matching strategies.

---

## Exact Match

Example

```
office hours
```

---

## Keyword Match

Example

```
working hours
```

↓

Office Hours

---

## Synonym Match

Examples

```
job

career

vacancy

opening

recruitment
```

↓

Career Intent

---

## Fuzzy Search

Support minor spelling mistakes.

Examples

```
mobiloit

mobiloittee

careeer

ofice timing

contect
```

Should still resolve to the correct intent.

---

# Intent Confidence

Each matched intent should generate a confidence score.

This helps:

- Improve routing decisions
- Reduce false matches
- Trigger AI fallback when confidence is low

---

# JSON Configuration

Business responses should be stored in JSON files.

Each intent should contain:

- Intent ID
- Keywords
- Synonyms
- Example questions
- Response template

Business teams should be able to update these responses without changing application code.

---

# Redis Cache

Frequently requested responses should be cached.

Examples:

- About Mobiloitte
- Office Hours
- Contact Information
- Services

Benefits:

- Faster responses
- Reduced file access
- Lower server load

---

# Performance Logging

Measure:

- Intent matching time
- Cache hit/miss
- Response generation time
- Total processing time

These metrics will help optimize future versions.

---

# Response Structure

The Fast Path Engine should return structured information including:

- Matched intent
- Confidence score
- Response
- Cache status
- Processing time

This structure will later be consumed by the Orchestrator.

---

# Fallback Behavior

If no predefined intent is matched:

```
Fast Path

↓

No Intent Found

↓

Forward Request

↓

AI Service
```

The engine should never attempt to generate answers itself.

---

# Folder Structure

```
backend/

src/

services/
└── fast-path/

    ├── fastPath.service.ts
    ├── intent.matcher.ts
    ├── keyword.matcher.ts
    ├── synonym.matcher.ts
    ├── fuzzy.matcher.ts
    ├── redis.cache.ts
    ├── response.loader.ts
    ├── performance.logger.ts
    ├── fastPath.constants.ts
    ├── fastPath.types.ts
    └── index.ts

config/

└── intents/

    ├── about.json
    ├── services.json
    ├── careers.json
    ├── internship.json
    ├── technologies.json
    ├── office-hours.json
    ├── contact.json
    ├── location.json
    ├── pricing.json
    ├── support.json
    ├── industries.json
    └── consultation.json
```

---

# Testing Scenarios

The engine should instantly answer queries such as:

- Tell me about Mobiloitte
- What services do you provide?
- Where is your office?
- How can I contact Mobiloitte?
- What are your office hours?
- Are you hiring?
- Do you offer internships?
- Which technologies do you use?
- Do you build AI solutions?
- Do you develop mobile applications?
- What industries do you serve?
- How much does a project cost?
- Can I schedule a consultation?

It should also correctly handle spelling variations and synonyms before falling back to AI.

---

# Deliverables

By the end of this phase, the project should include:

- Fast Path Engine
- Intent mapping
- Keyword matching
- Synonym support
- Fuzzy search
- Confidence scoring
- Business-specific Mobiloitte intents
- JSON-based response configuration
- Redis caching
- Performance logging
- Structured response format
- Unit-test-ready architecture
- Integration with the Orchestrator

---

# Success Criteria

This phase is complete when:

- Common Mobiloitte-related questions are answered instantly.
- Intent matching is accurate across keywords, synonyms, and spelling variations.
- Responses are served from predefined JSON configurations.
- Frequently accessed responses are cached using Redis.
- The engine responds in **under 50 milliseconds** for cached and common requests.
- Unmatched queries are seamlessly forwarded to the AI service.
- The Fast Path Engine significantly reduces unnecessary AI invocations while providing a fast and consistent visitor experience.