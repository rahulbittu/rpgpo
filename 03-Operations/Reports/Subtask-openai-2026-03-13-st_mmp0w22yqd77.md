# Subtask Output — Locate Files for Implementation
## Model: gpt-4o
## Stage: locate_files
## Date: 2026-03-13

To identify the exact files in the TopRanker repository that need modification for implementing an optimization strategy, follow these steps:

1. **Understand the Optimization Strategy**: Clearly define what the optimization strategy entails. For example, if it's a performance optimization, determine whether it involves algorithm improvements, data structure changes, or parallel processing.

2. **Locate Core Functional Files**:
   - Identify files related to the core functionality of the TopRanker. These are typically located in directories like `src/`, `lib/`, or `core/`.
   - Look for files with names that suggest ranking logic, such as `ranker.py`, `ranking_algorithm.js`, or `ranking_engine.cpp`.

3. **Identify Configuration Files**:
   - If the optimization involves configuration changes, locate files like `config.json`, `settings.yaml`, or `config.py`.

4. **Check for Dependency Files**:
   - If the optimization requires updating dependencies, modify files like `requirements.txt`, `package.json`, or `pom.xml`.

5. **Review Documentation and Comments**:
   - Examine any README files, documentation, or in-code comments that might hint at where optimization can be applied.

6. **Examine Test Files**:
   - Identify test files that might need updates to reflect the optimization. These could be located in a `tests/` or `spec/` directory.

7. **Use Git or Code Search Tools**:
   - Utilize `git grep` or IDE search functionalities to find keywords related to the optimization strategy across the codebase.

By following these steps, you can pinpoint the exact files in the TopRanker repository that require modifications to implement the chosen optimization strategy.
