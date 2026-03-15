# Subtask Output — Research Terraform Basics
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Terraform Basics

Terraform is an open-source Infrastructure as Code (IaC) tool developed by HashiCorp, using HashiCorp Configuration Language (HCL) to define, provision, and manage infrastructure across providers like AWS, Azure, Google Cloud, Kubernetes, and on-premises setups.[1][3]

Core workflow: `terraform init` (initializes providers), `terraform plan` (creates execution plan comparing desired vs. existing state), `terraform apply` (provisions/updates resources).[1][3]

**Standard file structure** (from best practices, dated Feb 23, 2026):
- `main.tf`: Primary resource definitions.
- `variables.tf`: Input variables with descriptions, types, and validations (e.g., `variable "environment" { type = string; validation { condition = contains(["dev", "staging", "production"], var.environment); } }`).
- `outputs.tf`: Output values with descriptions (e.g., `output "vpc_id" { description = "The ID of the VPC"; value = aws_vpc.main.id; }`).
- `versions.tf`: Pin versions (e.g., `terraform { required_version = ">= 1.6.0, < 2.0.0"; required_providers { aws = { source = "hashicorp/aws"; version = "~> 5.30"; } } }`).
- `locals.tf`: Computed values (e.g., `locals { name_prefix = "${var.team}-${var.service}-${var.environment}"; }`).
- `data.tf`, `backend.tf`, `terraform.tfvars` (for non-secrets).[2]

**Example resources managed**: Virtual machines, databases, storage buckets, load balancers, VPC networks, IAM permissions; supports N-tier apps with auto-dependency handling.[1]

## Infrastructure as Code (IaC) Principles

IaC uses declarative code to describe desired infrastructure state (e.g., "2 servers of type X in region Y"), enabling Terraform to automate API calls for creation/updates, ensuring consistency, repeatability, and no "configuration drift" across dev/test/staging/prod environments.[1][4]

Key principles from 2026 sources:
- **Consistency/Repeatability**: Identical code yields identical environments; script entire platforms from CI/CD to monitoring.[4]
- **Version Control & Reviews**: Treat IaC as code; use modules for DRY (Don't Repeat Yourself) principles.[4]
- **State Management**: Tracks config-to-real-world mapping; avoid hardcoding secrets or complex logic to prevent corruption/loss.[5]
- **Modularity/Scalability**: Build reusable modules for VPCs (multi-subnet/security), scalable web apps on AWS/Azure, load balancers (zero-downtime), multi-region backups.[5]
- **Idempotency**: Re-running code doesn't alter correct infrastructure; detected changes only apply deltas.[1]

**Real-world applications** (2026 training projects): Automated VPC with subnets/security; scalable web envs; load balancers; resilient multi-region setups.[5]

## Sources
- [1] https://www.harness.io/harness-devops-academy/what-is-terraform (Feb 27, 2026)
- [2] https://oneuptime.com/blog/post/2026-02-23-how-to-create-terraform-best-practices-documentation/view (Feb 23, 2026)
- [3] https://yandex.cloud/en/docs/terraform/quickstart (Updated Mar 5, 2026)
- [4] https://www.refontelearning.com/blog/devops-engineering-in-2026-mastering-kubernetes-jenkins-docker-helm-terraform (3 days ago from Mar 15, 2026)
- [5] https://www.devopsschool.com/blog/complete-guide-to-hashicorp-terraform-certification/ (6 days ago from Mar 15, 2026)
