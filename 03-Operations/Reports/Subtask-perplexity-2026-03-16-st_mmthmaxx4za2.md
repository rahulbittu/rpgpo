# Subtask Output — Research Inter-Cloud Networking Costs and Latency
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Inter-Cloud Data Transfer Costs, Latency, and Security

## Data Transfer and Egress Costs

**Egress pricing varies significantly across hyperscalers.** AWS charges **$0.05–0.09 per GB** for data egress, with a 100 GB monthly free tier[2]. GCP charges **$0.12 per GB** for general network egress (data leaving Google Cloud entirely)[3], also with a 100 GB free tier[2]. Azure charges **$0.087 per GB** with a 5 GB monthly free tier[2].

For practical scale, transferring **50 TB per month** costs approximately **$4,300 on AWS, $4,200 on Azure, and $4,100 on Google Cloud**[1].

**Hidden data transfer costs compound egress charges.** In AWS, NAT Gateway fees add **$0.045 per GB** for data leaving private subnets[5]. Cross-region transfers cost **$0.01–0.02 per GB** before any processing begins[5]. Inter-AZ (Availability Zone) traffic incurs per-GB charges; one organization reduced egress costs by **70% ($2,000 per month)** by consolidating services to the same availability zone[7].

**GCP storage retrieval fees** add complexity: Nearline storage costs **$0.01 per GiB** to retrieve, Coldline costs **$0.02 per GiB**, and Archive costs **$0.05 per GiB**[3]. Inter-region replication in GCP charges **$0.02 per GiB** in North America and Europe[3].

**Unmanaged data transfer can add 25–60% to monthly cloud bills**[4]. One AI SaaS company reduced egress from **$20,000 to $8,500 per month** by configuring CloudFront with proper cache TTLs and compression[4].

## Alternative: Zero-Egress Solutions

**Cloudflare R2** offers **$0.00 per GB egress** with unlimited free tier, compared to AWS S3's **$0.09/GB**[5]. At scale, this creates dramatic savings: 20 TB/month costs **$1,740 on AWS vs. $0 on R2**; 200 TB/month costs **$16,200 on AWS vs. $0 on R2**[5].

## Cost Optimization Strategies

**Audit tools by provider:**
- AWS: Cost and Usage Reports (CUR) with Athena queries to identify NAT gateway and inter-AZ charges[4]
- GCP: Network Topology and Billing Export features[4]
- Azure: Network Watcher and Cost Analysis[4]

**CDN offload reduces origin egress by 60–90%** using CloudFront, Cloud CDN, or Azure CDN[4].

---

**Note:** The search results provided do not include specific latency metrics (e.g., millisecond comparisons between regions) or detailed security practices (e.g., encryption standards, compliance certifications). To obtain comprehensive latency benchmarks and security frameworks, additional searches targeting those specific topics would be required.

Source: [1] https://techvzero.com/cross-cloud-data-sync-without-egress-bill/ | [2] https://www.digitalocean.com/resources/articles/comparing-aws-azure-gcp | [3] https://www.cloudzero.com/blog/gcp-storage-pricing/ | [4] https://leanopstech.com/blog/cloud-cost-optimization-data-transfer-egress/ | [5] https://dev.to/ryan_e200dd10ede43c8fc2e4/zero-egress-why-i-chose-cloudflare-workers-r2-over-aws-for-a-file-processing-api-2640 | [7] https://cast.ai/blog/how-we-reduced-egress-cost-by-70-using-cast-ai/
