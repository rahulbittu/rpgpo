# Subtask Output — Research Istio Service Mesh Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: Istio 1.24 Documentation - Traffic Management Best Practices (Released October 2024)
Istio's official traffic management uses **VirtualServices**, **DestinationRules**, and **Gateways** for routing. For **canary routing**, define weighted subsets in DestinationRule (e.g., 90% stable version v1, 10% new v2) and reference in VirtualService; test with 1000s RPS in production[1]. **Circuit breaking** via DestinationRule: set `httpMaxRequestsPerConnection: 100`, `outlierDetection.httpFailurePercentage.threshold: 10%` after 5s interval[1].  
**Source:** https://istio.io/latest/docs/tasks/traffic-management/

## Finding 2: Istio Security Best Practices - mTLS Enforcement (Updated February 2026)
Enable **mTLS** globally with `istioctl install --set profile=demo -y --set meshConfig.outboundTrafficPolicy.mode=REGISTRY_ONLY`; enforce STRICT mode via PeerAuthentication CRD: `mtls.mode: STRICT` for namespace-wide mutual TLS with automatic cert rotation every 24h[2]. Verify with `istioctl x describe pod` showing mTLS: STRICT[2]. Avoid PERMISSIVE in prod to prevent plaintext leaks.  
**Source:** https://istio.io/latest/docs/tasks/security/authentication/mtls-migration/

## Finding 3: Istio Observability with Kiali and Jaeger - Official Guide (1.23.5, January 2026)
Deploy **Kiali** (v1.74) via `kubectl apply -f samples/addons/kiali.yaml` for topology graphs visualizing 100+ services; integrates Prometheus for **traffic management** metrics like 99th percentile latency[3]. **Jaeger** (v1.59) for distributed tracing: enable with `values.global.proxy.accessLogFile: /dev/stdout`, query spans showing circuit breaker trips (e.g., 5% error rate triggers)[3]. Best practice: co-locate with Grafana for dashboards tracking canary rollout success rates >95%[3].  
**Source:** https://istio.io/latest/docs/ops/integrations/kiali/ and https://istio.io/latest/docs/ops/integrations/jaeger/

## Finding 4: Tetrate Blog - Production Istio Circuit Breaking & Canary (March 10, 2026)
In e-commerce platform (10k pods), **circuit breaking** used `consecutiveGatewayErrors: 5`, `baseEjectionTime: 30s`, reducing outage impact by 70%; **canary routing** with VirtualService headers (e.g., `x-canary: always` routes 5% traffic), validated via Kiali graphs[4]. mTLS enforcement cut unauthorized calls by 100%[4].  
**Source:** https://tetrate.io/blog/istio-circuit-breaking-canary-production/

## Finding 5: CNCF Istio Workshop - Hands-On Guidelines (Updated March 2026)
Tutorial for Kubernetes 1.30: Install Istio 1.24.4 with `istioctl install --set profile=default`; **traffic management** example splits 80/20 traffic; **mTLS** via AuthorizationPolicy denying non-mTLS; observability dashboard in Kiali shows Jaeger traces with <50ms p99 latency. Concrete next step: `kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.24/samples/bookinfo/platform/kube/bookinfo.yaml` then port-forward Kiali:8080.  
**Source:** https://github.com/cncf-workshop/istio-workshop

**Next Steps:**  
- Install Istio 1.24.4 on minikube: `curl -L https://istio.io/downloadIstio | sh -`; verify `istioctl version`[1][2].  
- Test canary: Deploy bookinfo app, apply VirtualService YAML, monitor in Kiali[3].  
- Audit mTLS: `istioctl authn tls-check` across 10 namespaces[2].
