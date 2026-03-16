# Write a comprehensive guide to implementing OpenTelemetry in a Node.js microserv

**Domain:** writing | **Date:** 2026-03-16 | **Subtasks:** 2



## Research OpenTelemetry and Jaeger Integration
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
- **Combine auto-instrumentation with manual spans**: Auto-instrumentation captures infrastructure-level data; cus

## Synthesize Guide on OpenTelemetry Implementation
# Comprehensive Guide to Implementing OpenTelemetry in Node.js Microservices

Implementing OpenTelemetry in a Node.js microservices architecture can significantly enhance observability by providing detailed insights into application performance and behavior. This guide covers auto-instrumentation, creating custom spans, and integrating with Jaeger for trace visualization.

## Auto-Instrumentation Setup

Auto-instrumentation in Node.js allows you to collect telemetry data without modifying your application code. This is achieved using the `@opentelemetry/auto-instrumentations-node` package, which supports popular frameworks and libraries like Express, Fastify, HTTP clients, and database drivers.

### Steps to Enable Auto-Instrumentation

1. **Install the Package**:
   Ensure you have the package installed in your project:
   ```bash
   npm install @opentelemetry/auto-instrumentations-node
   ```

2. **Configure Auto-Instrumentation**:
   Load the auto-instrumentation module before your application starts. This can be done via command line or environment variables.

   **Command Line**:
   ```bash
   node --require '@opentelemetry/auto-instrumentations-node/register' app.js
   ```

   **Environment Variable**:
   ```bash
   export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
   node app.js
   ```

3. **Set Configuration Options**:
   Configure the telemetry exporter and service details using environment variables:
   ```bash
   export OTEL_EXPORTER_OTLP_ENDPOINT="http://collector:4318"
   export OTEL_SERVICE_NAME="my-api"
   export OTEL_RESOURCE_ATTRIBUTES="service.namespace=my-namespace"
   export OTEL_NODE_RESOURCE_DETECTORS="env,host,os,serviceinstance"
   ```

### Expected Outcome
By enabling auto-instrumentation, you can automatically capture telemetry data from supported libraries, providing a baseline of observability with minimal setup.

## Creating Custom Spans for Business Logic

While auto-instrumentation captures standard telemetry, custom spans are necessary to gain insights into specific business logic and application-specific operations.

### Steps to Create Custom Spans

1. **Initialize OpenTelemetry SDK**:
   Create an instrumentation file to initialize the OpenTelemetry SDK before your application code executes.

   ```javascript
   const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
   const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
   const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

   const provider = new NodeTracerProvider();
   const exporter = new OTLPTraceExporter({ url: 'http://collector:4318/v1/traces' });
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
   provider.register();
   ```

2. **Create Custom Spans**:
   Use the tracer to create spans around critical business logic, database queries, or external API calls.

   ```javascript
   const tracer = provider.getTracer('my-service');

   function myBusinessFunction() {
     const span = tracer.startSpan('myBusinessFunction');
     try {
       // Business logic here
     } catch (error) {
       span.recordException(error);
     } finally {
       span.end();
     }
   }
   ```

### Expected Outcome
Custom spans provide detailed insights into specific parts of your application, helping to identify performance bottlenecks and optimize business logic.

## Integrating with Jaeger

Jaeger is a popular tool for tracing and visualizing distributed systems. Integrating OpenTelemetry with Jaeger allows you to visualize traces collected from your Node.js microservices.

### Steps to Integrate with Jaeger

1. **Set Up Jaeger**:
   Deploy Jaeger in your environment. You can use Docker for a quick setup:

   ```bash
   docker run -d --name jaeger \
     -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
     -p 5775:5775/udp \
     -p 6831:6831/udp \
     -p 6832:6832/udp \
     -p 5778:5778 \
     -p 16686:16686 \
     -p 14268:14268 \
     -p 14250:14250 \
     -p 9411:9411 \
     jaegertracing/all-in-one:1.22
   ```

2. **Configure OpenTelemetry Exporter**:
   Ensure your OpenTelemetry setup exports traces to Jaeger. Modify the exporter configuration in your SDK initialization:

   ```javascript
   const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

   const exporter = new JaegerExporter({
     serviceName: 'my-service',
     endpoint: 'http://localhost:14268/api/traces',
   });
   ```

### Expected Outcome
Integrating with Jaeger allows you to visualize and analyze traces, providing a comprehensive view of your microservices architecture and helping to identify and resolve issues efficiently.

## Conclusion

By following this guide, you can effectively implement OpenTelemetry in your Node.js microservices architecture, leveraging auto-instrumentation for baseline observability, custom spans for detailed insights, and Jaeger for trace visualization. This setup enhances your ability to monitor, debug, and opt