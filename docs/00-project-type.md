# Step 0 Pre-Check: Project Type Detection

## Detected Project Type

**Track A: Full Stack MERN Application (Frontend + Backend + MongoDB) with Cloud Video Storage**

> **AI Integration Status:** **No AI integration implemented** in the current codebase. There are no external AI SDKs (OpenAI, Gemini, Anthropic, Hugging Face, Groq, Ollama) and no custom machine learning models trained or integrated. In accordance with Rule 8 and Rule 2, all AI sections will clearly declare the reality: **No AI integration currently present / Not implemented**, and document the exact architecture required to add multimodal AI dish classification, automated reel tagging, and intelligent vector recommendations.

---

## Concrete Code Evidence

### 1. Frontend Evidence
* **Package File:** [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json)
  * Framework: React `^19.1.1` & React DOM `^19.1.1`
  * Routing: React Router DOM `^7.8.0` ([`zomato/frontend/src/routes/AppRoutes.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/routes/AppRoutes.jsx))
  * HTTP Client: Axios `^1.11.0` with credentials enabled
  * Bundler & Dev Tooling: Vite `^7.1.2`, `@vitejs/plugin-react` `^5.0.0`, ESLint `^9.33.0`
  * Architecture: Single Page Application (SPA) with custom CSS variables theming ([`zomato/frontend/src/styles/theme.css`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/styles/theme.css))

### 2. Backend Evidence
* **Package File:** [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json)
  * Web Framework: Express `^5.1.0` ([`zomato/backend/src/app.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/app.js))
  * Runtime & Entrypoint: Node.js CommonJS, [`zomato/backend/server.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/server.js)
  * ODM / Data Layer: Mongoose `^8.17.1` ([`zomato/backend/src/db/db.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/db/db.js))
  * Security & Auth: `bcryptjs` `^3.0.2`, `jsonwebtoken` `^9.0.2`, `cookie-parser` `^1.4.7`, `cors` `^2.8.5`
  * File Uploads & Media: `multer` `^2.0.2` (memory storage buffer), `imagekit` `^6.0.0` (cloud video CDN), `uuid` `^11.1.0`

### 3. Database & Schemas Evidence
* Schemas located in [`zomato/backend/src/models/`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models):
  * `User`: [`user.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/user.model.js) (Consumer accounts with fullName, unique email, bcrypt hash)
  * `FoodPartner`: [`foodpartner.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/foodpartner.model.js) (Restaurant/merchant accounts with business name, contact, phone, address, email, password)
  * `Food`: [`food.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/food.model.js) (Video reels with CDN URL, description, foodPartner ObjectId reference, likeCount, savesCount)
  * `Like`: [`likes.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/likes.model.js) (Join document referencing user and food)
  * `Save`: [`save.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/save.model.js) (Bookmark document referencing user and food)

### 4. Cloud Integration Evidence
* **Cloud Media Provider:** ImageKit (`imagekit` SDK v6.0.0) configured in [`zomato/backend/src/services/storage.service.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js) using environment variables `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `IMAGEKIT_URL_ENDPOINT`.

---

## Applied Documentation Tracks

| Section | Track Strategy |
|---|---|
| **Architecture & Full-Stack Lifecycle** | Full Track A execution: covers client, Express API, MongoDB queries, JWT cookies, and ImageKit CDN. |
| **Frontend Deep Dive** | React 19 hooks (`useRef`, `useEffect`, `useState`, `useMemo`), React Router DOM 7, custom IntersectionObserver autoplay reel system. |
| **Backend & API Deep Dive** | Express 5 routing, custom role-based auth middleware, Mongoose aggregation & indexing, Multer memory storage. |
| **AI Integration** | Declared as **Not Implemented**; provides production upgrade blueprint for Multimodal Gemini Food Tagging & Vector Search. |
| **System Design & Scaling** | Monolith to microservices, video streaming bottlenecks (HLS/DASH vs MP4), Redis caching, CDN edge delivery. |
