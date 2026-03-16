# Subtask Output — Research OpenTelemetry and Jaeger Integration
## Model: sonar
## Stage: report
## Date: 2026-03-16

# OpenTelemetry Implementation in Node.js Microservices

## Auto-Instrumentation Setup

**Auto-instrumentation** provides zero-code observability by automatically capturing telemetry from popular Node.js libraries and frameworks without modifying application code[1]. The simplest approach uses the `@opentelemetry/auto-instrumentations-node` package, which instruments Express, Fastify, HTTP clients, and database drivers automatically[1][2].

To enable auto-instrumentation, load the module before your application starts:

```bash
node --require '@opentelemetry/auto-instrumentations-node/register' app.js
```

Alternatively, set it via environment variable:

```bash
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

The module is highly configurable through environment variables[1]:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="http://collector:4318"
export OTEL_SERVICE_NAME="my-api"
export OTEL_RESOURCE_ATTRIBUTES="service.namespace=my-namespace"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os,serviceinstance"
node --require '@opentelemetry/auto-instrumentations-node/register' app.js
```

## Custom Spans for Business Logic

**Auto-instrumentation alone lacks business-level context**[4]. You must implement manual spans to capture domain-specific logic, database queries, and external API calls that reveal performance bottlenecks[4].

Create an instrumentation file that initializes the SDK before application code loads[2]:

```javascript
// src/instrumentation.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-microservice',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'production',
  }),
);

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown());
```

Load this before your application:

```bash
node --require ./src/instrumentation.js src/index.js
```

Add custom spans in your application code:

```javascript
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('my-service');

app.get('/api/users/:id', async (req, res) => {
  const span = tracer.startSpan('fetch-user-from-db');
  
  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    span.setAttributes({
      'db.operation': 'SELECT',
      'db.rows_returned': user.length,
    });
    res.json(user);
  } finally {
    span.end();
  }
});
```

## Fastify-Specific Integration

For Fastify applications, use the dedicated `@fastify/otel` instrumentation plugin[3], which automatically wraps request handlers and instruments all route hooks (onRequest, preParsing, preValidation, preHandler, preSerialization, onSend, onResponse, onError)[3]:

```javascript
import { NodeSDK } from '@opentelemetry/sdk-node';
import FastifyOtelInstrumentation from '@fastify/otel';

const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  instrumentations: [
    new FastifyOtelInstrumentation({ registerOnInitialization: true })
  ],
});

sdk.start();

const app = fastify();
// Routes are automatically instrumented
app.get('/', (req, reply) => 'hello world');
```

## Collector Architecture for Jaeger Integration

**Decouple your microservices from the final storage backend** using the OpenTelemetry Collector[4]. This architecture enables batching, transformation, and routing telemetry data to multiple destinations (Prometheus, Jaeger, cloud APM tools) without overloading your application[4].

Configure your Node.js application to export to the Collector:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4318"
export OTEL_SERVICE_NAME="order-service"
node --require ./src/instrumentation.js src/index.js
```

The Collector then routes traces to Jaeger for distributed trace visualization. This setup is essential for microservices architectures where multiple services generate traces that need correlation and analysis[4].

## Key Best Practices

- **Load instrumentation first**: The instrumentation file must execute before any application code to properly patch libraries[2]
- **Use environment variables for configuration**: Avoid hardcoding endpoints and service names; use `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, and `OTEL_RESOURCE_ATTRIBUTES`[1]
- **Combine auto-instrumentation with manual spans**: Auto-instrumentation captures infrastructure-level data; custom spans add business-level observability[4]
- **Implement resource detectors**: Use `OTEL_NODE_RESOURCE_DETECTORS` to automatically detect environment, host, OS, and service instance information[1]

## Resources

- NPM Package: `@opentelemetry/auto-instrumentations-node`[1]
- Source: https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node
- Setup Guide: https://oneuptime.com/blog/post/2026-02-20-nodejs-opentelemetry-setup/view
- Fastify Plugin: https://github.com/fastify/otel
- Official JavaScript Docs: https://opentelemetry.io/docs/languages/js/
