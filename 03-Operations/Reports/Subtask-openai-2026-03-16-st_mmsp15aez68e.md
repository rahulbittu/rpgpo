# Subtask Output — Synthesize Guide on OpenTelemetry Implementation
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

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

By following this guide, you can effectively implement OpenTelemetry in your Node.js microservices architecture, leveraging auto-instrumentation for baseline observability, custom spans for detailed insights, and Jaeger for trace visualization. This setup enhances your ability to monitor, debug, and optimize your applications.

**Word Count: 717**
