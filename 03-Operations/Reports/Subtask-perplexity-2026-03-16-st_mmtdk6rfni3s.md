# Subtask Output — Research Terraform State Management
## Model: sonar
## Stage: audit
## Date: 2026-03-16

I'll search for current information on Terraform state management strategies for multi-team organizations.
<search_results>
Let me conduct additional searches to get comprehensive, current information on this topic.
</search_results>

Based on the search results provided, here's what I found on Terraform state management for multi-team organizations:

## Remote Backends and State Locking

**AWS S3 with DynamoDB** is the standard approach for multi-team environments[2][3]. The S3 bucket stores state files while a DynamoDB table with a "LockID" attribute manages concurrent access[2][3]. When Terraform operations run (plan, apply, destroy), the state file locks automatically, queuing subsequent requests until the operation completes[3].

**Google Cloud Storage (GCS)** offers built-in locking without additional configuration[1]. State locking is enabled by default—Terraform creates a lock file at `<prefix>/<workspace>.tflock` during state-modifying operations[1].

## Best Practices for Multi-Team Setups

**Workspace and prefix isolation**: Use unique state prefixes for each Terraform configuration and never share state files between configurations[1]. This prevents teams from accidentally modifying each other's infrastructure[1].

**Lock timeout configuration**: Set reasonable lock timeouts in CI/CD pipelines (3-5 minutes typically)[1]. Use `-lock-timeout` instead of `-lock=false` when builds need to wait rather than disabling locking entirely[1].

**State bucket hardening**: Block all public access, enforce encryption (AWS KMS recommended), enable versioning for recovery, and restrict access via IAM roles instead of long-lived keys[2][3]. Enable CloudTrail and alerts for unusual access patterns[3].

**Versioning and recovery**: Enable versioning on state buckets to recover from corruption[1][2]. Implement lifecycle rules to clean up old versions (e.g., keep 30 newer versions)[1].

**Monitoring**: Monitor lock activity through Cloud Audit Logs to detect pipeline congestion[1]. Force-unlock only after verifying no other operations are running by checking your CI/CD dashboard first[1].

## Implementation Example

For AWS S3 backend setup, create both the S3 bucket with encryption and versioning, plus a DynamoDB table[2]:

```hcl
resource "aws_dynamodb_table" "terraform_locks" {
  name = "terraform-state-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

**Sources:**
- https://oneuptime.com/blog/post/2026-02-17-how-to-configure-terraform-remote-state-locking-with-google-cloud-storage/view
- https://oneuptime.com/blog/post/2026-02-20-terraform-state-management/view
- https://spacelift.io/blog/terraform-s3-backend

**Note on search limitations**: The provided results focus on remote backends and state locking but do not include specific information on drift detection tools, import workflows, or multi-team organizational patterns with real product names, pricing, or recent case studies. To get comprehensive coverage of drift detection solutions (like Spacelift, Terraform Cloud, or Atlantis) and import workflow strategies, additional targeted searches would be needed.
