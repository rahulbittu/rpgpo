# Explain how GraphQL subscriptions work under the hood. Cover WebSocket transport

**Domain:** learning | **Date:** 2026-03-15 | **Subtasks:** 2



## Research GraphQL Subscriptions
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

## Compile Report on GraphQL Subscriptions
## Key Findings

1. **WebSocket Transport**: GraphQL subscriptions utilize WebSocket for real-time communication, enabling persistent, bidirectional connections. Recommended protocols include `graphql-ws`, with legacy support for `subscriptions-transport-ws`.

2. **PubSub Patterns**: Implementing a PubSub pattern is essential for handling subscription events. This involves using a publisher to emit events and subscribers to listen for these events, typically managed through a message broker like Redis or Kafka for scalability.

3. **Scaling Considerations**: Scaling GraphQL subscriptions requires careful management of WebSocket connections and event distribution. Techniques include connection pooling, load balancing WebSocket servers, and using distributed systems for event handling.

4. **Node.js Implementation**: In Node.js, libraries like GraphQL Yoga and Apollo Server facilitate setting up WebSocket connections for subscriptions. Middleware such as `graphql-ws` can be integrated to manage connections and events.

5. **Security Concerns**: Attention to security is critical, as vulnerabilities like CVE-2026-30241 can exploit WebSocket subscriptions. Implementing depth validation and other security measures is necessary to prevent DoS attacks.

## Detailed Analysis

### WebSocket Transport
- **GraphQL over WebSocket**: This protocol supports full-duplex communication, allowing clients to receive real-time updates. Implementing this requires setting up WebSocket middleware in your server, such as `app.UseWebSockets()` in Hot Chocolate or `graphql-kotlin-spring-server` in Kotlin environments.
- **Testing**: Tools like `wscat` can be used to test WebSocket connections by sending initialization messages and subscription queries.

### PubSub Patterns
- **Event Management**: A PubSub system is crucial for managing subscription events. This can be implemented using in-memory solutions for small-scale applications or distributed systems like Redis for larger applications.
- **Node.js Libraries**: Libraries such as `graphql-subscriptions` provide a simple API for setting up PubSub mechanisms in Node.js applications.

### Scaling Considerations
- **Connection Management**: As subscriptions grow, managing WebSocket connections efficiently is crucial. Load balancing across multiple WebSocket servers can help distribute the load.
- **Event Distribution**: Using message brokers like Kafka can help distribute events across a cluster, ensuring that all subscribers receive updates promptly.

### Node.js Implementation
- **GraphQL Yoga**: This library provides an easy setup for GraphQL subscriptions in Node.js, supporting WebSocket connections through middleware integration.
- **Apollo Server**: Offers built-in support for subscriptions, allowing for easy integration with existing GraphQL APIs.

### Security Concerns
- **Depth Validation**: Implementing query depth validation on subscription events is necessary to prevent vulnerabilities like CVE-2026-30241.
- **Middleware Security**: Ensure that WebSocket middleware is configured to handle authentication and authorization to prevent unauthorized access.

## Recommended Actions

1. **Implement WebSocket Middleware**:
   - **What**: Integrate `graphql-ws` middleware in your Node.js application.
   - **Why**: To establish a robust WebSocket connection for handling GraphQL subscriptions.
   - **Expected Outcome**: Reliable real-time communication with clients.
   - **First Step**: Install `graphql-ws` and configure it in your Node.js server setup.

2. **Set Up a PubSub System**:
   - **What**: Use `graphql-subscriptions` with a message broker like Redis.
   - **Why**: To efficiently manage and distribute subscription events.
   - **Expected Outcome**: Scalable event handling across distributed systems.
   - **First Step**: Install `graphql-subscriptions` and configure Redis as the PubSub engine.

3. **Enhance Security Measures**:
   - **What**: Implement query depth validation and secure WebSocket connections.
   - **Why**: To protect against vulnerabilities and unauthorized access.
   - **Expected Outcome**: Reduced risk of DoS attacks and secure data transmission.
   - **First Step**: Review and apply security patches, configure depth validation in your subscription setup.

4. **Scale WebSocket Infrastructure**:
   - **What**: Implement load balancing and connection pooling for WebSocket servers.
   - **Why**: To handle increased load and ensure reliable service delivery.
   - **Expected Outcome**: Improved performance and scalability of subscription services.
   - **First Step**: Set up a load balancer and configure WebSocket servers to handle pooled connections.

By following these steps, you can effectively implement and scale GraphQL subscriptions in a Node.js environment, ensuring robust, real-time communication with enhanced security measures.