# Step 12: Confirm With Developer List

This document aggregates all assumptions, architectural inferences, and design decisions flagged with **[CONFIRM WITH DEVELOPER]** across the documentation. Review this list to verify that the inferred rationale matches your original design intent.

---

## Assumptions & Inferences for Developer Verification

| Item # | Topic | Document Reference | Inferred Developer Choice | Verification Status |
|---|---|---|---|---|
| **1** | **Choice of MongoDB over Relational SQL** | [`04-tech-comparisons.md`](./04-tech-comparisons.md) | Inferred: MongoDB was chosen for rapid schema prototyping, seamless JSON/BSON manipulation without ORM mapping friction, and native atomic `$inc` operators for like/save counters. | `[PENDING DEVELOPER CONFIRMATION]` |
| **2** | **Choice of ImageKit.io over AWS S3 + CloudFront** | [`04-tech-comparisons.md`](./04-tech-comparisons.md) | Inferred: ImageKit was chosen because it bundles object storage, automatic video optimization, and a global CDN into a single lightweight Node.js SDK, avoiding complex AWS IAM, S3 bucket CORS, and CloudFront distributions. | `[PENDING DEVELOPER CONFIRMATION]` |
| **3** | **Choice of JWT in Cookies over LocalStorage** | [`04-tech-comparisons.md`](./04-tech-comparisons.md) | Inferred: Cookies were chosen over LocalStorage to provide security against client-side script token theft (XSS) and maintain stateless horizontal scaling without a Redis session store. | `[PENDING DEVELOPER CONFIRMATION]` |
| **4** | **Choice of React 19 over Next.js / Vue** | [`04-tech-comparisons.md`](./04-tech-comparisons.md) | Inferred: React 19 was selected to leverage fine-grained hooks (`useRef`, `useEffect`) for DOM video node management and IntersectionObserver bindings without SSR hydration complexity. | `[PENDING DEVELOPER CONFIRMATION]` |
| **5** | **Multer Memory Storage Choice** | [`04-tech-comparisons.md`](./04-tech-comparisons.md) | Inferred: `multer.memoryStorage()` was chosen instead of disk storage to avoid ephemeral container disk exhaustion and allow direct buffer streaming to ImageKit. | `[PENDING DEVELOPER CONFIRMATION]` |
| **6** | **Absence of Pre-Trained AI in MVP** | [`07-ai-integration.md`](./07-ai-integration.md) | Inferred: AI integration was intentionally deferred to Phase 2 to prioritize core media streaming and role-based authentication foundation before adding multimodal vision tagging. | `[PENDING DEVELOPER CONFIRMATION]` |
| **7** | **Static Mock Metrics on Partner Profile** | [`Profile.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/food-partner/Profile.jsx#L39-L45) | Inferred: Stats pills (`profile?.totalMeals`, `profile?.customersServed`) are UI placeholders designed for future order-tracking database integration. | `[PENDING DEVELOPER CONFIRMATION]` |
| **8** | **CORS Port Pinning (5173)** | [`app.js:10-13`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/app.js#L10-L13) | Inferred: The backend is hardcoded to `http://localhost:5173` for local Vite development and will need an environment variable `CLIENT_ORIGIN` for production deployment. | `[PENDING DEVELOPER CONFIRMATION]` |
| **9** | **ImageKit Timeout & Retry Strategy** | [`03-api-reference.md`](./03-api-reference.md) | Inferred: The current ImageKit upload call uses the default SDK HTTP socket timeout without custom retry loops or exponential backoff wrappers. | `[PENDING DEVELOPER CONFIRMATION]` |
| **10** | **Session Lifetime & Cookie Expiry** | [`auth.controller.js:32`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L32) | Inferred: Auth cookies currently default to browser session lifetime (deleted on browser close) rather than persistent multi-day expiration. | `[PENDING DEVELOPER CONFIRMATION]` |
