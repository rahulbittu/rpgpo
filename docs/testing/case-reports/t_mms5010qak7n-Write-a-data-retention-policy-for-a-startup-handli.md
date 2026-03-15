# Write a data retention policy for a startup handling user data. Include retentio

## Phase 1: User Context
- **Task ID**: `t_mms5010qak7n`
- **Engine**: general

### Request
> Write a data retention policy for a startup handling user data. Include retention periods by data type, deletion procedures, and regulatory compliance.

## Phase 2: Board Deliberation
**Objective**: Create a comprehensive data retention policy for a startup handling user data.
**Strategy**: Research common data retention policies and regulatory requirements for startups handling user data. Synthesize this information into a structured policy document that outlines retention periods, deletion procedures, and compliance measures. Ensure the policy is tailored to the startup's specific data types and business needs.

## Phase 3: Execution

### Step 1: Research Data Retention Policies [perplexity]
# Data Retention Policies and Regulatory Requirements for Startups (2026)

## Key Regulatory Requirements

**GDPR** mandates that personal data be retained only as long as necessary for its original purpose[2]. Organizations must document which data is held, why, where, and for how long[2].

**HIPAA** requires retention of health records for **6+ years**[1], with a six-year statute of limitations for document retention policies[7].

**COPPA (Children's Online Privacy Protection Act)** has amended requirements effective through April 22, 2026. Covered companies must establish a written data retention policy describing: (1) purposes for data collection, (2) business need for retention, and (3) deletion timeframe[5]. The policy must be incorporated directly into the online privacy notice—linking to a separate policy is insufficient[5]. Companies must demonstrate that retention periods are "reasonably necessary" to fulfill the original purpose, including after account activity ends[5].

**PCI DSS** requires minimum **1-year retention** for transaction logs and audit logs[4].

## Industry-Specific Retention Periods

| Data Type | GDPR | HIPAA | PCI DSS | Recommended Approach |
|---|---|---|---|---|
| PII/PHI | Delete when purpose fulfilled | 6 years | Varies | Partition expiration + scheduled deletion |
| Transaction logs | As needed | 6 years | 1 year minimum | Partition expiration with long retention |
| Audit logs | As needed | 6 years | 1 year minimum | Separate dataset, long retention |
| Analytics (anonymized) | No limit | No limit | No limit | No expiration needed |

**Financial services** face stricter requirements: SOX mandates **7 years** of financial records, trade confirmations require **3-6 years**, customer communications **5 years**, and broker-dealer records **6 years post-termination**[1].

## Implementation Strategy for Startups

**Phase 1: Assessment (Weeks 1-4)**[1]
- Conduct a data census identifying volume, types, and storage locations
- Map applicable regulations to your datasets
- Calculate over-retention costs and fines vs. storage expenses

**Phase 2: Policy Definition**[2]
- Identify legal requirements first—they form the foundation
- Define business requirements for each data type (e.g., "retain donor records indefinitely but archive inactive donors after 7+ years")
- Assign responsibility for policy creation (typically IT, legal, and key stakeholders)
- Document the policy and include it in your privacy notice

**Phase 3: Technical Implementation**
For **Google Cloud Storage**, use retention policies with bucket lock to enforce write-once-read-many (WORM) storage[6]:
- Create a dedicated compliance bucket
- Set retention period (e.g., 7 years for financial data)
- Lock the retention policy permanently to prevent tampering

For **BigQuery**, use partition expiration and scheduled queries for automated deletion[4].

**Phase 4: Operations & Monitoring**[1]
- Conduct quarterly compliance audits
- Implement cost dashboards (Clo

### Step 2: Draft Data Retention Policy [openai]
## Key Findings

1. **Regulatory Compliance**: The startup must comply with GDPR, HIPAA, COPPA, and PCI DSS regulations. Each regulation has specific requirements for data retention and deletion, which must be integrated into the policy.
   
2. **Retention Periods**:
   - **PII/PHI**: Retain for the duration necessary to fulfill the original purpose, with a maximum of 6 years for HIPAA compliance.
   - **Transaction Logs**: Retain for a minimum of 1 year as per PCI DSS, with potential extension based on business needs.
   - **Audit Logs**: Retain for a minimum of 1 year, aligning with PCI DSS requirements.

3. **Deletion Procedures**: Implement automated deletion processes post-retention period, ensuring data is irretrievably removed from all systems.

4. **Documentation and Transparency**: Clearly document the data retention policy and integrate it into the online privacy notice to comply with COPPA and GDPR requirements.

## Detailed Analysis

### Regulatory Compliance

- **GDPR**: Requires data retention to be limited to the period necessary for its original purpose. Documentation of data purpose, location, and retention period is mandatory.
  
- **HIPAA**: Health records must be retained for at least 6 years, with strict documentation and access controls.

- **COPPA**: Requires a written data retention policy that is part of the online privacy notice. Retention must be justified as necessary for the original data collection purpose.

- **PCI DSS**: Mandates a minimum 1-year retention for transaction and audit logs, focusing on security and traceability.

### Retention Periods

- **PII/PHI**: Align with HIPAA by setting a 6-year maximum retention period unless the data is no longer needed, in which case it should be deleted sooner.

- **Transaction Logs**: Retain for at least 1 year, with potential extensions for business analysis or legal requirements.

- **Audit Logs**: Maintain for at least 1 year to ensure compliance and facilitate audits.

### Deletion Procedures

- Implement automated scripts or software solutions to delete data post-retention period.
- Ensure deletion is comprehensive, covering all backups and redundant copies.
- Regularly audit deletion processes to ensure compliance and effectiveness.

### Documentation and Transparency

- Clearly outline the data retention policy in the privacy notice.
- Provide users with information on data types collected, retention periods, and deletion processes.
- Regularly update the policy to reflect changes in regulations or business practices.

## Recommended Actions

1. **Develop a Comprehensive Data Retention Schedule**:
   - **What to do**: Create a detailed schedule specifying retention periods for each data type.
   - **Why**: Ensures compliance with regulatory requirements and optimizes data management.
   - **Expected outcome**: Clear guidelines for data retention, reducing legal risks.
   - **First step**: Audit current data holdings to categorize data types and assess current reten

## Phase 4: Deliverable
- /api/intake/task/t_mms5010qak7n/export?fmt=md
