# Subtask Output — Identify API Bottlenecks
## Model: gpt-4o
## Stage: audit
## Date: 2026-03-13

To identify performance bottlenecks in TopRanker's API, follow these steps based on the gathered metrics and any known issues:

1. **Analyze Response Times:**
   - Examine the average and 95th percentile response times for each API endpoint. Identify endpoints with significantly higher response times.
   - Check for any patterns or spikes in response times during specific periods or under certain conditions.

2. **Review Throughput Metrics:**
   - Assess the requests per second (RPS) for each endpoint. Determine if high RPS correlates with increased response times, indicating potential capacity issues.

3. **Investigate Error Rates:**
   - Look at the error rate metrics for each endpoint. A high error rate might indicate underlying issues affecting performance, such as timeouts or server errors.

4. **Examine Resource Utilization:**
   - Review CPU, memory, and disk I/O usage on the servers hosting the API. High utilization may suggest resource constraints that could be causing slowdowns.

5. **Database Performance:**
   - Check database query performance metrics, such as query execution time and frequency. Identify slow or frequently executed queries that may be bottlenecks.
   - Look for locking or contention issues in the database that could be affecting API performance.

6. **Network Latency:**
   - Measure network latency between the client and server. High latency could be contributing to slower response times.

7. **Concurrency and Threading Issues:**
   - Investigate thread pool usage and concurrency settings. Insufficient threads or improper configuration can lead to delays in processing requests.

8. **Caching Effectiveness:**
   - Evaluate the caching strategy and hit/miss ratios. Poor cache performance can lead to increased load on the backend systems.

9. **Known Issues:**
   - Review any documented known issues or recent changes in the system that might be affecting performance. This includes recent deployments, configuration changes, or reported bugs.

10. **Logs and Traces:**
    - Analyze application logs and distributed traces for any anomalies or patterns that could indicate bottlenecks, such as long-running operations or frequent retries.

After identifying potential bottlenecks, prioritize them based on their impact on performance and user experience. Address these issues through optimization, scaling, or refactoring as necessary.
