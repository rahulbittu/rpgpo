# Subtask Output — Research Secrets Management Tools
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## AWS Secrets Manager

**AWS Secrets Manager supports automatic rotation via Lambda functions and CloudFormation, with configurable schedules like `automatically_after_days` (e.g., 30 days), dynamic references for database credentials, resource-based policies for least-privilege access, and integration with AWS CloudTrail for audit trails.**[1][3][4]

- **Rotation Policies**: Use `AWS::SecretsManager::RotationSchedule` resource with a Lambda rotation function and cron schedule; managed rotation for RDS via `ManageMasterUserPassword` in `AWS::RDS::DBCluster`; Terraform example sets `rotation_rules` with `automatically_after_days = var.rotation_days` (e.g., 30-90 days configurable).[1][3][4]
- **Dynamic Secrets Capabilities**: Generates passwords for RDS, Redshift, DocumentDB using dynamic references; creates secrets via `AWS::SecretsManager::SecretTargetAttachment` for rotation; supports JSON structure matching for rotation eligibility.[1][5]
- **Least-Privilege Access Patterns**: Resource-based policies via `aws_secretsmanager_secret_policy` Terraform resource; service-managed secrets prefixed by owning service (e.g., RDS); IAM permissions for `describe-secret` to check `OwningService`.[3][4]
- **Audit Trail Features**: CloudFormation stacks created for rotation (view via "View stack" banner); integrates with CloudTrail for API calls like `create-secret`, `rotate-secret` (not explicitly detailed in results).[1][3]

Source: https://docs.aws.amazon.com/secretsmanager/latest/userguide/cloudformation.html[1]; https://docs.aws.amazon.com/secretsmanager/latest/userguide/manage_update-secret.html[3]; https://oneuptime.com/blog/post/2026-02-23-how-to-build-a-secrets-management-infrastructure-with-terraform/view[4]

## HashiCorp Vault

**HashiCorp Vault excels in dynamic secrets via engines like database plugins, with role-based TTLs for ephemeral credentials, identity-based auth (e.g., Kubernetes ServiceAccount), and automated lease renewal, though specific rotation intervals and audit details are generalized in results.**[2]

- **Rotation Policies**: Automated rotation via secrets engines; supports short TTLs for revocation (e.g., task-duration); integrates with tools for 90-day cycles but customizable via APIs/scripts.[2][6][7]
- **Dynamic Secrets Capabilities**: Enable database engine (e.g., PostgreSQL) with connection URL and roles; generates users with specific privileges (e.g., SELECT on tables); auto-deletes after TTL; sidecar injectors for runtime credential fetch/renewal.[2]
- **Least-Privilege Access Patterns**: Granular roles limit permissions (e.g., no admin for analysis agents); Kubernetes auth maps ServiceAccount to policies; identity proofing before secret issuance.[2]
- **Audit Trail Features**: Lease monitoring for revocation; API-based logging (not quantified in results).[2]

Source: https://fast.io/resources/ai-agent-dynamic-secrets/[2]; https://www.reform.app/blog/best-practices-storing-api-keys-securely[6]; https://namastedev.com/blog/designing-secure-secrets-management-workflows/[7]

## SOPS (Secrets OPerationS)

**No specific information found in search results on SOPS rotation policies, dynamic secrets, least-privilege access, or audit trails; results focus on AWS Secrets Manager and Vault, with SOPS absent despite query.** 

- Searched alternatives: "SOPS secrets rotation policy", "SOPS dynamic secrets AWS", "SOPS least privilege audit" yielded no relevant hits in provided results.
- Next Steps: Check official Mozilla SOPS docs (e.g., GitHub) manually for age-key encryption/rotation; integrate with Vault for dynamic use cases.

Source: [no URL available - no matching results][all]
