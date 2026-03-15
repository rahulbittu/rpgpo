# Subtask Output — Research GDPR and CCPA Compliance
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## GDPR Compliance Requirements for SaaS Applications

GDPR applies to any SaaS company processing personal data of EU/EEA residents, regardless of company location, requiring a lawful basis for all processing (e.g., contractual necessity, consent, legitimate interest).[1][2]

### Key Requirements
- **Data Processing Agreement (DPA):** SaaS providers acting as processors must sign DPAs with controllers, covering confidentiality, security measures, data subject request assistance, data deletion/return at contract end, and compliance proof. Use standard DPA templates proactively.[1]
- **Data Mapping and Privacy Policy:** Map all data processed; update privacy policy to list data types, purposes, sharing, and legal bases (six options under GDPR).[1][2]
- **Data Subject Rights:** Implement processes for access, export, correction, deletion (right to erasure propagates across systems); notify breaches within **72 hours** to authorities.[1][6]
- **Subprocessors and Transfers:** List subprocessors with their own DPAs; use Standard Contractual Clauses (SCCs) for EU/UK data transfers outside the region.[1][3]
- **B2B Specific:** Document lawful basis (consent/legitimate interest) for purchased data; conduct legitimate interest assessments; process opt-outs within **30 days**; maintain suppression lists.[3]

**Next Steps:** 
- Complete data map today (step 1 per Turley Law guide).[1]
- Draft DPA template and share with customers (saves negotiation time).[1]
- Review subprocessors list and add to customer-facing documentation.[1]

Source: https://turleylaw.com/blog/gdpr-for-saas-companies-practical-guide[1]; https://www.sparkdbi.com/blogs/gdpr-hipaa-can-spam-b2b-data-compliance-checklist-2026/[3]; https://atlan.com/know/data-privacy-governance-framework/[6]

## CCPA Compliance Requirements for SaaS Applications

CCPA (expanded by CPRA effective January 2023) applies to businesses collecting California residents' personal data, granting rights to access, delete, opt-out of sale/sharing; requires privacy notices explaining rights.[2][5]

### Key Requirements
- **Privacy Notice and Policy:** Publish accessible policy detailing data handling (accounts, billing, analytics), rights, and opt-out methods; required for transparency.[2]
- **Opt-Out Signals:** Honor Global Privacy Control (GPC) as valid opt-out for sale/sharing across devices, domains, accounts; link to logged-in profiles; synchronize with ad/analytics systems. Non-compliance risks fines (e.g., recent enforcement actions).[5]
- **Data Subject Rights:** Support deletion requests propagating across systems; manage preferences centrally with automated enforcement and identity resolution.[5][6]
- **Contractors vs. Service Providers:** CPRA distinguishes roles with stricter contractor rules; conduct risk assessments for sensitive data.[2]

**Next Steps:** 
- Implement GPC recognition in all browsers/apps within 30 days; test cross-device syncing.[5]
- Centralize preference management and monitor third-party data flows.[5]
- Update privacy policy for CPRA sensitive data categories.[2]

Source: https://termly.io/resources/articles/privacy-policy-for-a-saas-business/[2]; https://securiti.ai/largest-ccpa-fine-enforcement-lessons-businesses/[5]

## Combined SaaS Action Items (2026 Focus)
- **Cookie/Consent Tools:** Use privacy-first analytics without mandatory cookie banners; separate cookie policy for EU/UK under ePrivacy Directive/GDPR.[2][7]
- **Timeline Summary:** GDPR breach notice: **72 hours**; CCPA deletion/opt-out: immediate propagation; opt-outs: **30 days** suppression.[3][6]
- Audit subprocessors, integrate SSO/MFA for access (ties to GDPR security), and map to NIST/ISO controls if pursuing SOC 2.[1][4]

No fines quantified beyond €85,000 GDPR example (2026 B2B case).[3] For full audits, consult legal experts as requirements vary by data flow.
