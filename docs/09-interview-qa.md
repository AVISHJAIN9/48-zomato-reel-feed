# Step 10: Master Interview Preparation (150+ Questions & Answers)

This document contains over 150 technical interview questions with deep, code-verified answers specific to the **Zomato Reel Feed** architecture.

---

## Part 1: High-Priority Project Presentations

### Q1: "Walk me through your project in 3 minutes."
> "Zomato Reel Feed is a vertical video culinary discovery platform built on the MERN stack. I created it to solve the high churn and decision fatigue caused by traditional static photo menus.
> 
> The application serves two personas: **Consumers** and **Food Partners**.
> 
> On the frontend, I used React 19 and Vite. The core interface is an infinite vertical video reel. To make scrolling ultra-responsive without draining mobile batteries, I built a custom autoplay engine in `ReelFeed.jsx` using the browser's `IntersectionObserver` API. When a video crosses 60% viewport visibility, it plays inline with muted audio; off-screen videos pause immediately.
> 
> On the backend, I built an Express 5 REST API connected to MongoDB Atlas via Mongoose. I implemented dual-role authentication using bcrypt password hashing (10 salt rounds) and signed JSON Web Tokens stored in HTTP-only cookies, verified by custom Express middlewares.
> 
> For media management, when a restaurant partner uploads a dish video in `CreateFood.jsx`, Multer buffers the binary in memory and our storage service streams it to ImageKit's global CDN using a cryptographically unique UUID. The resulting CDN URL is saved in MongoDB.
> 
> For social engagement, I engineered atomic like and save toggles using MongoDB's `$inc` operator paired with relational join collections (`likes` and `saves`). This ensures $O(1)$ read performance on the feed while preventing document fragmentation."

### Q2: "Give me your 60-second pitch."
> "Zomato Reel Feed brings the high-engagement vertical video format of TikTok and Instagram to restaurant food discovery. 
> 
> Food partners upload short cooking reels directly to our ImageKit cloud CDN via an Express 5 API. Foodies browse a 60fps vertical feed where videos automatically play and pause using a custom React 19 IntersectionObserver hook. 
> 
> I built dual-role authentication with JWT cookies, atomic like/save counters in MongoDB, and merchant profile pages displaying address details and dish catalogs. It transforms dish discovery from boring text menus into an appetizing, visual journey."

