# Phase 4 — Greeting Engine

## 🎯 Goal

Build a robust and intelligent Greeting Engine capable of accurately identifying greetings from users regardless of spelling mistakes, casing, punctuation, emojis, repeated characters, or greeting style.

The Greeting Engine should act as the **first decision point** in the chatbot request pipeline. If a greeting is detected with sufficient confidence, the chatbot should immediately return an appropriate greeting response without invoking downstream services such as Fast Path or AI.

This phase focuses only on greeting detection and response generation.

---

# Objectives

Build an enterprise-grade greeting detection system that is:

- Fast
- Accurate
- Configurable
- Extensible
- Language-aware
- Easy to maintain

---

# Expected Outcome

At the end of this phase, the chatbot should:

- Detect greetings with high accuracy
- Support common greeting variations
- Handle spelling mistakes
- Ignore punctuation
- Ignore capitalization
- Support emojis
- Return randomized responses
- Calculate a confidence score
- Respond instantly without AI involvement

---

# Position in Request Pipeline

```
User Message

↓

Normalize Input

↓

Greeting Engine

↓

Greeting Found?

├── Yes → Return Greeting Response
└── No  → Continue to Next Phase
```

The Greeting Engine should execute before any other message processing logic.

---

# Responsibilities

The Greeting Engine is responsible for:

- Normalizing user input
- Detecting greetings
- Identifying greeting intent
- Handling spelling variations
- Supporting multiple greeting formats
- Returning confidence scores
- Selecting a random response
- Returning structured results

---

# Greeting Categories

Support greetings from different styles.

## Standard Greetings

Examples:

- hi
- hello
- hey
- greetings
- welcome

---

## Casual Greetings

Examples:

- yo
- wassup
- sup
- what's up
- hey there
- hello there

---

## Time-Based Greetings

Examples:

- good morning
- good afternoon
- good evening
- good night
- morning
- evening
- gm
- ga
- ge
- gn

---

## Respectful Greetings

Examples:

- namaste
- namaskar
- pranam
- ram ram
- jai shree ram

---

## Greeting + Bot

Examples:

- hi bot
- hello assistant
- hey chatbot
- hello ai
- hi buddy

---

## Emoji Greetings

Examples:

- 👋
- 🙏
- 😊
- 👋 hi
- hello 👋
- hi 😊

---

# Greeting Dataset

Maintain a centralized greeting dataset.

The dataset should be easy to update without changing application logic.

Examples include:

- hi
- hello
- hey
- greetings
- morning
- evening
- namaste
- yo
- wassup
- hola
- bonjour

Future phases may expand this dataset with multilingual greetings.

---

# Input Normalization

Before matching, normalize every message.

Normalization should include:

- Convert to lowercase
- Remove leading/trailing spaces
- Collapse multiple spaces
- Remove unnecessary punctuation
- Normalize repeated characters
- Preserve meaningful emojis if needed

Examples:

Input:

```
Hello!!!!
```

Normalized:

```
hello
```

Input:

```
Hiiiiiiii
```

Normalized:

```
hii
```

Input:

```
 GOOD   MORNING
```

Normalized:

```
good morning
```

---

# Case Insensitive Matching

The Greeting Engine must detect greetings regardless of capitalization.

Examples:

- HELLO
- Hello
- hElLo
- hello
- HeLLo

All should produce the same result.

---

# Typo Handling

Support common spelling mistakes.

Examples:

- helo
- helllo
- hllo
- hii
- heyy
- heyyy
- gud morning
- mornng

Minor spelling errors should still be recognized.

---

# Repeated Character Handling

Users frequently repeat characters while typing.

Examples:

- hiiii
- heyyyy
- yooooo
- helloooooo

The engine should normalize repeated characters before matching.

---

# Emoji Support

Support greetings that contain emojis.

Examples:

- 👋
- 🙏
- 😊
- hello 👋
- hi 😊
- 👋 hello

Emojis should not prevent greeting detection.

---

# Greeting Detection Strategy

The engine should combine multiple techniques.

Possible approaches include:

- Exact matching
- Normalized matching
- Keyword matching
- Typo tolerance
- Fuzzy similarity
- Confidence scoring

Avoid relying solely on exact string comparison.

---

# Confidence Score

Each detected greeting should include a confidence score.

Purpose:

- Improve routing decisions
- Enable analytics
- Support future enhancements

Example ranges:

- High confidence
- Medium confidence
- Low confidence

Only high-confidence greetings should trigger immediate responses.

---

# Randomized Responses

Avoid returning the same greeting every time.

Maintain a collection of friendly responses.

Examples:

- Hello! 👋 How can I help you today?
- Hi there! What can I assist you with?
- Welcome! How may I help?
- Great to see you! What would you like to know?
- Good to have you here!

Responses should feel natural and conversational.

---

# Response Structure

The Greeting Engine should return a structured result.

The result should include:

- Greeting detected
- Normalized input
- Matched greeting
- Confidence score
- Generated response
- Processing time

This structure will later be consumed by the Orchestrator.

---

# Performance Requirements

Greeting detection should be lightweight.

Target goals:

- Low latency
- Minimal memory usage
- No external API calls
- No AI model invocation
- Constant-time lookups where possible

Greeting detection should complete before more expensive processing begins.

---

# Error Handling

Gracefully handle unexpected inputs.

Examples:

- Empty messages
- Only emojis
- Numbers
- Symbols
- Extremely long strings
- Unsupported formats

The Greeting Engine should never crash because of malformed input.

---

# Logging

Log useful information for monitoring.

Examples:

- Original message
- Normalized message
- Greeting detected
- Confidence score
- Processing time

Avoid logging sensitive user information.

---

# Testing Scenarios

The engine should correctly identify greetings such as:

- hi
- hello
- hey
- helo
- hiiii
- hello!!!
- good morning
- GOOD MORNING
- gm
- yo
- wassup
- namaste
- hello 👋
- 👋 hi
- hello bot
- hi assistant

It should **not** falsely detect greetings in unrelated messages.

---

# Folder Structure

```
backend/

src/

services/
└── greeting/

    ├── greeting.service.ts
    ├── greeting.matcher.ts
    ├── greeting.normalizer.ts
    ├── greeting.responses.ts
    ├── greeting.dataset.ts
    ├── greeting.types.ts
    ├── greeting.constants.ts
    └── index.ts
```

---

# Deliverables

By the end of this phase, the project should include:

- Greeting Engine
- Input normalization
- Greeting dataset
- Typo handling
- Case-insensitive matching
- Repeated character normalization
- Emoji support
- Multiple greeting categories
- Randomized responses
- Confidence scoring
- Structured output
- Logging support
- Unit-test-ready architecture
- Integration with the Orchestrator

---

# Success Criteria

This phase is complete when:

- Greetings are detected accurately across common variations.
- Minor spelling mistakes are handled gracefully.
- Repeated characters do not affect detection.
- Capitalization and punctuation are ignored.
- Emoji-based greetings are recognized.
- Responses are randomized and conversational.
- Confidence scores are generated consistently.
- The Greeting Engine executes before all downstream processing.
- Detection is fast, reliable, and maintainable.
- Overall greeting detection accuracy reaches **95% or higher** on the supported greeting dataset.