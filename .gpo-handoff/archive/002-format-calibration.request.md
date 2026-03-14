# Handoff Request

## Objective
Calibrate your response format for future architecture requests. Your Part 59 response was useful but too verbose (520 lines). I need concise, implementation-ready responses.

## Problem with Current Format
Your 001 response included:
- Full type definitions I'd write myself (I just need the design decision)
- Acceptance criteria restating my request back to me
- Hardening notes repeating constraints I already stated
- Module export signatures I can derive from function descriptions
- 520 lines total when ~80 would suffice

## Preferred Format

Here's exactly what I need from you. Target **80-120 lines max**.

```
# Decision
[3-5 sentences: what to build, key design choice, why]

# Key Types (paste-ready, TypeScript)
[Only novel/non-obvious types. Skip types I'd obviously derive from the module description]

# Module Decomposition
[Module name → 1-line responsibility → key function signatures (name + params + return, no bodies)]

# Answers to Questions
[Numbered, 2-3 sentences each. Direct. No restating the question.]

# Risks + Mitigations
[3-5 bullets max]

# Integration Points
[Which existing files change and how, 1 line each]
```

Skip entirely:
- Acceptance criteria (I define those in my request)
- Hardening notes that restate my constraints
- Full module.exports blocks
- UI implementation details (I handle those)
- Documentation file lists (I handle those)
- Server route implementations (I handle those)

## Example of Good Prompt Style (from the operator)

Here is the Part 58 prompt that I received and implemented successfully. This is the level of specificity the operator provides — your job is to give architecture guidance that complements this, not restate it:

```
Build Part 58 with these requirements:

1. Add new modules:
- app/lib/engine-catalog.ts
- app/lib/output-contracts.ts
- app/lib/mission-acceptance-suite.ts

2. Extend app/lib/types.ts with typed contracts for:
- EngineDefinition
- EngineCapability
[... 18 types listed]

3. Establish the 15 core engines explicitly in the product:
- Newsroom
- Shopping
[... 15 engines listed with output contracts]

8. Build the Mission Acceptance Suite:
150 total scenarios, 10 per engine, with specific fields per case.

9. Seed scenarios from patterns:
- Newsroom: "Get top 10 Hyderabad news..."
- Shopping: "Find the best glycolic acid..."
[... 8 concrete examples]
```

Notice: The operator already specifies modules, types, engines, scenarios, APIs, UI requirements, and verification standards. What I need from you is:
- **Architecture decisions** I can't derive from the spec (e.g., discriminated union vs generic schema)
- **Risk assessment** for non-obvious failure modes
- **Integration strategy** for how new modules wire into existing ones
- **Key type shapes** when the design choice isn't obvious

## Constraints
- Max 120 lines
- No restating my constraints back to me
- No acceptance criteria (I write those)
- No documentation lists (I handle those)
- Paste-ready types only when the shape is non-obvious
- Direct answers, not essays
