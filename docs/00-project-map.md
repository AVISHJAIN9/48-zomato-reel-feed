# Step 1: Project Map & Codebase Scan

This document provides a comprehensive structural scan of the **Zomato Reel Feed** codebase, including directory hierarchies, detected dependencies, environment configurations, and entry points.

---

## 1. Full Folder Tree & Purpose

```text
55-zomato-reel-feed/
├── package.json                         # Workspace root package config with unified scripts & docs dependencies
├── package-lock.json                    # Workspace root lockfile
├── docs/                                # Vue.js-style VitePress technical documentation source
│   ├── .vitepress/                      # VitePress configuration, theme overrides, and plugins
│   │   ├── config.js                    # VitePress site config (nav, sidebar, search, withMermaid wrapper)
│   │   └── theme/
│   │       ├── index.js                 # Theme export extending DefaultTheme with pure-black CSS
│   │       └── custom.css               # Pure black dark-mode tokens, custom borders, and layout styling
│   ├── index.md                         # Documentation portal homepage with feature hero cards
│   ├── 00-project-type.md               # Step 0 Pre-Check: Project type detection and concrete code evidence
│   ├── 00a-project-analysis.md          # Step 0: End-to-end full project analysis with Mermaid diagrams
│   ├── 00b-project-pitch.md             # 30-second, 2-minute, and 3-minute interview pitches
│   ├── 00-project-map.md                # Step 1: Complete folder tree, tech dependencies, env vars, and entry points
│   ├── 01-features.md                   # Step 2: Master feature inventory (F1 to F15)
│   ├── 02-build-order.md                # Step 3: Rebuild order from scratch with line-by-line code explanation
│   ├── 03-api-reference.md              # Step 4: Comprehensive REST API reference & payload specs
│   ├── 04-tech-comparisons.md           # Step 5: Exhaustive tech choice comparisons with trade-off matrices
│   ├── 05-architecture.md               # Step 6: Architecture diagrams, request lifecycles, and scaling analysis
│   ├── 06-security.md                   # Step 7: Security audit mapped to OWASP Top 10 vulnerabilities
│   ├── 07-ai-integration.md             # Step 8: AI integration deep dive & production multimodal vision blueprint
│   ├── 08-quality-and-ops.md            # Step 9: Engineering quality, testing roadmap, CI/CD, and bottlenecks
│   ├── 09-interview-qa.md               # Step 10: 150+ Technical interview questions and in-depth answers
│   ├── 10-gaps-and-improvements.md      # Step 11: Production gaps and prioritized improvement roadmap
│   ├── 11-glossary.md                   # Step 12: Technical terms and domain glossary
│   ├── 12-confirm-list.md               # Step 12: List of all developer assumptions [CONFIRM WITH DEVELOPER]
│   ├── 13-master-checklist.md           # Master Checklist: 275 items evaluated with 7-part breakdown
│   ├── 14-say-it-out-loud.md            # Step 2.5: All feature spoken scripts and rehearsal checklist
│   ├── features/                        # Dedicated feature write-up files
│   │   ├── 01-user-auth.md              # Consumer registration, login, logout, and JWT session handling
│   │   ├── 02-partner-auth.md           # Food partner onboarding, credential verification, and sessions
│   │   ├── 03-video-feed.md             # Vertical reel playback, IntersectionObserver, like & save interactions
│   │   ├── 04-food-creation.md          # Multi-part video upload, Multer memory storage & ImageKit CDN pipeline
│   │   ├── 05-partner-profile.md        # Merchant profile landing page, metadata badges, and video gallery
│   │   └── 06-infrastructure-shared.md  # CORS configuration, cookie credentials, and auth middleware gates
│   └── system-design/                   # Step 14: System Design Deep Dive (19 modules + decisions log)
│       ├── README.md                    # System design syllabus and architectural index
│       ├── index.md                     # System design landing overview
│       ├── 14.1-requirements-estimation.md
│       ├── 14.2-architecture-styles.md
│       ├── 14.3-networking-communication.md
│       ├── 14.4-load-balancing-scaling.md
│       ├── 14.5-databases-storage.md
│       ├── 14.6-caching.md
│       ├── 14.7-messaging-queues.md
│       ├── 14.8-consistency-concurrency.md
│       ├── 14.9-reliability-resilience.md
│       ├── 14.10-api-design-rate-limiting.md
│       ├── 14.11-security-architecture.md
│       ├── 14.12-search-ai-architecture.md
│       ├── 14.13-real-time-systems.md
│       ├── 14.14-observability-operations.md
│       ├── 14.15-performance-engineering.md
│       ├── 14.16-cost-tradeoffs.md
│       ├── 14.17-classic-system-design-problems.md
│       └── decisions.md                 # Master design decisions audit log
└── zomato/                              # Application monorepo root
    ├── backend/                         # Express 5 Node.js REST API
    │   ├── .env.example                 # Environment variables blueprint
    │   ├── package.json                 # Backend dependencies and metadata
    │   ├── package-lock.json            # Exact backend dependency tree
    │   ├── server.js                    # Server startup script: connects DB and listens on port 3000
    │   └── src/
    │       ├── app.js                   # Express app setup: CORS, cookie-parser, JSON parsing, routes mounting
    │       ├── db/
    │       │   └── db.js                # Mongoose connection logic using process.env.MONGODB_URI
    │       ├── middlewares/
    │       │   └── auth.middleware.js   # JWT token extraction and role verification (user & foodPartner)
    │       ├── models/
    │       │   ├── user.model.js        # Consumer user schema (fullName, email, bcrypt password)
    │       │   ├── foodpartner.model.js # Restaurant partner schema (business name, contact, phone, address, email, password)
    │       │   ├── food.model.js        # Food reel schema (name, description, video CDN URL, partner ref, counters)
    │       │   ├── likes.model.js       # Relational like join schema (user ref, food ref, timestamps)
    │       │   └── save.model.js        # Relational bookmark join schema (user ref, food ref, timestamps)
    │       ├── controllers/
    │       │   ├── auth.controller.js   # Register, login, and logout handlers for both user and foodPartner
    │       │   ├── food.controller.js   # Food reel creation, feed listing, like toggle, and save toggle handlers
    │       │   └── food-partner.controller.js # Food partner profile retrieval with associated food items
    │       ├── routes/
    │       │   ├── auth.routes.js       # Authentication route definitions (/api/auth/...)
    │       │   ├── food.routes.js       # Food feed and engagement route definitions (/api/food/...)
    │       │   └── food-partner.routes.js # Partner profile route definitions (/api/food-partner/...)
    │       └── services/
    │           └── storage.service.js   # ImageKit SDK client wrapper for uploading video buffers to cloud CDN
    ├── frontend/                        # React 19 Single Page Application built with Vite
    │   ├── index.html                   # HTML5 shell containing the #root mounting node
    │   ├── vite.config.js               # Vite configuration with React SWC/Babel plugin
    │   ├── package.json                 # Frontend dependencies and scripts
    │   ├── package-lock.json            # Exact frontend dependency tree
    │   ├── eslint.config.js             # ESLint flat config with React Hooks & Refresh rules
    │   ├── public/                      # Static assets served as-is
    │   └── src/
    │       ├── main.jsx                 # Client entry point: mounts App component to DOM root
    │       ├── App.jsx                  # Root wrapper importing global styles and AppRoutes
    │       ├── App.css                  # High-level reset and app container styles
    │       ├── assets/                  # Frontend bundled vector graphics and assets
    │       ├── styles/
    │       │   ├── theme.css            # System-aware CSS variables (colors, typography, spacing, shadows)
    │       │   ├── reels.css            # Snap-scrolling vertical reel feed and action overlay styling
    │       │   ├── bottom-nav.css       # Fixed mobile bottom navigation bar styling
    │       │   ├── auth-shared.css      # Auth forms, card containers, inputs, and button styling
    │       │   ├── create-food.css      # Drag-and-drop video dropzone and creation form styling
    │       │   └── profile.css          # Restaurant partner header, metrics pills, and video grid styling
    │       ├── components/
    │       │   ├── ReelFeed.jsx         # Core vertical feed: IntersectionObserver autoplay, like & save buttons
    │       │   └── BottomNav.jsx        # Sticky navigation bar linking Home and Saved routes
    │       ├── pages/
    │       │   ├── auth/
    │       │   │   ├── ChooseRegister.jsx     # Landing screen offering choice between User and FoodPartner
    │       │   │   ├── UserRegister.jsx       # Consumer sign-up form
    │       │   │   ├── UserLogin.jsx          # Consumer sign-in form
    │       │   │   ├── FoodPartnerRegister.jsx# Restaurant partner registration form
    │       │   │   └── FoodPartnerLogin.jsx   # Restaurant partner sign-in form
    │       │   ├── general/
    │       │   │   ├── Home.jsx               # Main feed page: fetches /api/food and binds like/save actions
    │       │   │   └── Saved.jsx              # Bookmarked feed page: fetches /api/food/save
    │       │   └── food-partner/
    │       │       ├── CreateFood.jsx         # Partner video upload page with drag-and-drop & blob preview
    │       │       └── Profile.jsx            # Partner public profile page showing catalog video grid
    │       └── routes/
    │           └── AppRoutes.jsx        # React Router DOM v7 browser router configuration
    └── vdeos/                           # Local sample MP4 videos for testing and seeding uploads
        ├── 1583289-hd_712_1366_20fps.mp4
        ├── 3198245-hd_720_1280_50fps.mp4
        ├── 3298011-hd_1080_2048_25fps.mp4
        ├── 4058071-hd_1080_2048_25fps.mp4
        ├── 5900834-hd_1080_2048_25fps.mp4
        └── 6202680-hd_1080_1920_25fps.mp4
```

