# Subtask Output — Research Event Sourcing and CQRS Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Event Sourcing and CQRS in Financial Services: Current Practices and Trends

## Finding 1: Enterprise Implementation at Colliers — Real-Time CRM-to-ERP Integration

**Specific Application:** Colliers, a major commercial real estate services firm, implemented a **three-microservice CQRS architecture** to integrate 19 regional CRM systems (Salesforce, Microsoft Dynamics 365, and Integis) with a single **SAP S/4HANA Cloud** ERP instance across EMEA as part of its **Fina+ finance transformation programme**[1].

**Key Technical Details:**
- Architecture: Three stateless microservices deployed on **Azure Kubernetes Service (AKS)** using the **CQRS pattern**[1]
- Message broker: **Apache Kafka** for event streaming with bidirectional data flow[1]
- Data validation: Integrated external providers (VAT registries, company data brokers, address validation APIs) to enrich client data before ERP commitment[1]
- Salesforce integration: Used **Platform Events connectors** (not CDC connectors) to allow CRM teams to define custom event objects and configure 30+ business event triggers (opportunity win, client creation, invoice finalization)[1]

**Why This Matters for Financial Services:** This demonstrates CQRS adoption in complex, multi-geography financial operations where read/write workloads differ significantly and audit trails are critical[1].

Source: https://oso.sh/case-studies/how-oso-helped-colliers-design-a-real-time-event-driven-crm-to-erp-integration-architecture-across-emea/

---

## Finding 2: CQRS and Event Sourcing Adoption Phase

**Market Position:** According to **InfoQ**, Event Sourcing has reached the **late majority adoption phase**, indicating widespread enterprise acceptance beyond early adopters[4].

**When to Apply CQRS in Financial Systems:**
- Systems with significantly different read and write workloads (reads >> writes)[2]
- Complex domain and business logic requiring multiple data views[2]
- Audit-heavy domains such as financial systems[2]

**Critical Relationship:** You can use CQRS without Event Sourcing, but Event Sourcing *requires* CQRS[3].

Source: https://event-driven.io/pl

---

## Finding 3: Event Sourcing Benefits and Tradeoffs for Finance

**Core Benefit for Financial Services:** Event Sourcing records every change as immutable events, enabling complete audit trails and the ability to rebuild system state at any point in time — essential for regulatory compliance and financial reconciliation[2].

**Specific Advantages:**
- Complete history of all changes with timestamps[2]
- Ability to rebuild state at any historical point (critical for financial audits)[2]
- Multiple views built from the same event stream[2]

**Implementation Tradeoffs:**
- Event storage grows unbounded without snapshots[2]
- Schema evolution becomes complex as event formats change over time[2]
- Requires immutable event design; fixing mistakes requires corrective events rather than updates[2]

Source: https://newsletter.systemdesign.one/p/system-design-fundamentals

---

## Finding 4: Microservices Communication Patterns

**Alternative to Kafka:** **Redis Streams** is positioned as a viable alternative for event-driven microservices communication, offering consumer groups, message persistence, and scalability comparable to Kafka[5].

**Real Example Flow:** Order-to-payment workflow where the orders service produces to `ORDERS_STREAM`, the payments service consumes and produces to `PAYMENTS_STREAM`, and the orders service consumes payment confirmations for status updates[5].

Source: https://redis.io/tutorials/howtos/solutions/microservices/interservice-communication/

---

## Key Takeaway for Your Context

The Colliers case study shows **CQRS + event-driven architecture is production-ready for complex financial transformations** involving multiple regional systems, real-time data synchronization, and strict audit requirements. The pattern is particularly valuable when integrating legacy CRM systems with modern cloud ERP platforms while maintaining data quality through external validation.
