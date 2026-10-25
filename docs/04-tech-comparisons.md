# Step 5: Technology Choice Comparisons

This document provides exhaustive technical comparison matrices for every foundational technology, framework, database, and architectural pattern chosen in the **Zomato Reel Feed** application.

---

## 1. Database: MongoDB & Mongoose

### 1. What I Used
* **Detected Choice:** MongoDB via Mongoose `^8.17.1`.
* **Code Reference:** [`zomato/backend/src/db/db.js:1-15`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/db/db.js#L1-L15) and [`zomato/backend/src/models/`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models).

### 2. What It Does in This Project
MongoDB acts as the primary system of record, storing consumer accounts (`users`), restaurant merchant profiles (`foodpartners`), culinary video metadata (`foods`), and engagement join documents (`likes`, `saves`). Mongoose enforces strict schema casting, validation, and reference population.

### 3 & 4. Comprehensive Comparison Table

| Database | Data Model | Query Power | Speed (Reads) | Horizontal Scaling | Consistency Guarantees | Learning Curve | Cost (Cloud) | Ecosystem & MERN Fit | Fit With Reel Data |
|---|---|---|---|---|---|---|---|---|---|
| **MongoDB (Chosen)** | Document (BSON) | High (Aggregation, Indexes) | Very Fast | High (Native Sharding) | Tunable (Replica Set Majority) | Low | Free tier to moderate | **10/10 (Native MERN)** | **10/10 (Polymorphic media & counters)** |
| **PostgreSQL** | Relational / JSONB | Extreme (SQL, Window, CTE) | Fast | Moderate (Citus / Read Replicas) | Immediate (ACID) | Moderate | Moderate | 7/10 (Requires ORM like Prisma) | 8/10 (Strict relations, overhead on schema iteration) |
| **MySQL** | Relational | High (SQL) | Fast | Moderate (Replicas) | Immediate (ACID) | Moderate | Low to moderate | 6/10 | 7/10 (Inflexible schema migrations for early MVP) |
| **CockroachDB** | Distributed SQL | High (Postgres compatible) | Moderate | Extreme (Multi-Region) | Strict Serializable | Steep | High | 6/10 | 4/10 (Massive operational complexity for early scale) |
| **Redis** | In-Memory Key-Value | Specialized (Hashes, Sets, ZSets) | Ultra-Fast (<1ms) | High (Redis Cluster) | Eventual / In-memory | Low | High (RAM bound) | 8/10 (Auxiliary cache) | 3/10 (Cannot serve as primary durability store) |
| **DynamoDB** | Key-Value / Document | Low to Moderate (Partition key queries) | Very Fast (Single digit ms) | Extreme (Serverless) | Strong or Eventual | Moderate | Pay-per-request | 6/10 (AWS lock-in) | 6/10 (Query patterns must be known beforehand) |
| **Firebase Firestore**| Document | Low (No aggregation, limited queries)| Fast | Automatic | Strong (Document level) | Very Low | High on large reads | 5/10 (Bypasses custom backend API) | 5/10 (High cost on rapid scroll feed reads) |
| **Cassandra** | Wide-Column | Low (No joins or aggregations) | Ultra-Fast (Writes) | Extreme | Eventual (AP in CAP) | Very Steep | High | 4/10 | 3/10 (Over-engineered for relational joins like likes/partner profiles) |
| **SQLite** | Embedded Relational | Moderate (SQL) | Ultra-Fast (Local) | None (Single file) | Immediate (ACID) | Very Low | Free | 4/10 | 2/10 (Concurrency write locks make it unfit for multi-user web API) |
| **Supabase** | Managed Postgres | High (Postgres + Realtime) | Fast | Moderate | Immediate (ACID) | Low | Free tier to moderate | 7/10 | 7/10 (Coupled to Supabase ecosystem) |

### 5. Why I Used MongoDB
* [CONFIRM WITH DEVELOPER]: MongoDB pairs natively with Node.js and Express because data travels end-to-end as JSON/BSON without impedance mismatch. Rapid prototyping of evolving restaurant and reel attributes was effortless without running cumbersome relational database migration scripts.

### 6. Why I Did NOT Use Each Alternative
* **PostgreSQL:** Carries schema migration friction during early-stage feature iteration and requires an extra ORM layer like Prisma or TypeORM.
* **MySQL:** Lacks native high-performance JSON document manipulation compared to BSON and has more cumbersome horizontal sharding setup.
* **CockroachDB:** Excessive operational and compute costs designed for multi-region financial transactions rather than short-form video discovery feeds.
* **Redis:** RAM-bounded dataset limits make it unsuitable for long-term durable storage of user credentials and restaurant catalogs without risk of data loss.
* **DynamoDB:** Imposes rigid access patterns requiring predefined partition and sort keys, penalizing ad-hoc relational queries like fetching a partner's complete dish list.
* **Firebase Firestore:** Costs explode rapidly when consumers scroll thousands of video feed items because pricing is billed per individual document read.
* **Cassandra:** Requires strict tabular modeling per query and lacks join capabilities needed for user authentication and bookmark population.
* **SQLite:** File-level write locks cause severe concurrency bottlenecks when multiple users concurrently like dishes or upload videos.
* **Supabase:** Adds proprietary platform lock-in and abstracts away backend Express middleware which was necessary for custom JWT handling.

### 7. Benefits of Chosen Tool
* Frictionless JSON data lifecycle between client, Express, and database.
* Atomic `$inc` counter operators eliminate race conditions when toggling likes and saves.
* Mongoose `.populate()` provides flexible relational joins while preserving document-model speed.

### 8. Accepted Drawbacks & Trade-offs
* Lack of cross-collection foreign key constraints at the database level requires application-level integrity enforcement.
* BSON document size capped at 16MB (mitigated by referencing likes rather than embedding arrays).

### 9. When I Would Switch
* If the platform evolves into a transactional food commerce engine requiring multi-table ACID guarantees across shopping carts, payment gateways, and delivery driver assignments, I would migrate core transactional data to PostgreSQL while retaining MongoDB for social feeds.

### 10. 30-Second Spoken Answer
> "I chose MongoDB with Mongoose because its document model eliminates object-relational impedance mismatch with our Express and React stack. It gives us O(1) atomic updates on video engagement counters using `$inc`, native geospatial capabilities for future restaurant discovery, and frictionless schema iteration without heavy SQL migration scripts."

---

## 2. Media Asset Storage & CDN: ImageKit.io

### 1. What I Used
* **Detected Choice:** ImageKit.io Node.js SDK `^6.0.0`.
* **Code Reference:** [`zomato/backend/src/services/storage.service.js:1-20`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js#L1-L20).

### 2. What It Does in This Project
Receives raw video binary buffers from Multer, uploads them to cloud object storage, and serves them through an integrated global Content Delivery Network (CDN) with automatic edge caching.

### 3 & 4. Comprehensive Comparison Table

| Storage & CDN Option | Integrated CDN | On-the-Fly Video Transform | Setup Complexity | Upload API Simplicity | Free Tier Quota | Scalability | Cost at 100x Scale | Vendor Lock-in | Fit With Video Reels |
|---|---|---|---|---|---|---|---|---|---|
| **ImageKit.io (Chosen)** | Yes (Global CDN) | Yes (Format & Quality) | **Very Low** | High (Simple Node SDK) | Generous (20GB/mo) | High | Moderate | Low (Direct CDN URLs) | **10/10** |
| **AWS S3 + CloudFront** | Manual configuration | Requires Lambda@Edge | High (IAM, S3, CDN) | Moderate (AWS SDK v3) | 5GB S3 only | Extreme | Low to Moderate | Low (Industry standard) | 8/10 |
| **Cloudinary** | Yes (Akamai/Fastly) | Extreme (Deep video AI) | Low | High | Strict Bandwidth caps | High | Very High (Expensive) | Moderate | 9/10 |
| **Firebase Storage** | Fastly (Default) | No (Manual Cloud Funcs) | Low | High | 5GB | High | Moderate | High (Google ecosystem) | 6/10 |
| **Google Cloud Storage**| Manual (Cloud CDN) | No | Moderate | Moderate | 5GB | Extreme | Moderate | Low | 7/10 |
| **Local Disk Storage** | None (Direct Node host) | No | None | Zero SDK | Local disk bound | **Zero** (Bottleneck) | Extreme (Disk crash) | Zero | **1/10 (Breaks in prod)** |

### 5. Why I Used ImageKit.io
* [CONFIRM WITH DEVELOPER]: ImageKit combines object storage, automatic transcoding, and global CDN distribution into a single SDK, eliminating the need to architect separate AWS S3 buckets, CloudFront distributions, and Lambda@Edge transcoding functions.

### 6. Why I Did NOT Use Each Alternative
* **AWS S3 + CloudFront:** Requires complex IAM permissions, bucket CORS policies, and separate CloudFront distribution setup that adds massive dev friction for an MVP.
* **Cloudinary:** Has restrictive free-tier bandwidth caps and becomes prohibitively expensive when serving streaming video reels at scale.
* **Firebase Storage:** Lacks built-in on-the-fly video transcoding and locks the application into the Google Firebase ecosystem.
* **Google Cloud Storage:** Requires manual Cloud CDN configuration and does not offer automated media optimization out of the box.
* **Local Disk Storage:** Ephemeral container filesystems on cloud hosts wipe files on restart and prevent running multiple server instances behind a load balancer.

### 7. Benefits of Chosen Tool
* Single SDK handles upload and returns a production-ready CDN URL with sub-second time-to-first-byte (TTFB).

### 8. Accepted Drawbacks & Trade-offs
* Direct memory buffer uploading through Node server consumes server RAM during transit.

### 9. When I Would Switch
* At 1,000,000 daily active users, I would switch to AWS S3 with client-side presigned URLs and AWS MediaConvert to transcode videos into adaptive bitrate HLS streams (`.m3u8`), lowering cloud bandwidth costs.

### 10. 30-Second Spoken Answer
> "I chose ImageKit because it bundles media storage and a worldwide CDN into a single Node.js SDK. Instead of setting up complex AWS S3 buckets, IAM roles, and CloudFront edge caches, ImageKit allowed me to upload video buffers directly and receive fast, globally cached CDN links with zero infrastructure overhead."

---

## 3. Authentication & Session Strategy: JWT in HTTP-Only Cookies

### 1. What I Used
* **Detected Choice:** JSON Web Tokens signed with HMAC-SHA256, transmitted via HTTP cookies.
* **Code Reference:** [`auth.controller.js:28-32`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L28-L32) and [`auth.middleware.js:8-17`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/middlewares/auth.middleware.js#L8-L17).

### 2. What It Does in This Project
Provides stateless, cryptographically signed session verification across both Consumer and Food Partner roles without querying an active session store on every request.

### 3 & 4. Comprehensive Comparison Table

| Auth Mechanism | Storage Location | XSS Vulnerability | CSRF Vulnerability | Horizontal Scaling | Server Memory Overhead | Instant Revocation | Implementation Complexity | Fit With Project |
|---|---|---|---|---|---|---|---|---|
| **JWT in Cookie (Chosen)** | Browser Cookie Jar | **Low** (Safe from JS) | Moderate (Requires SameSite) | **Infinite (Stateless)** | **Zero** | Difficult | Low | **9/10** |
| **JWT in LocalStorage** | Browser LocalStorage | **Extreme (XSS theft)** | Zero | Infinite (Stateless) | Zero | Difficult | Very Low | 3/10 (Security anti-pattern) |
| **Server Sessions (Redis)** | Redis Key-Value | Low | Moderate | Moderate (Redis bound) | Moderate (RAM per user) | **Instant** | Moderate | 7/10 |
| **Server Sessions (Mongo)** | `sessions` Collection | Low | Moderate | Low (DB write bottleneck) | Low | Instant | Moderate | 5/10 (Slows DB) |
| **OAuth 2.0 / Google Auth**| External IdP | Low | Low | Infinite | Zero | Handled by IdP | High | 8/10 (Great future add) |
| **Managed Auth (Clerk/Auth0)**| Cloud Provider | Low | Low | Infinite | Zero | Instant | Low | 6/10 (Third party cost & lock-in) |

### 5. Why I Used JWT Cookies
* [CONFIRM WITH DEVELOPER]: Storing signed JWTs in cookies eliminates the need to maintain an in-memory session store like Redis while protecting credentials from malicious JavaScript DOM access that plagues LocalStorage.

### 6. Why I Did NOT Use Each Alternative
* **JWT in LocalStorage:** Any Cross-Site Scripting (XSS) vulnerability in a third-party dependency allows an attacker to extract the JWT with `localStorage.getItem('token')`.
* **Server Sessions in Redis:** Introduces an additional infrastructure dependency that increases hosting costs and creates a single point of failure.
* **Server Sessions in MongoDB:** Queries the database for session validation on every single HTTP request, cutting API throughput in half.
* **OAuth 2.0 (Google/Apple):** Adds third-party developer portal setup and redirects that complicate testing and merchant address registration.
* **Clerk / Auth0:** Charges steep monthly active user fees and abstracts away role-based middleware control.

### 7. 30-Second Spoken Answer
> "I used JWTs in browser cookies because it provides stateless, horizontally scalable authentication without querying a session store on every API hit. Storing the token in a cookie rather than LocalStorage prevents XSS token extraction, giving us a secure, decoupled authentication architecture."

---

## 4. Frontend Framework: React 19

### 1. What I Used
* **Detected Choice:** React `^19.1.1` and React DOM `^19.1.1`.
* **Code Reference:** [`zomato/frontend/package.json:14-15`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json#L14-L15).

### 2. What It Does in This Project
Powers the Single Page Application, orchestrating virtual DOM reconciliation, component state, declarative routing, and the `IntersectionObserver` video lifecycle.

### 3 & 4. Comprehensive Comparison Table

| Frontend Framework | Rendering Model | Ecosystem & Talent Pool | Mobile Feed Performance | Learning Curve | Server-Side Rendering | Bundle Size | Fit With Project |
|---|---|---|---|---|---|---|---|
| **React 19 (Chosen)** | Virtual DOM + Fiber | **Vast (Industry Standard)** | **Very High** | Moderate | Supported | Moderate (~45KB) | **10/10** |
| **Vue 3** | Reactive Proxy / Virtual DOM | Large | Very High | Low to Moderate | Supported (Nuxt) | Small (~30KB) | 8/10 |
| **Svelte 5** | Compiler (Runes, No VDOM) | Growing | Extreme (Tiny overhead) | Low | Supported (SvelteKit) | Tiny (~15KB) | 8/10 |
| **Angular 19** | Incremental DOM / Signals | Enterprise | High | Steep | Supported | Large | 5/10 (Too heavy) |
| **Next.js 15** | Hybrid SSR/RSC | Vast | High | Steep | Native | Large | 7/10 (Unneeded server complexity for SPA feed) |
| **Solid.js** | Fine-grained reactivity (No VDOM)| Emerging | Extreme | Moderate | Supported | Tiny | 6/10 (Smaller ecosystem) |

### 5. Why I Used React 19
* [CONFIRM WITH DEVELOPER]: React 19 provides state-of-the-art concurrent rendering, robust developer tooling, and the largest ecosystem of components and libraries. Its hooks model (`useRef`, `useEffect`, `useMemo`) provides exact programmatic control over DOM video elements.

### 6. Why I Did NOT Use Each Alternative
* **Vue 3:** While excellent, React's ecosystem and industry prevalence make it more universally recognized by engineering interviewers.
* **Svelte 5:** Smaller enterprise talent pool and fewer third-party React-compatible video player plugins.
* **Angular 19:** Enforces heavy boilerplate (TypeScript classes, RxJS observables, dependency injection) that is counterproductive for a nimble video feed app.
* **Next.js 15:** Server components and SSR complicate video streaming layouts that rely entirely on client-side viewport intersection observers.
* **Solid.js:** Lacks the rich ecosystem and community packages required for rapid full-stack delivery.

### 7. 30-Second Spoken Answer
> "I chose React 19 because its concurrent rendering and hooks architecture give me low-level control over DOM elements through `useRef` and `useEffect`. This was essential for binding the IntersectionObserver to multiple video elements without triggering unwanted re-renders, while keeping the app aligned with industry-standard MERN architecture."

---

## 5. Styling Architecture: Vanilla CSS with Custom Theme Tokens

### 1. What I Used
* **Detected Choice:** Pure Vanilla CSS utilizing CSS Custom Properties (`:root` variables) in [`theme.css`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/styles/theme.css) and dedicated modular stylesheets (`reels.css`, `create-food.css`, `profile.css`).

### 2. What It Does in This Project
Defines the visual design system: spacing tokens, border radiuses, dark-mode color palettes, snap-scrolling layout primitives, and dropzone styling without external runtime overhead.

### 3 & 4. Comprehensive Comparison Table

| Styling Approach | Runtime Overhead | Dark Mode Support | Bundle Footprint | Developer Velocity | Specificity Issues | Fit With Reel Animations |
|---|---|---|---|---|---|---|
| **Vanilla CSS Tokens (Chosen)**| **Zero** | **Native (`prefers-color-scheme`)** | **Zero JS (Pure CSS)** | High | Low | **10/10 (Full hardware acceleration)** |
| **Tailwind CSS** | Zero (Build-time) | Class-based | Small (Purged) | Very High | Zero | 8/10 (Class clutter on complex video overlays) |
| **Styled-Components** | High (JS runtime parsing) | ThemeProvider | Moderate (+12KB) | Moderate | Zero | 5/10 (Causes re-render frame drops on fast scroll) |
| **CSS Modules** | Zero | Manual variables | Zero JS | High | Zero | 8/10 |
| **MUI / Chakra UI** | Very High | Built-in | Heavy (+80KB) | High | High | 4/10 (Heavy component trees kill mobile 60fps) |

### 5. 30-Second Spoken Answer
> "I chose native CSS Custom Properties because it delivers zero runtime overhead and allows hardware-accelerated animations on mobile GPUs. By avoiding runtime CSS-in-JS libraries like Styled-Components, scrolling stays locked at 60 frames per second with instant system-aware dark mode switching."
