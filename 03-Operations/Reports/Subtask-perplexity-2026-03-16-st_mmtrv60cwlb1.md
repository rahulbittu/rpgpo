# Subtask Output — Research Documentation Debt Management
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## API Documentation Debt Best Practices
Undocumented or poorly documented APIs create reverse-engineering burdens for consumers; test all code examples in CI to fail builds on errors, document every error status code with triggers and remedies, and establish style guides for naming, errors, pagination, authentication, and versioning enforced via automated linting.[1]

- **Test Documentation Examples**: Include curl commands, request bodies, and response schemas that must run successfully against the live API in CI pipelines.[1]
- **Error Documentation**: Cover all error responses equally to success paths, specifying status codes, triggers, and consumer actions.[1]
- **Style Guides and Enforcement**: Define conventions and review violations as code bugs; use tools like **Spectral** for linting in CI.[1]
- **API Governance**: Form API review boards or stewards to approve endpoints; maintain a centralized API catalog to avoid redundancy.[1]

## Recommended Tools and Frameworks
Use **Pact** for consumer-driven contract testing to verify expectations and catch breaking changes pre-deployment.[1]

- **Pact**: Enables consumers to define API expectations; provider CI confirms compliance, preventing "works on my machine" issues.[1]
- **Spectral**: OpenAPI linter for automated enforcement of style guides in pipelines.[1]

## Specific Examples of Debt and Fixes
- **Broken Examples**: Outdated curl commands with incorrect headers or mismatched schemas; fix by CI-testing all docs.[1]
- **Missing Error Docs**: Only happy paths covered, forcing production errors for discovery; fix by mandating full error coverage.[1]

Source: https://techdebt.best/api-debt/[1]