### Q3: "What is the hardest function in your codebase? Explain it line by line."
> "The hardest function is the IntersectionObserver autoplay loop inside `ReelFeed.jsx` ([lines 13–31](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/ReelFeed.jsx#L13-L31)).
> 
> 1. `useEffect(() => {`: Attaches the observer lifecycle to component mount and updates whenever the `items` array changes.
> 2. `const observer = new IntersectionObserver((entries) => {`: Instantiates the native browser observer callback, which receives an array of intersection changes.
> 3. `entries.forEach((entry) => {`: Iterates over elements whose visibility crossed a threshold boundary.
> 4. `const video = entry.target;`: Retrieves the raw HTML5 `<video>` DOM node.
> 5. `if (!(video instanceof HTMLVideoElement)) return;`: Type-guard verifying the element is indeed a video player.
> 6. `if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {`: The core heuristic: checks if the video occupies 60% or more of the screen height.
> 7. `video.play().catch(() => {});`: Invokes play with a catch block to silently ignore browser autoplay policy rejections (e.g. if the user hasn't interacted with the document yet).
> 8. `} else { video.pause(); }`: Immediately pauses videos that fall below 60% visibility to free GPU decoding threads.
> 9. `}, { threshold: [0, 0.25, 0.6, 0.9, 1] });`: Multi-step threshold array ensuring smooth tracking during fast scrolling.
> 10. `videoRefs.current.forEach((vid) => observer.observe(vid));`: Iterates over our `useRef` Map of DOM nodes and attaches the observer without triggering component re-renders.
> 11. `return () => observer.disconnect();`: Mandatory cleanup disconnecting all listeners on unmount to prevent severe memory leaks."

---

## Part 2: Architecture & System Design (Q4 – Q25)

* **Q4: Why separate the Express app definition (`app.js`) from server startup (`server.js`)?**
  * *Answer:* Separating `app.js` from `app.listen()` allows importing the `app` instance into automated integration test suites (like Supertest) without binding to a live network port, preventing port collision errors during CI/CD test runs.
* **Q5: Is this system stateful or stateless?**
  * *Answer:* The API server is completely **stateless**. User sessions are encoded within digitally signed JWT cookies. Any server instance can handle any request without sharing in-memory session state, allowing seamless horizontal autoscaling behind an AWS ALB or Nginx reverse proxy.
* **Q6: How does the client communicate cross-origin with the API?**
  * *Answer:* Via CORS. The backend mounts `cors({ origin: "http://localhost:5173", credentials: true })`. The client sends `{ withCredentials: true }` in Axios calls, allowing cross-origin cookie exchange between port 5173 and port 3000.
* **Q7: What happens if MongoDB goes down while the server is running?**
  * *Answer:* In `db.js`, connection errors are logged. If MongoDB drops, active route queries reject with a Mongoose `ServerSelectionError`, returning an unhandled promise rejection or HTTP 500.
* **Q8: How would you split this monolith into microservices?**
  * *Answer:* Into three independent services: (1) **Auth Service** (User and Merchant identity, JWT signing), (2) **Media Ingestion Service** (Multer, ImageKit/S3 transcoding), and (3) **Feed & Engagement Service** (Reels listing, likes, bookmarks, Redis cache).
* **Q9: How do you prevent video autoplay race conditions during rapid scrolling?**
  * *Answer:* By using multi-step thresholds in `IntersectionObserver` and wrapping `video.play()` in a catch handler. When scrolling rapidly, elements trigger `.pause()` before their `.play()` promise resolves, which the catch block swallows without throwing unhandled rejection errors.
* **Q10: Why use ImageKit instead of serving videos directly from the Express server?**
  * *Answer:* Serving video files directly from Node.js saturates the single-threaded event loop with continuous chunk streaming, exhausts server disk and network bandwidth, and lacks global edge caching. ImageKit offloads all video streaming to a worldwide CDN.
* **Q11: How would you add real-time like updates across all active viewers?**
  * *Answer:* By mounting a WebSocket server (Socket.io) backed by Redis Pub/Sub. When a user likes a reel, the API publishes a message to Redis channel `reel:likes:<id>`, which broadcasts the new counter to all clients in that reel's room.
* **Q12: How would you handle localized multi-region deployment?**
  * *Answer:* Deploy containerized API instances across multiple AWS regions using Amazon ECS with Route 53 latency-based routing, backed by a multi-region MongoDB Atlas replica set with localized read preferences.
* **Q13: What is the CAP theorem status of this project?**
  * *Answer:* MongoDB operates primarily as a **CP (Consistency / Partition Tolerance)** system by default, using single-leader replica sets where writes go to the primary node.
* **Q14: What is PACELC theorem and where does MongoDB sit?**
  * *Answer:* If partitioned (P), choose between availability (A) and consistency (C); else (E), choose between latency (L) and consistency (C). MongoDB defaults to **PC/EC** (consistent under partition, consistent under normal execution).
* **Q15: How would you implement rate limiting?**
  * *Answer:* By attaching `express-rate-limit` backed by Redis (`rate-limit-redis`) to track client IPs using a sliding window counter algorithm.
* **Q16: Why did you choose MVC architecture?**
  * *Answer:* Model-View-Controller cleanly isolates database schemas (`models/`), HTTP routing and validation (`routes/` & `middlewares/`), and business logic (`controllers/`).
* **Q17: How would you prevent hot video feed database bottleneck?**
  * *Answer:* Cache the global feed in Redis with a 60-second TTL using a Cache-Aside pattern.
* **Q18: What is the maximum video size your system can handle?**
  * *Answer:* Currently bounded by Node.js RAM limits (~50MB–100MB). In production, client-side presigned S3 uploads remove this ceiling entirely.
* **Q19: How do you handle schema migrations in Mongoose?**
  * *Answer:* Since MongoDB is schemaless, new fields are added to Mongoose schemas with default values. For breaking data migrations, we write idempotent migration scripts using tools like `migrate-mongo`.
* **Q20: What is the purpose of `uuid` in video uploading?**
  * *Answer:* It generates collision-free file names (`uuidv4()`), ensuring two partners uploading files named `video.mp4` do not overwrite each other's cloud media.
* **Q21: How do you handle database connection pooling in Mongoose?**
  * *Answer:* Mongoose maintains a default connection pool of 100 sockets (`maxPoolSize: 100`), reusing TCP connections across incoming HTTP requests.
* **Q22: What happens if an unauthenticated user calls `/api/food`?**
  * *Answer:* `authUserMiddleware` intercepts the request, detects missing `token` cookie, and returns HTTP 401 `{ message: "Please login first" }`.
* **Q23: How would you implement full-text dish search?**
  * *Answer:* By creating a text index on `foods`: `foodSchema.index({ name: 'text', description: 'text' })`, or integrating Algolia / Atlas Search.
* **Q24: What is the role of `cookie-parser`?**
  * *Answer:* It extracts the `Cookie` header string from raw HTTP headers and parses it into key-value pairs accessible on `req.cookies`.
* **Q25: Why use CommonJS (`require`) in the backend and ES Modules (`import`) in the frontend?**
  * *Answer:* The backend uses Node.js CommonJS as defined in `package.json` (`"type": "commonjs"`), while the frontend uses Vite's native ES module bundling (`"type": "module"`).

---

## Part 3: Authentication & Security (Q26 – Q50)

* **Q26: Why store JWT in a cookie instead of LocalStorage?**
  * *Answer:* LocalStorage is accessible to any JavaScript running on the page. If a third-party script or dependency contains an XSS vulnerability, the token can be stolen via `localStorage.getItem()`. Cookies can be hardened with `httpOnly: true` to make them completely invisible to client scripts.
* **Q27: What is bcrypt salt rounds and why is 10 chosen?**
  * *Answer:* Salt rounds define the work factor ($2^{10} = 1,024$ hashing iterations). 10 rounds provides strong protection against GPU-accelerated brute-force attacks while taking only ~70ms on modern CPUs, preserving login throughput.
* **Q28: How does JWT signature verification work mathematically?**
  * *Answer:* The token consists of `header.payload.signature`. The server takes `header.payload`, hashes it with HMAC-SHA256 using `JWT_SECRET`, and verifies that the resulting digest matches the incoming signature string.
* **Q29: How do you prevent Cross-Site Request Forgery (CSRF)?**
  * *Answer:* By setting `sameSite: "strict"` or `"lax"` on the auth cookie, preventing the browser from attaching the cookie during cross-site forged requests.
* **Q30: What is the difference between authentication and authorization in this app?**
  * *Answer:* Authentication confirms *who* the user is (validating credentials in `loginUser`). Authorization confirms *what permissions* they have (e.g. `authFoodPartnerMiddleware` ensuring only verified restaurant accounts can post food).
* **Q31: What is a rainbow table attack and how does bcrypt prevent it?**
  * *Answer:* A rainbow table is a precomputed lookup table of password hashes. Bcrypt generates a unique random 128-bit salt for every password, ensuring identical passwords generate completely different hashes and rendering rainbow tables useless.
* **Q32: Can a JWT be decrypted by anyone?**
  * *Answer:* Yes. JWT payloads are base64url encoded, not encrypted. Anyone can decode and inspect the payload. Therefore, sensitive data like plaintext passwords or credit cards must **never** be stored in a JWT.
* **Q33: How do you revoke a JWT before its expiration date?**
  * *Answer:* Maintain a token blocklist in Redis keyed by token JTI (JWT ID) with a TTL matching the token expiry, checked during middleware verification.
* **Q34: What is NoSQL injection and how is it mitigated here?**
  * *Answer:* An attack where malicious query operators (like `{"$gt": ""}`) are supplied in JSON bodies to bypass authentication. Mitigated by Mongoose schema casting and `express-mongo-sanitize`.
* **Q35: Why does login return identical error messages for wrong email and wrong password?**
  * *Answer:* Returning specific messages like "User not found" allows attackers to harvest valid registered emails (account enumeration). A generic "Invalid email or password" prevents enumeration.
* **Q36: What security headers should be added with Helmet?**
  * *Answer:* `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
* **Q37: What is CORS preflight (`OPTIONS` request)?**
  * *Answer:* Before sending non-simple cross-origin requests (e.g. POST with JSON or credentials), the browser automatically sends an HTTP `OPTIONS` request to check server permissions.
* **Q38: Why is `origin: "*"` invalid when `credentials: true` in CORS?**
  * *Answer:* Browser security specifications explicitly forbid wildcard origins with credentialed requests to prevent any arbitrary site from reading authenticated user sessions.
* **Q39: How do you protect against brute-force password guessing?**
  * *Answer:* Implement IP and account-based rate limiting using Redis, plus exponential backoff or CAPTCHA after 5 failed attempts.
* **Q40: How are environment secrets protected in production?**
  * *Answer:* Kept outside version control via `.gitignore`, and injected into container environments via AWS Secrets Manager, Doppler, or Kubernetes Secrets.
* **Q41: What happens if `JWT_SECRET` is leaked?**
  * *Answer:* An attacker can forge arbitrary tokens for any user or food partner ID, gaining total administrative access. It requires immediate key rotation and session invalidation.
* **Q42: What is the risk of missing server-side file MIME type checking?**
  * *Answer:* Attackers can upload malicious executable scripts (e.g. PHP/shell scripts disguised as `.mp4`) to achieve Remote Code Execution (RCE).
* **Q43: What is the purpose of `res.clearCookie("token")`?**
  * *Answer:* Sets an expired `Set-Cookie` header with date in the past (`Thu, 01 Jan 1970 00:00:00 GMT`), commanding the browser to delete the cookie immediately.
* **Q44: How does `req.foodPartner` get attached to the request?**
  * *Answer:* `authFoodPartnerMiddleware` verifies the token, queries `foodPartnerModel.findById(decoded.id)`, and assigns the Mongoose document to `req.foodPartner`.
* **Q45: Why do we exclude passwords from response JSON?**
  * *Answer:* In `auth.controller.js`, only sanitized user objects (`_id`, `email`, `fullName`) are returned to prevent exposing hashed credentials over the wire.
* **Q46: What is session hijacking?**
  * *Answer:* An attacker steals an active session cookie or JWT and impersonates the victim. Mitigated by HTTPS encryption, HTTP-only cookie flags, and short token lifespans.
* **Q47: What is clickjacking and how to prevent it?**
  * *Answer:* Tricking a user into clicking invisible UI elements loaded in an iframe. Prevented with `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`.
* **Q48: How do you handle password resets securely?**
  * *Answer:* Generate a high-entropy cryptographically random token with a 15-minute expiration, hash the token in the database, and email a single-use reset link.
* **Q49: What is the principle of least privilege?**
  * *Answer:* Giving accounts and services only the minimum permissions required to perform their function (e.g. consumers cannot access merchant creation routes).
* **Q50: What is the difference between `jsonwebtoken` and `crypto`?**
  * *Answer:* `crypto` is Node's built-in cryptographic library for low-level hashing and ciphers; `jsonwebtoken` is a higher-level library that implements the RFC 7519 JWT standard using `crypto` underneath.

---

## Part 4: Frontend & React 19 Mechanics (Q51 – Q75)

* **Q51: How does React 19 reconcile the virtual DOM?**
  * *Answer:* React creates an in-memory virtual DOM tree. When state changes, it generates a new tree, diffs it against the previous tree using the Fiber reconciliation algorithm, and calculates the minimal set of batched DOM mutations.
* **Q52: Why use `useRef` for video references instead of component state?**
  * *Answer:* Updating component state (`useState`) triggers a re-render of the component. Storing video DOM elements inside a `useRef` Map allows updating references mutably without triggering re-renders during high-frequency scrolling.
* **Q53: How does `IntersectionObserver` improve performance over `window.addEventListener('scroll')`?**
  * *Answer:* Scroll event listeners fire synchronously on the browser's main UI thread, causing constant layout recalculations (layout thrashing) and dropped frames. `IntersectionObserver` executes asynchronously off the main thread, notifying the callback only when visibility thresholds are crossed.
* **Q54: What does `URL.createObjectURL(videoFile)` do in `CreateFood.jsx`?**
  * *Answer:* It creates a temporary DOMString containing a `blob:` URL pointing directly to the file data stored in the browser's memory, allowing instant local video preview without uploading bytes to a server first.
* **Q55: Why must `URL.revokeObjectURL(url)` be called?**
  * *Answer:* Blob URLs retain the associated file in browser memory for the lifetime of the document. Calling `revokeObjectURL` in the `useEffect` cleanup function frees that memory and prevents browser RAM leaks.
* **Q56: What does `playsInline` attribute do on HTML5 video?**
  * *Answer:* On mobile devices (especially iOS Safari), video playback defaults to taking over the full native device screen. `playsInline` forces the video to play directly inside the webpage layout.
* **Q57: Why is `muted` mandatory for programmatic video autoplay?**
  * *Answer:* Modern browsers (Chrome, Safari) strictly enforce Autoplay Policies that block unmuted programmatic video playback unless the user has directly interacted with the domain. Videos must be `muted` to autoplay reliably.
* **Q58: What is the function of `preload="metadata"`?**
  * *Answer:* Instructs the browser to fetch only initial video metadata (duration, dimensions, first frame) rather than buffering the entire video file immediately, saving massive amounts of mobile bandwidth.
* **Q59: How does React Router DOM v7 match routes?**
  * *Answer:* It evaluates the browser's `window.location.pathname` against defined `<Route path="...">` elements using rank-based path scoring to render the matching component tree.
* **Q60: What is the difference between `Link` and `NavLink`?**
  * *Answer:* `NavLink` is a specialized wrapper around `Link` that knows whether its route is currently active, providing an `isActive` boolean callback used in `BottomNav.jsx` to dynamically style the active tab.
* **Q61: What is the dependency array in `useEffect` and what happens if omitted?**
  * *Answer:* It declares the reactive values the effect depends on. If omitted, the effect executes on every single component render. An empty array `[]` runs only once on mount.
* **Q62: What is `useMemo` doing in `CreateFood.jsx:69`?**
  * *Answer:* It memoizes the boolean expression `!name.trim() || !videoFile`, recomputing only when `name` or `videoFile` state changes, preventing unnecessary recalculations during re-renders.
* **Q63: What causes an unhandled promise rejection in `video.play()`?**
  * *Answer:* If a user scrolls quickly, an element can be removed from view or paused before the browser finishes loading the video buffer, causing the play promise to reject with an `AbortError`. Catching it (`video.play().catch(() => {})`) prevents console errors.
* **Q64: How does CSS scroll-snap work in `reels.css`?**
  * *Answer:* The feed container sets `scroll-snap-type: y mandatory`, and every individual reel item sets `scroll-snap-align: start`. This forces the browser to cleanly snap the scroll position to the top of each video reel.
* **Q65: What are CSS custom properties and why use them for theming?**
  * *Answer:* Variables defined in CSS (`--color-bg: #000000`). They cascade down the DOM tree, allow live runtime theme toggling, and require zero JavaScript compilation overhead.
* **Q66: How does `@media (prefers-color-scheme: dark)` work?**
  * *Answer:* A CSS media query that detects whether the user's operating system has requested a dark color theme, automatically applying dark token values.
* **Q67: What is an optimistic UI update and where is it used?**
  * *Answer:* Updating the user interface immediately before the backend server confirms the write. Used in `Home.jsx` where `likeCount` increments instantly when the user taps the heart.
* **Q68: What is controlled vs uncontrolled input in React?**
  * *Answer:* In a controlled input, form state is driven by React state (`value={name} onChange={...}`). In an uncontrolled input, the DOM handles form data, read via refs or form submit events (`e.target.email.value`).
* **Q69: What is React Fiber?**
  * *Answer:* React's internal reconciliation engine introduced to enable incremental rendering, pause/resume work, and prioritize user interactions over background updates.
* **Q70: How does `useNavigate` work?**
  * *Answer:* A React Router hook returning an imperative navigation function that pushes or replaces history entries in the browser's History API without triggering a full page reload.
* **Q71: What is the purpose of `useParams` in `Profile.jsx`?**
  * *Answer:* Reads dynamic URL segment parameters matching the route definition (e.g. extracting `id` from `/food-partner/:id`).
* **Q72: What is the difference between `package.json` and `package-lock.json`?**
  * *Answer:* `package.json` defines semantic version ranges (`^19.1.1`), while `package-lock.json` pins the exact resolved versions and cryptographic integrity hashes of every dependency in the tree.
* **Q73: What is Vite's Fast Refresh?**
  * *Answer:* An HMR enhancement that allows editing React components in development while preserving their active component state without reloading the page.
* **Q74: What is prop drilling and did you encounter it?**
  * *Answer:* Passing props through intermediate components that do not need them. In our app, `<ReelFeed items={videos} onLike={likeVideo} />` directly accepts props without intermediate drilling.
* **Q75: What is an Error Boundary in React?**
  * *Answer:* A React class component that catches JavaScript errors anywhere in its child component tree, logs the error, and displays a fallback UI instead of crashing the entire application.

---

## Part 5: Backend & Express 5 Internals (Q76 – Q100)

* **Q76: What is the Node.js Event Loop?**
  * *Answer:* A single-threaded runtime loop that coordinates non-blocking asynchronous I/O by offloading operations (network, file system) to the OS kernel and libuv thread pool, processing callbacks through microtask and macrotask queues.
* **Q77: What is the difference between microtasks and macrotasks?**
  * *Answer:* Microtasks (`Promise.then`, `process.nextTick`, `queueMicrotask`) execute immediately after the current operation finishes and before the event loop yields to the next macrotask (`setTimeout`, `setInterval`, `setImmediate`, I/O).
* **Q78: What are the main improvements in Express 5 over Express 4?**
  * *Answer:* Express 5 natively handles rejected promises in route handlers and middleware without requiring third-party libraries like `express-async-errors`.
* **Q79: What is Express middleware?**
  * *Answer:* A function with signature `(req, res, next)` that has access to the request, response, and next middleware function, used to execute code, modify request objects, or end request-response cycles.
* **Q80: What happens if a middleware does not call `next()` and does not respond?**
  * *Answer:* The HTTP request hangs indefinitely until the client or server times out.
* **Q81: How does Multer process multipart form data?**
  * *Answer:* It parses incoming `multipart/form-data` boundary streams. Under `multer.memoryStorage()`, it writes the binary chunks into a single contiguous Node.js `Buffer` stored at `req.file.buffer`.
* **Q82: What is a Buffer in Node.js?**
  * *Answer:* A global class representing a fixed-size chunk of raw binary memory allocated outside V8's garbage-collected heap.
* **Q83: What is the difference between `process.env` and config files?**
  * *Answer:* `process.env` dynamically injects runtime environment variables, keeping secrets outside code repositories. Config files provide application defaults.
* **Q84: What is graceful shutdown in Node.js?**
  * *Answer:* Intercepting termination signals (`SIGTERM`, `SIGINT`), stopping the HTTP server from accepting new connections, finishing in-flight requests, and closing database connections cleanly before exiting.
* **Q85: How does Mongoose connect to MongoDB?**
  * *Answer:* In `db.js`, `mongoose.connect(process.env.MONGODB_URI)` initiates an asynchronous connection using the MongoDB Node.js driver's connection pool.
* **Q86: What is Mongoose Schema vs Model?**
  * *Answer:* A Schema defines the document structure, field types, validators, and default values. A Model is a compiled constructor compiled from the schema that provides the interface for querying and writing documents.
* **Q87: What is the `$inc` operator in MongoDB?**
  * *Answer:* An atomic field update operator that increments or decrements a numeric field by a specified value directly in the database engine without reading the document into memory first.
* **Q88: Why is `$inc` safer than `item.likeCount = item.likeCount + 1; item.save()`?**
  * *Answer:* Reading and saving creates a classic Read-Modify-Write race condition. If two requests read `likeCount: 5` at the same instant, both will write `6`, losing one like. `$inc` executes atomically in the database engine, ensuring both increment correctly to `7`.
* **Q89: What does Mongoose `.populate()` do behind the scenes?**
  * *Answer:* It performs an internal secondary query or `$lookup` aggregation, matching the referenced `_id` against the target collection and replacing the ObjectId with the populated document.
* **Q90: What is the N+1 query problem with `.populate()`?**
  * *Answer:* If you loop over N documents and execute a separate database query for each document's relation, you execute N+1 database roundtrips. Mongoose mitigates this by batching all IDs into a single `$in` query.
* **Q91: What is the difference between `findById` and `findOne`?**
  * *Answer:* `findById(id)` is syntactic sugar for `findOne({ _id: id })` with automatic ObjectId casting.
* **Q92: What is the purpose of `foodPartner.toObject()` in `food-partner.controller.js`?**
  * *Answer:* Mongoose query results are complex Mongoose Document instances with internal getters and methods. Calling `.toObject()` strips internal metadata, converting it into a plain JavaScript object so new properties (`foodItems`) can be attached.
* **Q93: How do you handle file upload size limits in Multer?**
  * *Answer:* By passing a `limits` configuration object: `multer({ limits: { fileSize: 50 * 1024 * 1024 } })`.
* **Q94: What is the difference between synchronous and asynchronous code in Node?**
  * *Answer:* Synchronous code blocks the single-threaded event loop until execution finishes, freezing all concurrent requests. Asynchronous code delegates tasks to libuv or the OS and executes callbacks when results arrive, keeping the server responsive.
* **Q95: What is CORS and why does it exist?**
  * *Answer:* Cross-Origin Resource Sharing is a browser security mechanism that prevents malicious web pages on one domain from making unauthorized requests to a different domain using the victim's credentials.
* **Q96: What is the purpose of `express.json()`?**
  * *Answer:* It parses incoming requests with `Content-Type: application/json` and populates `req.body` with the parsed JavaScript object.
* **Q97: What happens if an unhandled promise rejection occurs in Node 22?**
  * *Answer:* In modern Node.js versions, unhandled promise rejections terminate the Node process with a non-zero exit code by default.
* **Q98: What is the difference between `PUT` and `PATCH`?**
  * *Answer:* `PUT` completely replaces the target resource with the new representation. `PATCH` applies partial modifications to specific fields.
* **Q99: What is idempotency in REST APIs?**
  * *Answer:* An HTTP method is idempotent if making multiple identical requests has the exact same side-effect on the server as making a single request (`GET`, `PUT`, `DELETE` are idempotent; `POST` is not).
* **Q100: How do you organize routes in Express?**
  * *Answer:* Using `express.Router()`, modularizing route definitions into separate files by resource (`auth.routes.js`, `food.routes.js`) and mounting them in `app.js` via `app.use()`.

---

## Part 6: Database & Data Modeling (Q101 – Q125)

* **Q101: Why use referencing over embedding for likes in this project?**
  * *Answer:* Referencing avoids hitting MongoDB's 16MB document size limit and prevents high write fragmentation. If 500,000 users like a reel, an embedded array of user IDs would bloat the food document and degrade query performance.
* **Q102: What is a compound unique index?**
  * *Answer:* An index across multiple fields (e.g. `{ user: 1, food: 1 }`) that enforces uniqueness on the combination of those fields, guaranteeing a user cannot like the same food twice.
* **Q103: What is the difference between B-tree indexes and Hash indexes in MongoDB?**
  * *Answer:* B-tree indexes support range queries, sorting, and equality lookups. Hash indexes only support exact equality matches. MongoDB uses B-trees by default.
* **Q104: What is write concern in MongoDB?**
  * *Answer:* A setting that describes the level of acknowledgment requested from MongoDB for write operations (e.g. `w: 1` acknowledges write on the primary; `w: "majority"` acknowledges write across a majority of replica set nodes).
* **Q105: What is read preference in MongoDB?**
  * *Answer:* Determines how client read queries are routed across a replica set (e.g. `primary`, `secondaryPreferred`).
* **Q106: How do you optimize slow queries in MongoDB?**
  * *Answer:* Use `.explain("executionStats")` to inspect query execution plans, verify index usage, and ensure `totalDocsExamined` matches `nReturned`.
* **Q107: What is the difference between soft delete and hard delete?**
  * *Answer:* Hard delete permanently removes the document (`deleteOne()`). Soft delete marks a flag (`isDeleted: true`), preserving historical data for audit and recovery.
* **Q108: What is a TTL (Time-To-Live) index?**
  * *Answer:* A single-field index on a date field that automatically deletes documents after a specified number of seconds, ideal for expiring sessions or temporary tokens.
* **Q109: What is MongoDB replica set?**
  * *Answer:* A cluster of MongoDB instances that maintain the same data set, providing high availability, automatic failover, and redundancy.
* **Q110: What is MongoDB sharding?**
  * *Answer:* Distributing data across multiple physical machines using a shard key to support horizontal scaling beyond the hardware limits of a single server.
* **Q111: What is an aggregation pipeline?**
  * *Answer:* A framework for multi-stage data processing (filtering, grouping, reshaping, projecting) where documents pass through a sequence of pipeline stages (`$match`, `$group`, `$sort`, `$project`).
* **Q112: What is ACID compliance in MongoDB?**
  * *Answer:* Single-document writes are always atomic in MongoDB. Since version 4.0, MongoDB also supports multi-document distributed ACID transactions across replica sets and sharded clusters.
* **Q113: What is an unindexed query called in MongoDB?**
  * *Answer:* A **Collection Scan (`COLLSCAN`)**, which inspects every single document in the collection and destroys database performance at scale.
* **Q114: How does Mongoose casting work?**
  * *Answer:* When data is assigned to a schema field, Mongoose automatically converts it to the defined type (e.g. casting a 24-character hex string into a `mongoose.Types.ObjectId`).
* **Q115: What is the purpose of `timestamps: true` in Mongoose schemas?**
  * *Answer:* It automatically creates and manages `createdAt` and `updatedAt` Date fields on the document.
* **Q116: How do you handle database connection drops in Node.js?**
  * *Answer:* Attach listeners to Mongoose connection events: `mongoose.connection.on('disconnected', ...)` and implement exponential backoff reconnection.
* **Q117: What is data denormalization?**
  * *Answer:* Storing redundant copies of data across documents (such as caching `likeCount` directly on `Food`) to optimize read performance and avoid expensive join queries.
* **Q118: How do you ensure database consistency when updating both `likes` and `foods`?**
  * *Answer:* In production, wrap both operations inside a multi-document transaction using `session = await mongoose.startSession()` and `session.withTransaction()`.
* **Q119: What is the difference between SQL schemas and NoSQL document schemas?**
  * *Answer:* SQL schemas enforce strict columnar structures at the database engine level. NoSQL databases allow polymorphic, flexible document structures, with schema enforcement handled at the application layer via Mongoose.
* **Q120: What is an ObjectId made of?**
  * *Answer:* A 12-byte BSON value consisting of: a 4-byte timestamp, a 5-byte random value unique to the machine and process, and a 3-byte incrementing counter.
* **Q121: Can you extract the creation date from an ObjectId?**
  * *Answer:* Yes, via `objectId.getTimestamp()`, which decodes the first 4 bytes of the identifier.
* **Q122: What is a covered query in MongoDB?**
  * *Answer:* A query where all fields requested in the projection are included in the index itself, allowing MongoDB to return results directly from RAM without loading documents from disk.
* **Q123: What is BSON?**
  * *Answer:* Binary JSON: a binary serialization format used by MongoDB to store documents, supporting rich data types like Date, ObjectId, and binary buffers that JSON lacks.
* **Q124: What is connection pool exhaustion?**
  * *Answer:* When all available database connections in the pool are busy executing slow queries, forcing new incoming requests to queue and eventually time out.
* **Q125: How do you prevent database injection in Mongoose?**
  * *Answer:* Mongoose automatically parameterizes queries against schema types, preventing string injection attacks.

---

## Part 7: Performance, Scaling & Video Streaming (Q126 – Q150)

* **Q126: Why is streaming raw MP4 problematic on cellular networks?**
  * *Answer:* Raw MP4 files require downloading large chunks before playback can start and do not adapt to fluctuating network speeds, causing severe video buffering and data waste.
* **Q127: What is HLS (HTTP Live Streaming)?**
  * *Answer:* An adaptive streaming protocol that breaks videos into short 2-to-6 second segments (`.ts` or `.m4s`) and serves them via an `.m3u8` playlist with multiple quality tiers (360p, 720p, 1080p). The player automatically switches quality based on real-time bandwidth.
* **Q128: What is HTTP 206 Partial Content?**
  * *Answer:* A status code returned when a client requests a specific byte range of a video file using the `Range` header (e.g. `Range: bytes=0-1048576`), allowing efficient video seeking and chunk streaming.
* **Q129: What is layout thrashing in the browser?**
  * *Answer:* Repeatedly reading and writing DOM geometry properties (like `offsetHeight`, `getBoundingClientRect`) in the same frame, forcing the browser to perform synchronous layout recalculations and dropping frame rates below 60fps.
* **Q130: How does `IntersectionObserver` eliminate layout thrashing?**
  * *Answer:* It gathers intersection calculations during the browser's render pipeline off the main thread and delivers batched intersection entries in a single asynchronous callback.
* **Q131: What is Time to First Byte (TTFB)?**
  * *Answer:* The duration from the moment the browser makes an HTTP request to the moment it receives the very first byte of response data from the server or CDN.
* **Q132: What is the purpose of CDN edge caching?**
  * *Answer:* Storing static assets (videos, images, bundles) on geographically distributed Point-of-Presence (POP) servers close to users, drastically reducing latency and offloading traffic from origin servers.
* **Q133: How does V8 garbage collection affect video playback?**
  * *Answer:* If a web application frequently allocates and discards large JavaScript objects during scrolling, V8 initiates Stop-The-World garbage collection pauses, causing noticeable stuttering (jank).
* **Q134: How do you profile memory leaks in React?**
  * *Answer:* Open Chrome DevTools -> Memory tab -> take Heap Snapshots before and after scrolling the feed to check for retained detached HTMLVideoElement DOM nodes.
* **Q135: What is code splitting in Vite?**
  * *Answer:* Splitting the JavaScript bundle into smaller chunks that load on demand (e.g. via dynamic `import()`), reducing initial page load time and improving Core Web Vitals (LCP, INP).
* **Q136: What is the difference between horizontal and vertical scaling?**
  * *Answer:* Vertical scaling increases hardware resources (CPU, RAM) on a single machine. Horizontal scaling adds more independent server instances behind a load balancer.
* **Q137: What is cache stampede (thundering herd)?**
  * *Answer:* When a popular cached key expires, thousands of concurrent requests miss the cache simultaneously and hit the database at the exact same moment, crashing the database.
* **Q138: How do you prevent cache stampede?**
  * *Answer:* By using mutual exclusion distributed locks (mutex) or probabilistic early expiration (XFetch algorithm) to allow only one worker to regenerate the cache while serving stale data to others.
* **Q139: What is Little's Law?**
  * *Answer:* An operational queuing formula: $L = \lambda \times W$, meaning the average number of concurrent requests in a system ($L$) equals arrival rate ($\lambda$) multiplied by average processing latency ($W$).
* **Q140: What is the 99th percentile (p99) latency?**
  * *Answer:* The latency threshold under which 99% of all requests complete. It highlights worst-case experiences for outliers that average latency masks.
* **Q141: What is a Reverse Proxy?**
  * *Answer:* A server (like Nginx or HAProxy) positioned in front of web servers to handle SSL termination, load balancing, compression, and request routing.
* **Q142: How does gzip/brotli compression improve API performance?**
  * *Answer:* It compresses JSON response payloads over the wire by up to 70–80%, reducing bandwidth consumption and accelerating network transfer times.
* **Q143: What is the difference between HTTP/1.1 and HTTP/2?**
  * *Answer:* HTTP/1.1 suffers from head-of-line blocking on single TCP connections. HTTP/2 introduces binary framing, request multiplexing over a single connection, and header compression (HPACK).
* **Q144: What is DNS prefetching?**
  * *Answer:* Informing the browser to resolve the DNS of external media domains early (`<link rel="dns-prefetch" href="https://ik.imagekit.io">`), cutting initial media latency.
* **Q145: How do you prevent memory leaks with event listeners?**
  * *Answer:* Always return a cleanup function in `useEffect` that calls `removeEventListener` or `observer.disconnect()`.
* **Q146: What is database connection pooling?**
  * *Answer:* Maintaining a pool of open database TCP connections that are reused across incoming HTTP requests, avoiding the heavy overhead of creating a new socket handshake per query.
* **Q147: How does client-side presigned upload architecture work?**
  * *Answer:* Client requests an upload token from Express -> Express generates a signed AWS S3/ImageKit URL with restricted permissions -> Client uploads video binary directly to S3/ImageKit -> Client notifies Express to persist the resulting CDN URL.
* **Q148: What is the difference between latency and throughput?**
  * *Answer:* Latency is the time it takes for a single request to complete (measured in milliseconds). Throughput is the number of requests the system can process concurrently per second (RPS).
* **Q149: How does browser caching work with `Cache-Control: immutable`?**
  * *Answer:* Tells the browser that the response body will never change over its lifetime, preventing the browser from sending conditional revalidation requests (`304 Not Modified`) when the user refreshes.
* **Q150: What would you change if you rebuilt this project from scratch?**
  * *Answer:* (1) Implement client-side presigned uploads to bypass Node.js RAM limits, (2) transcode videos into adaptive HLS streams via AWS MediaConvert, (3) cache the hot feed in Redis, (4) implement cursor pagination on the feed, and (5) add automated multimodal dish tagging using Google Gemini 1.5 Flash.

---

## Part 8: Behavioral & Engineering Reflection (Q151 – Q155)

* **Q151: What was the hardest technical challenge in this project and how did you solve it?**
  * *Answer:* Managing video playback lifecycle across a vertical scroll list. Initially, videos would either fight for audio focus or consume excessive memory. I solved it by binding an `IntersectionObserver` with an exact 60% visibility threshold heuristic and maintaining video refs in a mutable `useRef` Map to avoid re-rendering React trees during scrolling.
* **Q152: How did you ensure security across dual user roles?**
  * *Answer:* By separating consumer and merchant collections, hashing passwords with bcrypt (10 rounds), and deploying distinct Express authorization middlewares that verify JWT signatures and validate role records in the database before granting route execution.
* **Q153: Tell me about a trade-off you knowingly made.**
  * *Answer:* I used Multer memory storage to upload video buffers directly to ImageKit. This allowed an extremely fast MVP without provisioning S3 buckets or local disk cleanup jobs, but I knowingly accepted the risk of high RAM consumption during concurrent large uploads.
* **Q154: How did you handle errors across layers?**
  * *Answer:* In the backend, try/catch blocks in async controllers intercept Mongoose and JWT errors, returning uniform HTTP error codes (400, 401, 404). In the frontend, Axios catch blocks catch network errors, and video play promises are caught to comply with browser autoplay policies.
* **Q155: What questions do you have for our engineering team?**
  * *Answer:* (1) What does your current media and video ingestion pipeline look like at scale? (2) How does your team approach caching and database sharding for high-frequency social feeds? (3) What CI/CD and automated testing standards are required before deploying to production?
