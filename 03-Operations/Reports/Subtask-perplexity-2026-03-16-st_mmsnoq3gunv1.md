# Subtask Output — Research Serverless Event-Driven Architectures
## Model: sonar
## Stage: research
## Date: 2026-03-16

## AWS Lambda Triggers
AWS Lambda supports event-driven triggers from services like Amazon EventBridge, Amazon SQS, Amazon Kinesis, Amazon DynamoDB Streams, and Amazon MSK, enabling stateless, scalable functions that respond to events without server management.[5]  
- SAM Kiro power (announced March 13, 2026) simplifies local development of Lambda functions with these triggers, including one-click initialization, building, deploying, and testing event-driven patterns.[5]  
Source: https://aws.amazon.com/about-aws/whats-new/2026/03/aws-sam-kiro-power/  

## AWS Step Functions
AWS Step Functions coordinates multiple AWS Lambda functions into serverless workflows using state machines, streamlining complex operations in event-driven architectures.[1][3]  
- Used in media platforms for modular microservices, providing automatic high availability across Availability Zones.[3]  
Source: https://www.cloudthat.com/resources/blog/understanding-serverless-architecture-on-aws-for-modern-applications (for [1]); https://forgeahead.io/how-aws-serverless-architecture-enhances-media-platform-performance/ (for [3], dated February 25, 2026)  

## Amazon EventBridge
Amazon EventBridge enables event-driven patterns by routing events to Lambda triggers, supporting sources like DynamoDB Streams, SQS, Kinesis, and MSK for microservices and full-stack apps.[5]  
- Integrated in SAM Kiro power for AI-assisted development, enforcing best practices like Powertools for Lambda observability and structured logging by default.[5]  
Source: https://aws.amazon.com/about-aws/whats-new/2026/03/aws-sam-kiro-power/  

## Error Handling Patterns
Error handling in serverless architectures emphasizes defense-in-depth, least privilege IAM roles, resource-based policies, VPC isolation, and runtime security like code signing with AWS Signer.[4]  
- **Dead Letter Queues (DLQs)**: Route failed Lambda invocations to SQS for retry analysis (implied in event-driven retries via Step Functions).[1]  
- **Retry Logic**: Step Functions built-in retries for workflows; persistent connections and async models reduce failures in Lambda.[2]  
- **Monitoring**: CloudWatch for logs; VPC flow logs and security groups for network errors.[4]  
- **Security-Focused**: Encrypt environment variables with KMS, use Secrets Manager, and enable Lambda in private subnets with Network ACLs to contain errors.[4]  
No specific 2026 error handling metrics found; patterns align with stateless design using external state (e.g., DynamoDB).[2]  
Sources: https://aws.amazon.com/blogs/security/building-an-ai-powered-defense-in-depth-security-architecture-for-serverless-microservices/ (for [4]); https://www.geeksforgeeks.org/system-design/serverless-architectures/ (for [2])  

## Recent Developments (Last 30 Days)
- **March 13, 2026**: AWS SAM Kiro power launched for agentic AI-assisted serverless dev, covering Lambda triggers (EventBridge, SQS, etc.), Step Functions workflows, and IAM security—install via Kiro IDE for local testing/deploy.[5]  
Source: https://aws.amazon.com/about-aws/whats-new/2026/03/aws-sam-kiro-power/  

Next Steps:  
- Install SAM Kiro power from Kiro Powers page; init a project with `sam init --runtime nodejs18.x --name eventbridge-lambda-app`; test EventBridge trigger locally.[5]  
- Review AWS Well-Architected Framework for serverless lens (68% cost savings reported).[3]
