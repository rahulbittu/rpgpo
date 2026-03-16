## Explanation

Software Architecture Decision Records (ADRs) are a tool for capturing and communicating decisions about software architecture. They provide a structured way to document the rationale behind architectural choices, which helps in maintaining consistency and clarity within a development team. ADRs are particularly useful in complex projects where decisions have long-term impacts.

### Key Components of an ADR

1. **Title**: A sequential number and a short description of the decision.
2. **Status**: Indicates the current state of the decision (e.g., Proposed, Accepted, Deprecated, Superseded).
3. **Context**: Provides background information on the problem or situation that necessitated the decision.
4. **Decision**: Details the option chosen.
5. **Options Considered**: Lists alternatives with their pros and cons.
6. **Rationale**: Explains why the decision was made.
7. **Consequences**: Outlines the positive and negative impacts of the decision.
8. **Date**: When the decision was made.

## Examples

### Salesforce-specific ADR Example
```plaintext
Title: ADR-001: Use Permission Set Groups over Profiles
Status: Accepted
Context: Scaling access model for growing org with complex permissions.
Options: Profiles (legacy, less composable); Permission Set Groups (modern, scalable).
Decision: Adopt Permission Set Groups.
Rationale: Better composability and maintainability at scale.
Consequences: + Easier scaling; - Migration effort from profiles.
Date: 2026-03-01
```
This example illustrates a decision to use Permission Set Groups in Salesforce to improve scalability and maintainability.

### Uber's ADR Example
Uber uses ADRs to document shifts to federated decision authority, with decisions stored in a central repository. The ADRs ensure that implementation is not blocked until the decision is published, allowing for transparency and accountability.

## Best Practices for Maintaining an ADR Log

- **Central Repository**: Store ADRs in a central, accessible location to ensure all team members can easily find and reference them.
- **Versioning**: Implement version control to track changes over time, as seen in ServiceNow's ADR versioning approach.
- **Regular Reviews**: Schedule periodic reviews to ensure ADRs are still relevant and update them as necessary.
- **Team Involvement**: Encourage team collaboration in the decision-making process to ensure diverse perspectives are considered.

## Guidelines on When to Create or Update ADRs

- **New Decisions**: Create an ADR when a significant architectural decision is made that impacts the project's direction or technology stack.
- **Change in Context**: Update an ADR if the context or assumptions behind a decision have changed significantly.
- **Superseded Decisions**: Create a new ADR when a previous decision is no longer valid and has been replaced by a new one.
- **Periodic Review**: Regularly review ADRs to ensure they are up-to-date and reflect the current state of the project.

## Practice Questions

1. What are the key components of an ADR, and why is each important?
2. How can version control benefit the maintenance of ADRs?
3. Describe a scenario where updating an ADR would be necessary.

## Further Reading

- **"Documenting Architecture Decisions" by Michael Nygard**: A foundational text that explores the concept of ADRs and their importance in software development.
- **"Architecture Decision Records: Making Big Decisions Transparent"**: An article that discusses the benefits and challenges of using ADRs in large organizations.

By following these guidelines and using the provided templates and examples, teams can effectively document and communicate their architectural decisions, ensuring better alignment and understanding across the organization.