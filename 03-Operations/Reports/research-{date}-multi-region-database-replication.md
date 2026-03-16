## Key Findings

### Active-Active vs Active-Passive
- **Active-Active**: All regions handle production traffic, suitable for strict data residency and global performance needs but complex to manage. Examples include OCI GoldenGate and DynamoDB Global Tables.
- **Active-Passive**: Primary region handles writes, secondary regions handle reads and act as failover targets. This setup is simpler and effective for latency reduction and disaster recovery, as seen in AWS RDS/Aurora cross-region read replicas.

### Conflict Resolution Techniques
- **DynamoDB Global Tables**: Use last-writer-wins or custom conflict resolvers.
- **OCI GoldenGate**: Employs bi-directional replicats with mapping rules for conflict resolution.

### Consistency Models
- Active-active systems often use eventual consistency due to the complexity of maintaining strong consistency across regions.
- Active-passive systems can maintain stronger consistency since writes are centralized.

### Latency Optimization Strategies
- Use DNS-based global load balancing to direct users to the nearest region.
- Implement read replicas in geographically strategic locations to reduce read latency.

### Disaster Recovery RPO/RTO Targets
- RPO (Recovery Point Objective): Aim for near-zero data loss by using continuous data replication.
- RTO (Recovery Time Objective): Minimize downtime by automating failover processes and ensuring secondary regions are always ready to be promoted.

## Detailed Analysis

### Active-Active vs Active-Passive
- **Active-Active**: Ideal for applications requiring high availability and low latency globally. However, it requires sophisticated conflict resolution and can be costly due to the need for full-scale infrastructure in multiple regions.
- **Active-Passive**: More cost-effective for applications with less stringent availability requirements. It simplifies consistency management but may incur higher latency for write operations.

### Conflict Resolution
- **Last-Writer-Wins**: Simple but may lead to data loss if not carefully managed.
- **Custom Resolvers**: Provide flexibility but require additional logic and testing to ensure correctness.

### Consistency Models
- **Eventual Consistency**: Suitable for applications where immediate consistency is not critical.
- **Strong Consistency**: Necessary for applications with strict data accuracy requirements but may increase latency.

### Latency Optimization
- **Global Load Balancing**: Reduces latency by directing traffic to the nearest available region.
- **Read Replicas**: Can significantly reduce read latency and improve user experience.

### Disaster Recovery
- **RPO/RTO**: Achieving low RPO and RTO requires investment in automation and infrastructure to ensure rapid recovery and minimal data loss.

## Recommendations

1. **Choose the Right Architecture**:
   - **What to Do**: Select active-active for global applications needing high availability and low latency. Opt for active-passive if cost and simplicity are priorities.
   - **Why**: Aligns infrastructure complexity and cost with business needs.
   - **Expected Outcome**: Improved performance and cost management.
   - **First Step**: Evaluate application requirements and business objectives to determine the suitable architecture.

2. **Implement Effective Conflict Resolution**:
   - **What to Do**: Use last-writer-wins for simplicity or develop custom resolvers for complex scenarios.
   - **Why**: Ensures data integrity and consistency across regions.
   - **Expected Outcome**: Reduced data conflicts and improved data accuracy.
   - **First Step**: Analyze data conflict scenarios and select appropriate resolution techniques.

3. **Optimize Latency**:
   - **What to Do**: Deploy DNS-based global load balancing and strategically place read replicas.
   - **Why**: Enhances user experience by reducing latency.
   - **Expected Outcome**: Faster response times and improved application performance.
   - **First Step**: Assess current latency metrics and identify regions for replica deployment.

4. **Set RPO/RTO Targets**:
   - **What to Do**: Establish near-zero RPO and minimal RTO through continuous replication and automated failover.
   - **Why**: Minimizes data loss and downtime during disasters.
   - **Expected Outcome**: Increased resilience and reliability of the database system.
   - **First Step**: Define RPO/RTO objectives and implement necessary infrastructure and processes.

## Sources
1. AWS RDS/Aurora documentation on cross-region read replicas.
2. Oracle Cloud Infrastructure (OCI) GoldenGate documentation.
3. DynamoDB Global Tables documentation.
4. Industry case studies and best practices on multi-region database architectures.