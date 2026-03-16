# Subtask Output — Research Existing Distributed Job Schedulers
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Bull Queue: Redis-Based Job Scheduler for Node.js

**Bull** is the primary Redis-based distributed job queue library for Node.js, offering rock-solid stability, atomicity, and features like concurrency control via clustering.[1] It supports job prioritization through options like `priority` in job adds (higher numbers first), retry policies via `attempts` and `backoff` strategies (e.g., exponential), and repeated jobs with cron specs.[1]

### Key Features with Examples
- **Concurrency Control**: Process up to N jobs per processor; scales with Node.js clustering (e.g., 8 workers handling 500 jobs).[1]
  ```
  const Queue = require('bull');
  const cluster = require('cluster');
  const numWorkers = 8;
  const queue = new Queue('test concurrent queue');

  if (cluster.isMaster) {
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    // Add 500 jobs
    for (let i = 0; i < 500; i++) {
      queue.add({ foo: 'bar' });
    }
  } else {
    queue.process(function (job, jobDone) {
      console.log('Job done by worker', cluster.worker.id, job.id);
      jobDone();
    });
  }
  ```
  Source: https://nodejs.libhunt.com/bull-alternatives[1]

- **Retry Policies and Repeated Jobs**: Set retries with `job.opts.attempts` and backoff; repeat via cron (e.g., daily at 3:15 AM).[1]
  ```
  paymentsQueue.process(function (job) { /* Check payments */ });
  paymentsQueue.add(paymentsData, { repeat: { cron: '15 3 * * *' } });
  ```
  Source: https://nodejs.libhunt.com/bull-alternatives[1]

- **Processor Concurrency**: `queue.process(5, '/path/to/processor.js')` for 5 concurrent instances per named processor.[1]

## Limitations in Search Results
No direct details found on **dead letter handling**, **job prioritization syntax**, or **monitoring dashboards** (e.g., Bull Board exists but not in results). Bull typically uses Redis lists/sets for dead-letter via failed job queues and supports priority queues via sorted sets, but specifics require Bull docs (not surfaced here).[1]

**Alternatives Noted**:
- **bunqueue**: High-throughput (286K ops/sec) SQLite-based queue for Bun/Node.js, avoids Redis; lacks distributed Redis focus.[3] Source: https://github.com/egeominotti/bunqueue[3]
- Redis rate limiting tutorials cover concurrency via algorithms (e.g., sliding window log with ZSETs for timestamps), adaptable to queues but not Node.js schedulers.[2] Source: https://redis.io/tutorials/howtos/ratelimiting/[2]

## Best Practices from Results
- Use promises over callbacks for processors; cluster for horizontal scaling.[1]
- Verify cron with tools like cron expression generator.[1]
- For distributed locks (related to concurrency), compare Redis with optimistic/pessimistic in Node.js backends.[4] Source: https://courses.algocamp.io/learn/Lambda5[4]

## Next Steps
1. Install Bull: `npm i bull`, test clustering example above on localhost Redis.
2. Explore BullMQ (Bull successor) for advanced retries/dead-letter: Search "BullMQ Node.js Redis features 2026".
3. Deploy monitoring: Integrate Bull Board dashboard (npm i bull-board) for real-time queues/metrics.
4. Benchmark: Run 500-job cluster test; scale to production Redis cluster for >10K jobs/day.

Source for Bull core: https://nodejs.libhunt.com/bull-alternatives[1]
