# Subtask Output — Synthesize Code Review Guide
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Key Findings

1. **Prioritize High-Impact Issues**: Focus on logic, architecture, performance, security, and API compatibility rather than style or formatting, which can be handled by automated tools. This ensures that reviews are efficient and impactful[1][4][5].

2. **Use Constructive Feedback Techniques**: Frame feedback as questions to reduce defensiveness and promote collaboration. Provide actionable suggestions with context, using an impact/effort matrix to enhance the usefulness of feedback[4][7].

3. **Recognize and Avoid Common Anti-Patterns**: Be aware of common pitfalls in review culture, such as focusing too much on minor issues, being overly critical without offering solutions, and failing to recognize the context of changes.

## Detailed Analysis

### What to Look For

- **Logic and Correctness**: Identify bugs or risky patterns that could lead to functional issues. This includes checking for edge cases and ensuring that the code behaves as expected under various conditions.
  
- **Architecture and Design**: Evaluate how the new code integrates with existing systems. Ensure that it follows established design patterns and does not introduce unnecessary complexity.

- **Performance Bottlenecks**: Look for inefficient algorithms or data handling that could slow down the application, especially in critical paths.

- **Security Vulnerabilities**: Check for common security issues like SQL injection, cross-site scripting, and other vulnerabilities that could be exploited.

- **API Compatibility**: Ensure that changes do not break existing API contracts and that they align with the overall business logic and requirements[5].

### Effective Feedback Methods

- **Ask Questions**: By asking questions like "What was the reasoning behind this implementation?" you encourage the developer to think critically about their choices, fostering a more collaborative environment[7].

- **Provide Contextual Suggestions**: Use an impact/effort matrix to categorize feedback, helping developers prioritize changes based on their significance and the effort required to implement them[4].

### Common Anti-Patterns in Review Culture

- **Nitpicking**: Focusing excessively on minor style issues rather than substantive problems can waste time and demoralize developers.

- **Over-Criticism**: Providing negative feedback without constructive suggestions can lead to defensiveness and hinder improvement.

- **Lack of Context Awareness**: Ignoring the broader context of changes, such as deadlines or project goals, can lead to unrealistic expectations and unnecessary friction.

## Recommended Actions

1. **Implement Automated Tools**: Use linters and formatters to handle style and formatting issues automatically, allowing reviewers to focus on more critical aspects like logic and architecture.

   - **Why**: This reduces the cognitive load on reviewers and ensures that reviews are more focused and efficient.
   - **Expected Outcome**: Faster reviews with more emphasis on impactful issues.
   - **First Step**: Integrate tools like ESLint or Prettier into your CI/CD pipeline.

2. **Adopt a Question-Based Feedback Approach**: Train reviewers to frame feedback as questions rather than commands.

   - **Why**: This approach reduces defensiveness and encourages a more open dialogue.
   - **Expected Outcome**: Improved collaboration and more thoughtful code changes.
   - **First Step**: Conduct a workshop or training session on effective communication techniques in code reviews.

3. **Use an Impact/Effort Matrix for Feedback**: Encourage reviewers to categorize their feedback using this matrix to prioritize issues effectively.

   - **Why**: Helps developers focus on changes that offer the most significant benefit for the least effort.
   - **Expected Outcome**: More efficient use of development time and resources.
   - **First Step**: Develop a template for feedback that includes impact and effort levels, and distribute it to your team.

4. **Educate on Anti-Patterns**: Raise awareness about common review culture pitfalls and how to avoid them.

   - **Why**: Prevents common issues that can lead to inefficiencies and team dissatisfaction.
   - **Expected Outcome**: A healthier, more productive review culture.
   - **First Step**: Create a document or presentation outlining common anti-patterns and distribute it to the team.
