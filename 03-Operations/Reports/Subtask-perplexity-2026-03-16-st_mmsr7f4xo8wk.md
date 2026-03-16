# Subtask Output — Research Node.js Database Resilience Strategies
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Retry Strategies
Use **node-retry** library for exponential backoff in database connections. Configure with `retries: 5`, `minTimeout: 4000ms`, and `randomize: true` to avoid server overload.[1]

**Example with pg library (PostgreSQL/Neon):**
```javascript
const retry = require('retry');
const { Client } = require('pg');

const operation = retry.operation({ retries: 5, minTimeout: 4000, randomize: true });
operation.attempt(async (currentAttempt) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    if (operation.retry(err)) {
      console.warn(`Attempt ${currentAttempt} failed, retrying...`);
    } else {
      console.error('Failed after retries:', err);
    }
  }
});
```
Set `connect_timeout=15` and `pool_timeout=15` in DATABASE_URL for Neon.[1]

## Circuit Breaker Patterns
No Node.js-specific database circuit breaker libraries in recent results (last 30 days). General retry anti-patterns apply: avoid immediate retries without backoff to prevent cascading failures; distinguish retryable errors (e.g., 408, 429, 500-504) from permanent ones (4xx except 408/429).[3]

## Connection Health Checks
**MariaDB Connector/Node.js** provides `connection.ping()` to validate connection without socket checks, and `connection.reset()` to reset state.[4]

**Example:**
```javascript
const mariadb = require('mariadb');
const conn = await mariadb.createConnection({ host: 'mydb.com', user: 'myUser', password: 'myPwd' });
await conn.ping(); // Health check
await conn.reset(); // Reset state
await conn.end();
```
Use connection pools via `mariadb.createPool()` for reuse; check `pool.activeConnections()` for count.[4]

## Failover Handling
No direct Node.js database failover examples in results. For pools, MariaDB supports graceful close with `pool.end()` and destroy with `connection.destroy()` for forced failover.[4]

**Neon recommendation:** Tune timeouts in connection string for latency-prone setups.[1]

## Recommended Libraries
| Library | Use Case | Key Features | Source |
|---------|----------|--------------|--------|
| **node-retry** | Retry with backoff | retries, minTimeout, randomize | [1] |
| **mariadb** | Connection/pool management | ping(), reset(), pools | [4] |
| **pg** | PostgreSQL connections | connect() with retries | [1] |

## Next Steps
1. Install `npm i retry pg` or `npm i mariadb`; test retry example on your DB.
2. Add `ping()` before queries in production loops.
3. Monitor with `activeConnections()`; scale pool size to 10-20 based on load.
4. Search "Node.js opossum circuit breaker database" for circuit breaker gaps (no results here).[3]
