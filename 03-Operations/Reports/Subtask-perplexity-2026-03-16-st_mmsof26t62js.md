# Subtask Output — Research Compiler Design Fundamentals
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Lexing (Lexical Analysis)
Lexing breaks source code into tokens, like words in a sentence. Analogy: A lexer is like a tokenizer in natural language processing, scanning text character-by-character to identify keywords (e.g., "if"), identifiers (e.g., variable names), operators (e.g., "+"), and literals (e.g., "42"). No direct example in recent results, but it's foundational before parsing[1].

## Parsing (Syntax Analysis)
Parsing builds a parse tree from tokens to verify syntax matches grammar rules (e.g., context-free grammars). Analogy: Like checking if sentence structure follows English grammar rules. Real example from GeeksforGeeks: For expression "x = (a + b * c) / (a - b * c)", parsing creates a hierarchical tree respecting operator precedence (* before +/−)[1].

## AST Construction (Abstract Syntax Tree)
AST condenses the parse tree by removing unnecessary nodes (e.g., grouping parentheses), focusing on program semantics. Key benefit: Improved visual representation of structure. Real example: Same expression "x = (a + b * c) / (a - b * c)" yields a syntax tree where root is assignment (=), left child "x", right subtree divides addition and subtraction subexpressions with multiplication precedence[1].

## Code Generation (Including Intermediate Code)
After AST, compiler generates intermediate representation (IR), then optimizes and produces target machine code. Process: Front-end (lexing/parsing/AST to IR); back-end (IR to machine code). Real example: High-level C/Java code translates to machine-independent IR like three-address code (e.g., t1 = b * c; t2 = a + t1), enabling portability across machines without full recompilation per target[1]. Benefits include optimization (faster execution, less memory) and reuse; drawbacks: extra memory, longer compile time[1].

No 2025-2026 sources in results provided detailed lexer/parser implementations or full code examples (e.g., regex for lexing "int x=5;" → tokens: INT, ID("x"), ASSIGN, NUM(5), SEMI). Fundamentals align with analysis-synthesis model: source → IR → target[1]. For hands-on, recent video mentions upcoming compiler fundamentals coverage (Mar 14, 2026 session)[4]. Source: https://www.geeksforgeeks.org/compiler-design/intermediate-code-generation-in-compiler-design/[1]; https://www.youtube.com/watch?v=Hz3KQXCbeAA[4].
