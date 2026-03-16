# Subtask Output — Research Database Connection Management in Node.js
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Pool Configuration

Node.js database connection pooling is commonly implemented using libraries like `pg` for PostgreSQL or Knex.js for multiple databases. Key configs include `max` (maximum connections), `idleTimeoutMillis` (idle connection timeout), and `connectionTimeoutMillis` (acquisition timeout).

- **pg Pool example** (PostgreSQL): Sets `max: 20`, `idleTimeoutMillis: 30000` (30s), `connectionTimeoutMillis: 2000` (2s).[1][2]
  ```
  const { Pool } = require('pg');
  const pool = new Pool({
    user: 'dbuser',
    host: 'database.server.com',
    database: 'mydb',
    password: 'password',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  ```
  Source: https://www.tencentcloud.com/techpedia/141973[1]; https://node-postgres.com/features/pooling[2]

- **Knex.js Pool example** (MySQL): Defaults to `min: 2, max: 10`; customizable via `pool: { min: 0, max: 7 }`. For PostgreSQL, adds `maxConnectionLifetimeMillis: 5 * 60_000` (5 min) with jitter.[3]
  ```
  const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'your_database_user',
      password: 'your_database_password',
      database: 'myapp_test',
    },
    pool: { min: 0, max: 7 },
  });
  ```
  Source: https://knexjs.org/guide/[3]

## Error Handling

Handle pool errors by listening to the `'error'` event, which fires for idle client issues like network partitions. Log and exit process if unrecoverable.

- **pg Pool error listener**: Emits on idle client errors; example exits with `process.exit(-1)`. Use `pool.connect()` then `client.release()` for safe queries.[2]
  ```
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  const client = await pool.connect();
  const res = await client.query('SELECT * FROM users WHERE id = $1', [1]);
  client.release();
  ```
  Source: https://node-postgres.com/features/pooling[2]

- **Knex.js validation**: Use `pool.validate` to check connections, e.g., evict read-only ones post-failover via `SELECT @@global.read_only`.[3]
  Source: https://knexjs.org/guide/[3]

## Health Checks

Validate connections before use with callbacks like Knex's `afterCreate` or `pool.validate`. No direct pg health check example found; infer from validation queries.

- **Knex.js afterCreate**: Runs on new connections; call `done(err, connection)` to accept/discard.[3]
- **Knex.js validate example** (MySQL2): Queries server read-only status.[3]
  ```
  pool: {
    validate: async (conn) => {
      const [row] = await conn.query('SELECT @@global.read_only as read_only');
      return row.read_only === 0;
    },
  }
  ```
  Source: https://knexjs.org/guide/[3]

## Graceful Shutdown

Call `pool.end()` to drain active queries, return clients, then close timers/connections. Ensures no leaks during app termination.

- **pg Pool shutdown**: Awaits all queries; example shows async/callback queries completing before drain.[2]
  ```
  await pool.end(); // Waits for checked-out clients
  console.log('pool has drained');
  ```
  Source: https://node-postgres.com/features/pooling[2]

**Next Steps**:
- Install `pg`: `npm i pg`; test pool config with 5-20 max connections based on DB limits (e.g., PostgreSQL default 100).[2]
- For production, monitor with `pool.totalCount` and `pool.idleCount`; scale max to CPU cores * 2.
- Migrate to Knex for multi-DB: `npm i knex pg`, configure as above.[3]
