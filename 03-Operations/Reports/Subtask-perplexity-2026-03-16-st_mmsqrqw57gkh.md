# Subtask Output — Research Observability Best Practices for Serverless
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## CloudWatch Metrics Best Practices
Monitor Lambda-specific metrics like errors (as percentage of invocations), duration (relative to timeout), throttling, concurrency, iterator age for streams, and dead letter queue (DLQ) messages. Use **Lambda Insights** (CloudWatch extension on Amazon Linux 2/2023 runtimes) to aggregate CPU time, memory, disk, network, cold starts, and worker shutdowns via embedded metric format logs; view in CloudWatch Metrics or Logs Insights.[3][4]
- Set alarms for DLQ with `ApproximateNumberOfMessagesVisible > 0` over 300s period using Terraform: threshold=0, statistic=Sum, actions to SNS.[1]
- Baseline average duration from CloudWatch to tune timeouts (e.g., 3-6s for API events).[2]

## X-Ray Tracing
Enable **AWS X-Ray** with CloudWatch for tracing Lambda invocations, identifying timeouts and performance bottlenecks; integrates natively to analyze duration and errors alongside logs.[2]
- Use for end-to-end visibility in serverless apps, correlating traces with metrics like cold starts from Lambda Insights.[3]

## Structured Logging
Emit logs in **embedded metric format** via Lambda Insights extension (as a layer) for each invocation, enabling Logs Insights queries on structured data like CPU/memory without custom aggregation.[3]
- Best practice: Avoid traditional server metrics; focus on invocation-level logs for errors/throttles, with JSON structuring for parsing (e.g., via CloudWatch Logs).[1][2]

## Alerting Setup
Create **CloudWatch Alarms** via Terraform for Lambda: errors (percentage), duration (p95 near timeout), throttling (>0), concurrency (near limits), iterator age (> processing lag).[1]
- **Next steps**: 
  1. Add Lambda Insights layer to functions: `arn:aws:lambda:<region>:017000801446:layer:LambdaInsightsExtension:21` (check latest version).[3]
  2. Deploy Terraform for alarms (e.g., DLQ example above) and SNS actions.[1]
  3. Test: Invoke function to trigger metrics, query in Logs Insights for "Fields @timestamp, cpuUtilized | stats avg(cpuUtilized) by bin(1h)".[4]
- Monitor timeouts with Duration metric alarms; fallback to cached data if needed.[2]

Sources:  
- [1] https://oneuptime.com/blog/post/2026-02-23-how-to-create-cloudwatch-alarms-for-lambda-in-terraform/view (Feb 23, 2026)  
- [2] https://www.dash0.com/guides/aws-lambda-timeout-best-practices  
- [3] https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html  
- [4] https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-metrics.html
