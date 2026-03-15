# Subtask Output — Research GraphQL Subscriptions
## Model: sonar
## Stage: research
## Date: 2026-03-15

## WebSocket Transport for GraphQL Subscriptions

GraphQL subscriptions primarily use **WebSocket** for bidirectional, real-time communication, supporting protocols like **graphql-ws** (recommended) and the legacy **subscriptions-transport-ws**. Hot Chocolate v13 enables this by adding `app.UseWebSockets()` middleware and mapping GraphQL endpoints; it supports full-duplex persistent connections widely used in browsers.[1] Booster Framework separates transports: HTTP POST to `graphqlURL` for queries/mutations, WebSocket to `websocketURL` for subscriptions following the "GraphQL over WebSocket" protocol.[2] GraphQL Kotlin with Spring provides default WebSocket support via `graphql-kotlin-spring-server`, using reactive Publishers like Kotlin Flow.[3] Python's GQL library uses `WebsocketsTransport` for subscriptions (also queries/mutations), auto-detecting graphql-ws or Apollo protocols; requires `fetch_schema_from_transport=True`.[5]

**Security Note**: CVE-2026-30241 (CVSS 2.7, published 2026-03-06) in Mercurius GraphQL for Fastify bypasses query depth limits via WebSocket subscriptions, enabling DoS; validate depths on subscription events.[6]

**Next Steps**:
- Test with `wscat` on `websocketURL`: connect, send `{"type":"connection_init"}`, then subscription JSON per protocol.[2]
- Integrate: For Node.js/Next.js, use GraphQL Yoga API routes with WebSocket middleware.[9]

Source: [1] https://chillicream.com/docs/hotchocolate/v13/defining-a-schema/subscriptions/  
Source: [2] https://docs.boosterframework.com/graphql/  
Source: [3] https://expediagroup.github.io/graphql-kotlin/docs/schema-generator/execution/subscriptions  
Source: [5] https://gql.readthedocs.io/_/downloads/en/latest/pdf/  
Source: [6] https://dev.to/cverports/cve-2026-30241-cve-2026-30241-missing-query-depth-validation-in-mercurius-graphql-subscriptions-4bia  
Source: [9] https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-nextjs

## PubSub Patterns

PubSub decouples event publishing from subscription handling; Hot Chocolate registers providers like in-memory or Redis for event broadcasting after WebSocket middleware.[1] Azure Web PubSub acts as centralized PubSub: clients connect via WebSocket to PubSub (not servers), Node.js servers publish events; supports horizontal scaling without sticky sessions. Setup: `az webapp config appsettings set --settings AZURE_WEBPUBSUB_CONNECTION_STRING="<string>"` and enable WebSockets via `az webapp config set --web-sockets-enabled true` (2026-02-16 guide).[4]

**Next Steps**:
- Deploy Azure: Create hub/group, grant `WebPubSub Service Role`, publish via SDK e.g., `serviceClient.sendToAll("update", data)`.
- Local: Use Hot Chocolate's `AddInMemorySubscriptions()` for dev.

Source: [1] https://chillicream.com/docs/hotchocolate/v13/defining-a-schema/subscriptions/  
Source: [4] https://oneuptime.com/blog/post/2026-02-16-how-to-build-a-graphql-subscription-api-with-azure-web-pubsub-and-nodejs/view

## Scaling Considerations

Single-server WebSockets fail on horizontal scale due to connection state; use managed PubSub like **Azure Web PubSub** to offload connections—servers publish only, PubSub routes to clients across instances.[4] Protocols like graphql-ws (post-v5.6.1) ensure backward compatibility for multi-instance deploys.[5] graphql.org notes transport agnosticism: WebSockets for subscriptions scale via external brokers (e.g., Redis PubSub).[7]

**Key Data**:
- Azure: Handles unlimited connections, auto-scales; no shared state needed.[4]
- Avoid legacy `subscriptions-transport-ws`; prefer graphql-ws/graphql-sse.[1]

**Next Steps**:
- Benchmark: Scale Node.js to 2+ instances, measure latency with 1k subscribers (PubSub <50ms reported in Azure guides).[4]
- Monitor: Add depth limits (fix CVE patterns), use Redis for 10k+ users.

Source: [1] https://chillicream.com/docs/hotchocolate/v13/defining-a-schema/subscriptions/  
Source: [4] https://oneuptime.com/blog/post/2026-02-16-how-to-build-a-graphql-subscription-api-with-azure-web-pubsub-and-nodejs/view  
Source: [5] https://gql.readthedocs.io/_/downloads/en/latest/pdf/  
Source: [7] https://graphql.org/faq/general/
