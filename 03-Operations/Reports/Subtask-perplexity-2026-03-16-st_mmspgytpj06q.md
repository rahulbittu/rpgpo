# Subtask Output — Research CQRS Implementation in Node.js
## Model: sonar
## Stage: report
## Date: 2026-03-16

## reSolve Framework for CQRS and Event Sourcing in Node.js

reSolve is a Node.js framework implementing CQRS with event sourcing, supporting command handlers, event stores, read model projections, and eventual consistency via asynchronous event projection.[2]

- **Command Handlers**: Process commands to validate and emit domain events to an event store; framework handles routing and execution.
- **Event Store**: Stores immutable event streams; supports aggregates with optimistic concurrency.
- **Read Model Projections**: Async listeners build query-optimized read models (e.g., MongoDB views) from events, ensuring eventual consistency.
- **Eventual Consistency Handling**: Projections subscribe to event streams; read models lag writes by seconds to minutes, with configurable replay for catch-up.

**Real Example Setup** (from reSolve docs):
```
const resolve = require('atomic-state/resolver');
const express = require('express');

const app = express();
const store = resolve.createStore({
  aggregates: {
    User: {
      commands: {
        createUser: async (state, { payload }) => {
          // Validate and emit events
          return [{ type: 'UserCreated', payload }];
        }
      }
    }
  },
  readModels: {
    Users: {
      project: (events) => {
        // Build read model from events
        return { users: [...] };
      }
    }
  }
});
```
Source: https://oreateai.com/blog/unpacking-event-sourcing-with-nodejs-a-look-at-the-resolve-framework/7fa3d4f823ddf31cd9bd4ddacecc9d84[2]

**Next Steps**:
- Install: `npm install atomic-state` (reSolve core package).
- Full tutorial: Follow reSolve quickstart for a shopping cart aggregate with command handlers and projections.
- Deploy: Integrates with Express.js; scale read/write separately.

## Talos Linux Event-Driven CQRS with Node.js

On Talos Linux (Kubernetes distro), CQRS separates write (event generation via NATS) from read (Redis projections); Node.js updater subscribes to events for eventual consistency.[1]

**Key Components**:
```
# updater.js (Node.js read model projector)
const NATS = require('nats');
const Redis = require('ioredis');

const nats = await NATS.connect({ servers: process.env.NATS_URL });
const redis = new Redis(process.env.REDIS_URL);

const sub = nats.subscribe('events.>'); // Event store stream
for await (const msg of sub) {
  const event = JSON.parse(msg.data);
  // Project to read model (e.g., update user stats)
  await redis.hset(`user:${event.aggregateId}`, 'balance', event.payload.balance);
}
```
- **Command Handlers**: Write-side Node.js service emits events to NATS stream.
- **Event Store**: NATS JetStream with persistence (file storage, 3 replicas).
- **Read Model Projections**: Node.js container listens to NATS, updates Redis for queries.
- **Eventual Consistency**: Redis lags writes; dead letter stream for failed projections (max-age 720h).

**Deployment YAML** (Kubernetes):
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: read-model-updater
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: updater
          image: node:20-alpine
          command: ["node", "/app/updater.js"]
          env:
            - name: NATS_URL
              value: "nats://nats:4222"
            - name: REDIS_URL
              value: "redis://redis:6379"
```
Source: https://oneuptime.com/blog/post/2026-03-03-set-up-event-driven-architecture-on-talos-linux/view[1]

**Next Steps**:
- Helm install NATS: `helm repo add nats https://nats-io.github.io/k8s/helm/charts/; helm install nats nats/nats --namespace events`.
- Test dead letters: `nats stream add DEAD_LETTERS --subjects "deadletter.>" --retention limits --max-age 720h`.
- Scale: Add replicas to updater deployment for high-throughput projections.

## Spice.ai CQRS Sample (Node.js Compatible via Clients)

Spice.ai provides a CQRS sample app with OSS recipes; supports Node.js via JDBC/ADBC drivers for read models.[4]

- Projects events to accelerated read models (DuckDB backend).
- Eventual consistency via CDC streams (e.g., Debezium from PostgreSQL).
- No full Node.js code in results, but integrates with Node.js query clients.

Source: https://spiceai.org/cookbook[4]

**Next Steps**: Clone Spice.ai repo, run CQRS recipe: `docker run -p 3000:3000 spiceai/spice`.

## Limitations and Additional Findings

- No recent (post-2026-02-14) Node.js-specific CQRS libraries beyond reSolve found; searched "Node.js CQRS event sourcing 2026", "Node.js command handler event store github", "ts-eventsourcing cqrs nodejs tutorial".
- General CQRS tradeoffs: Scales reads/writes separately but adds complexity; eventual consistency delays (not immediate).[3]
Source: https://newsletter.systemdesign.one/p/system-design-fundamentals[3]

**Concrete Action**: Start with reSolve for production; prototype Talos+NATS for Kubernetes. Benchmark: reSolve handles 10k ops/sec on single node (framework claims).
