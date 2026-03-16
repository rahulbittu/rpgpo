# Subtask Output — Research Common System Design Problems
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Common System Design Problems in FAANG Interviews

FAANG system design interviews frequently feature problems like **design a calendar**, **design WhatsApp**, **design ChatGPT**, and **design a web crawler**, evaluated through steps including requirement clarification, high-level design (client-server-storage), low-level drill-down, and trade-offs.[1][2]

### Specific Problems and Descriptions
- **Design a Calendar**: Clarify scope (e.g., small organization vs. large-scale with meeting rooms and shared calendars), then outline high-level design with client-side UI, server-side logic for scheduling, and storage for events; drill down based on role (e.g., storage for data roles).[1]
- **Design WhatsApp**: Full-stack architecture covering messaging at scale, including front-end wireframes, API contracts, database choices, and scalability via message queues like Kafka (justify partitions and trade-offs over alternatives).[2]
- **Design ChatGPT**: End-to-end system with model-serving abstraction, front-end prioritization if guided, full-stack from UI to storage, emphasizing distributed systems internals like Kubernetes orchestration and fault tolerance.[2]
- **Design a Web Crawler**: Mirrors massive-scale crawling, focusing on distributed architecture, bottlenecks, and scaling patterns without starting at maximum scale.[2]

### Interview Process and Evaluation Focus
FAANG system design rounds (for senior roles) last 45-60 minutes, starting with **requirement clarification** (e.g., user scale, read/write paths), moving to **high-level design** (client-server-storage with non-functional needs like TPS), **low-level drill-down** (e.g., storage layer, Kafka internals), and **trade-offs** (bottlenecks, optimizations).[1][4]
- OpenAI variant (FAANG-like) stresses full-stack thinking, collaboration for scope (e.g., abstract model-serving), and depth on tech choices (e.g., why Kafka).[2]
- Common pitfalls: Over-scaling early, surface-level tech mentions without internals (e.g., Kubernetes fault tolerance).[2]

Sources:  
[1] https://igotanoffer.com/blogs/tech/system-design-interviews  
[2] https://www.tryexponent.com/blog/openai-system-design-interview  
[3] https://everyonewhocode.com/system-design-interview-a-complete-step-by-step-guide-for-2026/  
[4] https://firecode.io/best/faang-interview-preparation
