# Subtask Output — Research Chaos Engineering
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Core Principles of Chaos Engineering
Chaos engineering uses controlled failure injection to test system resilience, following these key principles from established sources:
- **Define steady state**: Establish baselines like throughput, error rates, or latency (e.g., checkout latency or transactions per second) before experiments.[1][2]
- **Form a hypothesis**: Predict system behavior under failure, such as "When payment service returns 503 errors, checkout shows user-friendly message."[2][3]
- **Minimize blast radius**: Limit impact to small scopes like one service, route, or user to reduce risk.[1][2][3]
- **Run in production-like environments**: Test in real conditions for accurate insights, starting small.[1][2][3]
- **Automate experiments**: Integrate into CI/CD pipelines for regular execution.[1][2]
- **Document and repeat**: Record results (hypothesis, actual behavior, findings, action items) and iterate for continuous learning.[2][3]

These principles originate from principlesofchaos.org and were formalized by Netflix.[2]

## Tools: Chaos Monkey, Litmus, and Gremlin
- **Chaos Monkey**: Netflix's pioneering tool (launched ~2011) that randomly terminates virtual machine instances in production to test resilience; core to modern SRE practices.[4]
- **LitmusChaos**: Kubernetes-native platform with V3.26.0 released by Feb 18, 2026; supports backend/frontend setup for chaos infrastructure targeting pods/networks/storage via APIs; includes Chaos Center development guide and community discussions on issues like stale GitHub tickets.[2][5]
- **Gremlin**: Not directly detailed in recent results; supplements from knowledge indicate it's a commercial fault injection platform for simulating attacks like resource exhaustion (no live 2026 data found in results).

Source for Chaos Monkey: https://www.sherlocks.ai/blog/traditional-sre-vs-modern-sre-what-every-engineering-leader-needs-to-know-in-2026[4]  
Source for Litmus: https://www.youtube.com/watch?v=uA1nFGcfTjM (Feb 18, 2026 community meeting)[5]; https://amquesteducation.com/blog/chaos-engineering/[2]

## Experiment Design
Design experiments scientifically:
- **Hypothesis first**: E.g., "System degrades gracefully with three services failing simultaneously."[3]
- **Fault types**: Inject network latency, pod kills, I/O faults, HTTP errors (e.g., 503), or region outages via tools like Istio service mesh.[1][3][6]
- **Steps**: Measure baselines, run short experiments (e.g., target specific routes), monitor metrics, rollback if thresholds breached (e.g., auto circuit breaker on high error rates).[3][6]
- **Multi-service example**: Simulate payment service failure and verify fallback behaviors.[3]
- **Recording**: Log hypothesis vs. actual, bugs found, fixes, retest date.[3]

Source for Istio example: https://oneuptime.com/blog/post/2026-02-24-how-to-use-fault-injection-for-chaos-engineering-in-istio/view (Feb 24, 2026)[3]  
Source for step-by-step: https://www.youtube.com/shorts/Gnzf83zDZHM (2026 guide)[6]

## Safe Production Practices
- **Start small**: Target isolated clusters/microservices to shield users; use short run times.[2]
- **Rollback ready**: Instant stop via monitoring (e.g., auto-remove if error rates exceed threshold).[3]
- **Production focus**: Mirrors real traffic/scale; staging insufficient.[3]
- **AI enhancements**: Modern tools use AI for anomaly detection and learning from incidents.[1]
- **SRE integration**: Map incident handoffs, invite stakeholders to postmortems for alignment.[4]

No Gremlin-specific 2026 production data found; Chaos Monkey runs safely at Netflix scale.[4]

**Next Steps**:
- Install LitmusChaos V3.26.0 on Kubernetes: Follow setup guide at litmuschaos.io (check post-Feb 2026 updates).
- Run first experiment: Hypothesis on pod failure, target 1% traffic, monitor via Prometheus; document in 1-week postmortem.
- Train: Review principlesofchaos.org; join Litmus community calls (next post-Feb 18, 2026). 

Source for next steps derived from: https://amquesteducation.com/blog/chaos-engineering/[2]; https://www.youtube.com/watch?v=uA1nFGcfTjM[5]
