# Subtask Output — Research Best Practices and AWS Example
## Model: sonar
## Stage: research
## Date: 2026-03-15

# Terraform Best Practices and AWS Implementation Guide

## Key Terraform Best Practices (February 2026)

**Remote State Management with Locking**
Store state in a shared backend with locking to prevent team corruption and concurrent applies.[2] This is foundational for multi-engineer environments.

**Version Control and GitOps Workflow**
Treat infrastructure configurations as application code with automated CI/CD pipelines. Manual changes should be prevented through version control enforcement.[2]

**Security-First Configuration**
- Use **IAM roles instead of access keys** for AWS provider authentication[1]
- **Never hardcode secrets** in Terraform files or commit `.tfvars` files containing credentials[1]
- Use AWS Secrets Manager for sensitive data: reference secrets via `data.aws_secretsmanager_secret_version`[1]
- Encrypt all storage resources with KMS encryption[1]
- Restrict security groups to specific CIDR ranges; never use `0.0.0.0/0` for SSH access[1]

**Code Quality and Consistency**
- Run `terraform fmt` and `terraform validate` on every change[2]
- Adopt consistent naming conventions and folder structure across teams[2]
- Apply consistent resource tagging (owner, environment, cost-center, application)[2]

**Module Reuse and Governance**
- Reuse trusted community and shared modules with pinned versions instead of reinventing patterns[2]
- Implement module governance policies with designated owners, publication requirements, and review processes[3]
- Follow standardized module structure: `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, `README.md`, `examples/`, `tests/`[3]

**Policy as Code and Automation**
- Enforce rules automatically for security, cost, and approvals[2]
- Use Infrastructure as Code to ensure security configurations (encrypted buckets, restricted firewall rules) are consistently applied and cannot be bypassed[4]
- Implement automated remediation: AWS Config and Lambda can self-heal infrastructure (e.g., reverting accidentally public S3 buckets)[4]

**Advanced Patterns**
- Use `dynamic blocks` for optional nested configuration without duplicating resources[2]
- Use `lifecycle` blocks to control risky changes with `prevent_destroy`, `create_before_destroy`, and `ignore_changes`[2]
- Import existing infrastructure with `terraform import` so Terraform reflects reality before making changes[2]

---

## Detailed AWS Implementation Example

### Security Best Practices Code (Published February 23, 2026)

**IAM Role Authentication:**
```hcl
provider "aws" {
  region = var.region

  assume_role {
    role_arn = var.terraform_role_arn
    session_name = "terraform-${var.environment}"
  }
}
```

**S3 Encryption with KMS:**
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
      kms_master_key_id = aws_kms_key.example.arn
    }
    bucket_key_enabled = true
  }
}
```

**Restricted Security Groups:**
```hcl
resource "aws_security_group_rule" "allow_https" {
  type = "ingress"
  from_port = 443
  to_port = 443
  protocol = "tcp"
  cidr_blocks = var.allowed_cidr_blocks  # Specific ranges only
  security_group_id = aws_security_group.example.id
}
```

**Secrets Management (Never Hardcode):**
```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
  # ... other configuration
}
```

### Module Governance Structure (February 23, 2026)

**Standardized Module Layout:**
```
terraform-aws-<service>/
  main.tf                    # Primary resource definitions
  variables.tf               # Input variables with types
  outputs.tf                 # Output declarations
  versions.tf                # Provider and Terraform version requirements
  locals.tf                  # Local computed values
  README.md                  # Usage documentation
  CHANGELOG.md               # Version history
  examples/
    simple/main.tf          # Minimal usage example
    complete/main.tf        # Full-featured example
  tests/
    basic.tftest.hcl        # Basic validation tests
    complete.tftest.hcl     # Comprehensive tests
```

**Module Publication Requirements:**
- Pass automated validation (`terraform validate`, `tflint`)
- Include at least one working example
- Provide README with usage documentation
- Follow semantic versioning
- Require major version bump for breaking changes with 2-week notice period[3]

**Access Control Model:**
- **Platform team**: Manage (full access to all modules)
- **Service teams**: Read (can use modules, cannot modify)
- **Module owners**: Write (can update their specific modules)[3]

---

## AWS Security Integration with Terraform

**Automated Threat Detection Impact:**
Companies using automated security analytics like GuardDuty can reduce mean time to detect (MTTD) breaches by up to **50%**[4]. Integrate logs into centralized dashboards for situational awareness.

**Data Protection:**
Use AWS Certificate Manager (ACM) to automate SSL/TLS certificate renewals for data in transit protection[4]. Deploy AWS WAF (Web Application Firewall) and AWS Shield for DDoS mitigation[4].

**Self-Healing Infrastructure:**
Implement automated remediation through AWS Config and Lambda. Example: if an S3 bucket is accidentally made public, a Lambda function instantly reverts it to private[4].

**Critical Statistic:**
Gartner predicts human error will cause **99% of cloud failures**. Automation removes this risk by ensuring security configurations are consistently applied through IaC[4].

---

**Sources:**
- [1] https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-best-practices-documentation/view
- [2] https://spacelift.io/blog/terraform-best-practices
- [3] https://oneuptime.com/blog/post/2026-02-23-how-to-use-terraform-module-best-practices-for-large-organizations/view
- [4] https://www.kellton.com/kellton-tech-blog/aws-security-best-practices
