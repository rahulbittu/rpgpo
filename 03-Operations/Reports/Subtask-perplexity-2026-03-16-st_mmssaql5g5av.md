# Subtask Output — Research Observability Tools
## Model: sonar
## Stage: research
## Date: 2026-03-16

# OpenTelemetry, Datadog, and Grafana Cloud for Node.js Observability

## Finding 1: OpenTelemetry as a Vendor-Neutral Standard

**OpenTelemetry (OTel)** is an **open-source, vendor-neutral standard** for collecting and exporting telemetry data—metrics, logs, and traces[2]. It's backed by the CNCF and supported by virtually every major observability platform including Grafana, Datadog, New Relic, and Honeycomb[2]. The key advantage: you instrument once and export anywhere using a single protocol (OTLP), eliminating the need to rewire your entire setup when switching providers[2].

For Node.js applications, this means you can use OpenTelemetry SDKs to instrument your code once, then send that data to any compatible backend—Datadog, Grafana Cloud, or open-source alternatives—without changing your instrumentation code.

Source: https://www.courier.com/blog/notification-observability-with-opentelemetry-and-courier-plus-grafana

---

## Finding 2: Datadog vs. Grafana Cloud Architecture

| Aspect | Datadog | Grafana Cloud |
|--------|---------|---------------|
| **Deployment Model** | SaaS (Cloud) only | Managed SaaS with open-source foundation |
| **Data Collection** | Single unified agent collects metrics, logs, traces | Requires separate backends (Prometheus, Loki, Tempo) |
| **Pricing** | Per-host, per-GB ingested/indexed—can become very expensive at scale | Usage-based pricing; free tier with 50GB logs/month |
| **Setup Complexity** | Low operational overhead; plug-and-play | Requires integration of multiple components |
| **Customization** | Less flexible dashboards | Extremely powerful and customizable dashboards |

**For Node.js applications:** Datadog offers a unified agent that automatically collects all telemetry, while Grafana Cloud requires you to integrate Prometheus (metrics), Loki (logs), and Tempo (traces) separately[1][3][9].

Source: https://signoz.io/blog/datadog-vs-grafana/

---

## Finding 3: Grafana Cloud's LGTM Stack for Node.js

Grafana Cloud uses the **LGTM stack** (Logs, Grafana, Traces, Metrics) as its core observability architecture[4]. For Node.js applications, this means:

- **Metrics**: Prometheus-compatible metrics collection
- **Logs**: Loki for log aggregation and search
- **Traces**: Tempo for distributed tracing
- **Visualization**: Grafana dashboards combining all three signals[4]

The platform is particularly popular in **cloud-native environments** and supports **OpenTelemetry natively**, making it straightforward to instrument Node.js microservices[4].

Source: https://signoz.io/blog/datadog-alternatives/

---

## Finding 4: OpenTelemetry Integration with Grafana Cloud

Setting up OpenTelemetry exports to Grafana Cloud is streamlined[2]:

1. Grab your Instance ID and OTLP endpoint from the Grafana Cloud portal
2. Generate a Cloud API token with `metrics:write` and `logs:write` scopes
3. Enter those as Basic auth credentials in your OpenTelemetry exporter

Grafana Cloud uses **Basic auth for OTLP**, allowing direct connections without additional collectors or proxy configurations[2]. Metrics land in Mimir, logs land in Loki, and you can query both from Grafana's Explore view within minutes[2].

Source: https://www.courier.com/blog/notification-observability-with-opentelemetry-and-courier-plus-grafana

---

## Finding 5: Cost Comparison and Migration Strategy

**Grafana Cloud pricing**: Free tier with **50GB logs/month**; paid plans follow usage-based pricing[9]. This is significantly cheaper than Datadog's per-GB ingestion model at scale[1].

**Migration approach for Node.js**: If switching from Datadog, use a **parallel run strategy**[5]:
- **Phase 1 (Week 1-2)**: Deploy your open-source or Grafana Cloud platform alongside Datadog
- Send the same telemetry to both using OpenTelemetry exporters
- OpenTelemetry makes this "trivially easy" by adding another exporter to your Node.js instrumentation[5]

This reduces risk and allows you to validate the new platform before fully migrating.

Source: https://oneuptime.com/blog/post/2026-02-28-datadog-bill-shock-open-source-observability-2026/view

---

## Finding 6: Datadog's Biggest Competitors

Datadog's primary competitors for observability include **SigNoz, New Relic, Dynatrace, and Grafana**[4]. For Node.js teams specifically:
- **SigNoz**: Best as a drop-in Datadog replacement with best-in-class OpenTelemetry support and flexible deployment options
- **Grafana Cloud**: Ideal for teams preferring open-source visualization and comfortable managing multiple components
- **New Relic/Dynatrace**: Better for comprehensive SaaS solutions with extensive features[4]

Source: https://signoz.io/blog/datadog-alternatives/
