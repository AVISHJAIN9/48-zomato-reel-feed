# Step 11: Production Gaps & Improvement Roadmap

This document outlines architectural, security, and performance gaps in the current **Zomato Reel Feed** implementation, ranked in order of critical production severity with concrete remediation strategies.

---

## Ranked Production Gaps Matrix

| Rank | Gap Area | Severity | Impact on Production | Recommended Solution |
|---|---|---|---|---|
| **1** | **Multer In-Memory Video Buffering** | **CRITICAL** | Risk of Node.js Out-Of-Memory (OOM) heap crash under concurrent large uploads. | Switch to client-side direct presigned S3/ImageKit uploads. |
| **2** | **Unpaginated Database Feed (`foodModel.find({})`)** | **CRITICAL** | Linear query degradation; database memory exhaustion at scale. | Implement cursor-based infinite pagination using `_id` / `createdAt`. |
| **3** | **Missing Cookie Security Attributes** | **HIGH** | Cookies lack `httpOnly`, `secure`, and `sameSite` flags; vulnerable to XSS/CSRF. | Harden cookie configuration options in `auth.controller.js`. |
| **4** | **Missing Rate Limiting & Brute Force Defense** | **HIGH** | Endpoints vulnerable to credential stuffing and DDoS attacks. | Mount `express-rate-limit` with Redis storage. |
| **5** | **Absence of Compound Unique Indexes on Likes/Saves** | **HIGH** | Race conditions allow users to create duplicate like/save records. | Add compound unique index `{ user: 1, food: 1 }` to Mongoose schemas. |
| **6** | **Missing Automated Test Suites (Unit / Integration / E2E)**| **HIGH** | High regression risk during refactoring; zero CI validation. | Implement Vitest for unit tests and Supertest for API integration tests. |
| **7** | **Raw MP4 Video Streaming vs Adaptive HLS** | **MEDIUM** | High mobile data consumption and video buffering on cellular connections. | Integrate FFmpeg / AWS MediaConvert for multi-bitrate HLS (`.m3u8`). |
| **8** | **Missing Centralized Structured Logging & Observability** | **MEDIUM** | Plain `console.log()` statements lack correlation IDs and log levels. | Introduce Pino or Winston with Datadog/Sentry integration. |
| **9** | **Hardcoded API URLs in Frontend** | **LOW** | Complicates multi-environment deployment (staging vs production). | Replace hardcoded URLs with `import.meta.env.VITE_API_BASE_URL`. |
| **10** | **Missing Centralized Express Error Handling Middleware** | **LOW** | Route failures produce inconsistent error formats. | Mount standard 4-parameter error handler `(err, req, res, next)`. |

---

## Detailed Remediation Blueprints

### 1. Fix Multer Memory Buffering (Presigned Uploads)
* **Current Vulnerable Pattern:**
  ```javascript
  const upload = multer({ storage: multer.memoryStorage() });
  router.post('/', upload.single("mama"), foodController.createFood);
  ```
* **Production Fix (Client-Side Direct Upload):**
  Instead of routing video binaries through Node.js, the client calls `/api/food/presigned-url` to receive a secure signed upload signature from ImageKit/AWS S3, then uploads directly to cloud storage, bypassing the application server.

---

### 2. Implement Cursor-Based Feed Pagination
* **Current Vulnerable Pattern:**
  ```javascript
  const foodItems = await foodModel.find({});
  ```
* **Production Fix:**
  ```javascript
  async function getFoodItems(req, res) {
      const limit = parseInt(req.query.limit) || 10;
      const cursor = req.query.cursor; // Last seen _id
      const query = cursor ? { _id: { $lt: cursor } } : {};
      
      const foodItems = await foodModel.find(query)
          .sort({ _id: -1 })
          .limit(limit);

      const nextCursor = foodItems.length === limit ? foodItems[foodItems.length - 1]._id : null;
      res.status(200).json({ foodItems, nextCursor });
  }
  ```

---

### 3. Harden Cookie Security Flags
* **Current Vulnerable Pattern:**
  ```javascript
  res.cookie("token", token);
  ```
* **Production Fix:**
  ```javascript
  res.cookie("token", token, {
      httpOnly: true, // Shields cookie from XSS document.cookie attacks
      secure: process.env.NODE_ENV === "production", // Enforces TLS transmission
      sameSite: "strict", // Blocks CSRF requests from third-party sites
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7-day expiration
  });
  ```

---

### 4. Enforce Compound Unique Indexes on Likes & Saves
* **Production Fix (`likes.model.js` & `save.model.js`):**
  ```javascript
  likeSchema.index({ user: 1, food: 1 }, { unique: true });
  saveSchema.index({ user: 1, food: 1 }, { unique: true });
  ```

---

### 5. Add API Rate Limiting
* **Production Fix (`src/middlewares/rateLimiter.js`):**
  ```javascript
  const rateLimit = require('express-rate-limit');

  const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Max 10 attempts per IP
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many authentication requests, please try again later." }
  });

  module.exports = { authLimiter };
  ```
