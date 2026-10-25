# Zomato Reel Feed: Engineering Documentation Index

Welcome to the comprehensive technical documentation for the **Zomato Reel Feed** platform. This documentation is written in the style of the Vue.js official docs: simple, clear, step-by-step, and fully verified against the source code.

---

## Complete Reading Order

### 1. Project Foundation & System Scan
1. [**00-project-type.md**](./00-project-type.md): Project type detection, evidence from package files and schemas.
2. [**00a-project-analysis.md**](./00a-project-analysis.md): End-to-end full project analysis with 5 Mermaid diagrams per feature.
3. [**00b-project-pitch.md**](./00b-project-pitch.md): 30-second, 2-minute, and 3-minute interview presentation scripts.
4. [**00-project-map.md**](./00-project-map.md): Full folder tree, exact tech versions, dependencies, and environment variables.
5. [**02-build-order.md**](./02-build-order.md): Step-by-step guide to rebuilding this system from scratch with line-by-line code explanations.

### 2. Feature Inventory & Deep Dives
6. [**01-features.md**](./01-features.md): Master feature directory covering F1 to F15.
7. [**features/01-user-auth.md**](./features/01-user-auth.md): Consumer user registration, login, logout, and JWT cookie management.
8. [**features/02-partner-auth.md**](./features/02-partner-auth.md): Restaurant partner onboarding and session isolation.
9. [**features/03-video-feed.md**](./features/03-video-feed.md): Vertical reel feed, IntersectionObserver 60% autoplay, likes, and bookmarks.
10. [**features/04-food-creation.md**](./features/04-food-creation.md): Video upload dropzone, Multer memory storage, and ImageKit CDN pipeline.
11. [**features/05-partner-profile.md**](./features/05-partner-profile.md): Restaurant store page, operational badges, and dish catalog grid.
12. [**features/06-infrastructure-shared.md**](./features/06-infrastructure-shared.md): Multi-role navigation, CORS configuration, and auth middlewares.
13. [**14-say-it-out-loud.md**](./14-say-it-out-loud.md): All 15 feature spoken interview scripts gathered on one page with a rehearsal checklist.

### 3. Engineering & Architectural Deep Dives
14. [**03-api-reference.md**](./03-api-reference.md): Complete REST endpoint specifications, request/response contracts, and status codes.
15. [**04-tech-comparisons.md**](./04-tech-comparisons.md): Deep-dive comparison matrices for database, storage, auth, framework, and styling.
16. [**05-architecture.md**](./05-architecture.md): Architectural topology, request lifecycles, database schemas, and 100x traffic scaling.
17. [**06-security.md**](./06-security.md): Security audit mapped against OWASP Top 10 vulnerabilities with code mitigations.
18. [**07-ai-integration.md**](./07-ai-integration.md): Assessment of current AI status and production multimodal Gemini 1.5 Flash vision upgrade.
19. [**08-quality-and-ops.md**](./08-quality-and-ops.md): Test pyramid audit, Docker compose setup, performance bottlenecks, and technical debt.

### 4. System Design Deep Dive (Step 14)
20. [**system-design/index.md**](./system-design/index.md): Master system design syllabus and architecture roadmap.
21. [**system-design/14.1-requirements-estimation.md**](./system-design/14.1-requirements-estimation.md): Capacity estimations, QPS, bandwidth, and storage math.
22. [**system-design/14.2-architecture-styles.md**](./system-design/14.2-architecture-styles.md): Monolith vs modular monolith vs microservices decomposition.
23. [**system-design/14.3-networking-communication.md**](./system-design/14.3-networking-communication.md): Protocols, DNS, CDN, HTTP/1.1 vs HTTP/2 vs HTTP/3.
24. [**system-design/14.4-load-balancing-scaling.md**](./system-design/14.4-load-balancing-scaling.md): L4 vs L7 load balancers, autoscaling, and single points of failure.
25. [**system-design/14.5-databases-storage.md**](./system-design/14.5-databases-storage.md): Relational vs Document databases, sharding, replication, and CAP.
26. [**system-design/14.6-caching.md**](./system-design/14.6-caching.md): Multi-tier caching, Redis cache-aside, and cache stampede defense.
27. [**system-design/14.7-messaging-queues.md**](./system-design/14.7-messaging-queues.md): Async video transcoding queues with BullMQ and RabbitMQ.
28. [**system-design/14.8-consistency-concurrency.md**](./system-design/14.8-consistency-concurrency.md): Concurrency locking, atomic operators, and race condition prevention.
29. [**system-design/14.9-reliability-resilience.md**](./system-design/14.9-reliability-resilience.md): Circuit breakers, retries with exponential backoff, and SLA targets.
30. [**system-design/14.10-api-design-rate-limiting.md**](./system-design/14.10-api-design-rate-limiting.md): Rate limiting algorithms (Token Bucket, Sliding Window Log).
31. [**system-design/14.11-security-architecture.md**](./system-design/14.11-security-architecture.md): Zero trust, token revocation, encryption at rest and in transit.
32. [**system-design/14.12-search-ai-architecture.md**](./system-design/14.12-search-ai-architecture.md): Atlas Vector Search, Gemini embeddings, and recommendation pipelines.
33. [**system-design/14.13-real-time-systems.md**](./system-design/14.13-real-time-systems.md): WebSockets vs SSE for live engagement and order updates.
34. [**system-design/14.14-observability-operations.md**](./system-design/14.14-observability-operations.md): The three pillars: structured logs (Pino), metrics (Prometheus), and tracing.
35. [**system-design/14.15-performance-engineering.md**](./system-design/14.15-performance-engineering.md): Latency percentiles (p99), Little's Law, and mobile 60fps profiling.
36. [**system-design/14.16-cost-tradeoffs.md**](./system-design/14.16-cost-tradeoffs.md): Cloud economics: current monthly spend vs 100x scale cost projection.
37. [**system-design/14.17-classic-system-design-problems.md**](./system-design/14.17-classic-system-design-problems.md): Classic problems applied: URL Shortener, Notification System, News Feed.
38. [**system-design/decisions.md**](./system-design/decisions.md): Master design decisions audit log.

### 5. Interview Preparation & Verification
39. [**09-interview-qa.md**](./09-interview-qa.md): 150+ technical interview questions and full answers.
40. [**10-gaps-and-improvements.md**](./10-gaps-and-improvements.md): Ranked production gaps and code remediation blueprints.
41. [**11-glossary.md**](./11-glossary.md): Plain-English definitions of all technical terms and domain concepts.
42. [**12-confirm-list.md**](./12-confirm-list.md): List of developer assumptions for verification.
43. [**13-master-checklist.md**](./13-master-checklist.md): 275-item master checklist covering Sections A through R.

---

## How to Run Documentation Locally

```bash
# Start VitePress Documentation Server (Port 5174)
npm run docs:dev

# Build Documentation for Production
npm run docs:build

# Preview Production Build
npm run docs:preview
```
Access the interactive documentation portal at: **`http://localhost:5174`**
