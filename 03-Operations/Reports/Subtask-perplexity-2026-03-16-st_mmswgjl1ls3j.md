# Subtask Output — Research AWS EventBridge Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Event Schema Registry
EventBridge Schema Registry stores and organizes event schemas for structure definition, documentation, code generation, and validation. It supports automatic schema discovery on event buses, generating schemas from observed events for development, with options to merge into custom registries for production grouping by domain.[2][4][3] AWS services publish hundreds of events to it for IT automation and DevOps; use JSONSchemaDraft4 type as in Terraform examples: `aws_schemas_registry` with `aws_schemas_schema` for "OrderCreated" events including properties like totalAmount.[1][2]

- **Best practice**: Enable forward/backward compatibility via atomic versioning (new schema versions on changes); include version fields in events for routing (e.g., EventBridge rules filter by detail.version).[2][9]
- **Concrete next step**: Run `aws schemas create-registry --registry-name app-events --description "Schema registry for application events"` then `aws schemas create-schema` with JSON content; integrate client libraries for validation/serialization.[3][8]
Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-schema-registry.html (inferred from [2][3][4]; official docs via search)

## Dead Letter Queue Handling
Configure dead_letter_config on targets like Lambda or Step Functions with SQS queue ARNs for unprocessed events after retries. Set retry_policy with maximum_retry_attempts=3 and maximum_event_age_in_seconds=3600 (1 hour).[1][3]

- **Terraform example**:
  ```
  dead_letter_config {
    target_arn = aws_sqs_queue.lambda_dlq.arn
  }
  ```
  Environment vars pass DLQ_URL to Lambdas.[1]
- **Best practice**: Pair with X-Ray tracing (tracing_config mode="Active") for debugging failed events.[1]
- **Concrete next step**: Create SQS DLQ `aws sqs create-queue --queue-name lambda-dlq`, attach to EventBridge target via console or CDK/Terraform; monitor via CloudWatch metrics on AtLeastOnceDelivery failures.
Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-dead-letter-queues.html (core AWS doc from patterns in [1][3])

## Cross-Account Event Routing
EventBridge supports custom event buses for cross-account routing via resource policies or IAM roles; put events on source account bus, rules target destination account buses.[2] (Limited direct results; standard via central bus sharing.)

- **Best practice**: Use partner event sources or SaaS integrations for cross-account; enable via `aws events put-rule` with cross-account permissions.
- **Concrete next step**: In source account, create bus policy `aws events put-permission --event-bus-name main --principal arn:aws:iam::DEST_ACCOUNT:root --action events:PutEvents`; test with `aws events put-events`.
Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cross-account.html (from AWS patterns in [1][3])

## Replay Capabilities
EventBridge supports event replay from archives (up to 30 days retention) or via custom logic; no native infinite replay, but use schema versioning and rule patterns to reprocess historical events matching criteria.[2][9]

- **Best practice**: Archive events on high-value rules (e.g., orders >$1000 via detail.totalAmount >=1000 numeric filter), replay to catch up services.[3]
- **Concrete next step**: Create archive `aws events create-archive --archive-name order-archive --event-source-arn arn:aws:events:region:account:rule/order-created --retention-days 7`; replay `aws events replay-events-from-archive`.
Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archives-replays.html (from [3] patterns)

## Testing Strategies
Use schema discovery for dev (auto-generate from bus traffic), EventBridge console for rule simulation, or CDK-generated patterns from Schema Registry (e.g., S3 objectCreatedPattern).[6][7] Test rules with sample events in console; validate via custom libraries against registry.[8]

- **Best practice**: Version events from day one (e.g., detail.version field), route by version; simulate via `aws events test-event-pattern`.[9][2]
- **Concrete next step**: 
  1. Console: Events > Rules > Create rule > Build event pattern with JSON like `{"source": ["com.mycompany.orders"], "detail-type": ["Order Created"]}`; select "Test pattern".
  2. CLI: `aws events put-events --entries '[{"Source": "test", "DetailType": "Test", "Detail": "{\"test\": true}"}]'; check targets.
  3. Integrate Parameter Store events for policy testing as in Systems Manager guide.[7]
Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-test-event-patterns.html (from [7][2])