---

## 2. Tech Stack & Exact Detected Versions

| Technology / Layer | Exact Version | Source | Role in Application |
|---|---|---|---|
| **Node.js Runtime** | `v22.23.2` | Engine environment | Server runtime executing backend services |
| **Express** | `^5.1.0` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Next-gen HTTP REST server, middleware engine & routing |
| **Mongoose** | `^8.17.1` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | ODM schema modeling, validation, and MongoDB driver wrapper |
| **React** | `^19.1.1` | [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json) | Latest React UI library utilizing concurrent rendering features |
| **React DOM** | `^19.1.1` | [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json) | DOM renderer for React components |
| **React Router DOM** | `^7.8.0` | [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json) | Client-side routing, navigation state, and route matching |
| **Vite** | `^7.1.2` | [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json) | Lightning-fast ESM frontend bundler and development server |
| **Axios** | `^1.11.0` | [`zomato/frontend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/package.json) | Promise-based HTTP client with automatic JSON serialization |
| **ImageKit SDK** | `^6.0.0` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Media upload API and CDN image/video transformations |
| **Multer** | `^2.0.2` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Multipart/form-data handler configured in memory storage mode |
| **JSONWebToken** | `^9.0.2` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | HMAC SHA256 digital signature creation and verification |
| **BcryptJS** | `^3.0.2` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | One-way salted password hashing (10 salt rounds) |
| **Cookie-Parser** | `^1.4.7` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Middleware parsing HTTP Cookie header into `req.cookies` |
| **CORS** | `^2.8.5` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Cross-Origin Resource Sharing middleware enabling credentials |
| **Dotenv** | `^17.2.1` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Injects key-value pairs from `.env` into `process.env` |
| **UUID** | `^11.1.0` | [`zomato/backend/package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/package.json) | Generates cryptographically secure v4 UUIDs for uploaded files |
| **VitePress** | `^1.6.4` | [`package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/package.json) | Documentation generation site generator powered by Vite & Vue |
| **Mermaid** | `^11.17.2` | [`package.json`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/package.json) | Text-to-diagram rendering engine for architectural flows |

---

## 3. Dependency Inventory & Justification

### Backend Dependencies (`zomato/backend/package.json`)
1. **`express` (`^5.1.0`)**: High-performance HTTP server providing routing, middleware pipeline, and JSON parsing. Version 5 natively supports promises in route handlers without unhandled rejection traps.
2. **`mongoose` (`^8.17.1`)**: MongoDB object modeling tool providing schema validation, casting, middleware hooks, and aggregation helpers.
3. **`bcryptjs` (`^3.0.2`)**: Pure JavaScript implementation of bcrypt for hashing passwords with 10 salt rounds to defend against rainbow table attacks.
4. **`jsonwebtoken` (`^9.0.2`)**: Signs and verifies compact URL-safe JWT tokens encoding user ID for stateless session tracking.
5. **`cookie-parser` (`^1.4.7`)**: Extracts incoming HTTP cookie headers and populates `req.cookies`, vital for reading the `token` cookie.
6. **`cors` (`^2.8.5`)**: Configures `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true` to permit cross-origin cookies.
7. **`dotenv` (`^17.2.1`)**: Loads environment variables from `.env` file at application bootstrap.
8. **`multer` (`^2.0.2`)**: Intercepts `multipart/form-data` uploads and holds video binary files in `req.file.buffer` (in-memory storage).
9. **`imagekit` (`^6.0.0`)**: Official Node.js SDK for ImageKit, uploading media buffers to cloud object storage and returning CDN URLs.
10. **`uuid` (`^11.1.0`)**: Generates collision-free unique filenames (`uuidv4()`) for video uploads to avoid file overwrite collisions on ImageKit.

### Frontend Dependencies (`zomato/frontend/package.json`)
1. **`react` (`^19.1.1`)**: Core component rendering library, managing DOM virtual reconciliation and hook lifecycles.
2. **`react-dom` (`^19.1.1`)**: Bridges React component trees to the browser DOM.
3. **`react-router-dom` (`^7.8.0`)**: Declarative client-side routing, providing `<BrowserRouter>`, `<Routes>`, `<Route>`, `<NavLink>`, `useNavigate`, and `useParams`.
4. **`axios` (`^1.11.0`)**: Client HTTP library configured with `withCredentials: true` to seamlessly transmit cookies during authentication, liking, and bookmarking.
5. **`vite` (`^7.1.2`)**: Development server using native ES modules for sub-millisecond HMR (Hot Module Replacement) and optimized production rollups.
6. **`@vitejs/plugin-react` (`^5.0.0`)**: Vite plugin providing Fast Refresh support for React 19 JSX transforms.

---

## 4. Environment Variables & Secrets Reference

All secrets are kept in [`zomato/backend/.env`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/.env) (modeled by `.env.example`). Values must never be committed to Git.

| Variable Name | Service / Provider | Purpose | Where Read in Code | How to Obtain |
|---|---|---|---|---|
| `JWT_SECRET` | Internal Application | HMAC-SHA256 secret key used to digitally sign and verify auth tokens | [`zomato/backend/src/controllers/auth.controller.js:30,69,119,161`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L30) & [`auth.middleware.js:17,46`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/middlewares/auth.middleware.js#L17) | Generate using terminal: `openssl rand -base64 32` |
| `MONGODB_URI` | MongoDB / MongoDB Atlas | Connection string URI pointing to the database cluster including auth credentials and db name | [`zomato/backend/src/db/db.js:6`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/db/db.js#L6) | Obtain from MongoDB Atlas cluster dashboard -> Connect -> Drivers, or local `mongodb://localhost:27017/zomato-reels` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit.io | Public identifier for ImageKit account, used for client initialization | [`zomato/backend/src/services/storage.service.js:4`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js#L4) | ImageKit Dashboard -> Developer Options -> API Keys |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit.io | Secret key required to authorize server-side media upload requests | [`zomato/backend/src/services/storage.service.js:5`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js#L5) | ImageKit Dashboard -> Developer Options -> API Keys |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit.io | Base CDN URL prefix for accessing media assets (e.g. `https://ik.imagekit.io/your_id/`) | [`zomato/backend/src/services/storage.service.js:6`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js#L6) | ImageKit Dashboard -> Developer Options -> URL-endpoint |

---

## 5. Third-Party Services & External APIs

1. **MongoDB Atlas / Local MongoDB:**
   - **Type:** Document Database
   - **Protocol:** Wire Protocol over TCP (`mongodb://` or `mongodb+srv://`)
   - **Usage:** Stores User, FoodPartner, Food, Like, and Save collections.
2. **ImageKit Media Cloud:**
   - **Type:** Media Asset Management & CDN
   - **Protocol:** HTTPS REST API (`https://upload.imagekit.io/api/v1/files/upload`)
   - **Usage:** Ingestion of short food reel videos (up to ~100MB), automatic transcoding, and global CDN delivery.

---

## 6. Application Entry Points

### 1. Backend Server Entry Point
* **File:** [`zomato/backend/server.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/server.js)
* **Lifecycle:**
  1. Executes `require('dotenv').config()` to initialize process environment.
  2. Calls `connectDB()` from [`src/db/db.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/db/db.js).
  3. Imports configured Express app from [`src/app.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/app.js).
  4. Invokes `app.listen(3000)` to bind the HTTP server to port 3000.

### 2. Frontend Client Entry Point
* **File:** [`zomato/frontend/src/main.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/main.jsx)
* **Lifecycle:**
  1. Queries DOM for element with id `#root` defined in [`index.html`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/index.html).
  2. Creates concurrent React root using `createRoot(document.getElementById('root'))`.
  3. Mounts `<App />` which imports `theme.css` and instantiates `<AppRoutes />`.

### 3. Documentation Site Entry Point
* **File:** [`docs/.vitepress/config.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/docs/.vitepress/config.js)
* **Lifecycle:**
  1. Loaded by `vitepress dev docs --port 5174` or `vitepress build docs`.
  2. Wraps VitePress configuration in `withMermaid` to compile all sequence, flow, ER, and state diagrams.
  3. Serves the interactive docs portal on `http://localhost:5174`.
