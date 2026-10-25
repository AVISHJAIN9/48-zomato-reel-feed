# Step 2: Master Feature Inventory (F1 – F15)

This document is the master registry of all features implemented across the **Zomato Reel Feed** application. Each feature is cross-referenced with exact files, function signatures, parameters, database schemas, edge cases, and spoken interview explanations.

---

## Feature Index

| ID | Feature Name | Primary Role | Frontend Component | Backend Controller | Status |
|---|---|---|---|---|---|
| **F1** | Consumer Registration & Session | Consumer | `UserRegister.jsx` | `authController.registerUser` | Implemented |
| **F2** | Consumer Login & Session | Consumer | `UserLogin.jsx` | `authController.loginUser` | Implemented |
| **F3** | Consumer Session Invalidation (Logout) | Consumer | `auth.routes.js` | `authController.logoutUser` | Implemented |
| **F4** | Food Partner Registration & Session | Merchant | `FoodPartnerRegister.jsx` | `authController.registerFoodPartner` | Implemented |
| **F5** | Food Partner Login & Session | Merchant | `FoodPartnerLogin.jsx` | `authController.loginFoodPartner` | Implemented |
| **F6** | Food Partner Logout | Merchant | `auth.routes.js` | `authController.logoutFoodPartner` | Implemented |
| **F7** | Video Reel Feed & Autoplay | Consumer | `Home.jsx` / `ReelFeed.jsx` | `foodController.getFoodItems` | Implemented |
| **F8** | Reel Like / Unlike (Atomic Counter) | Consumer | `Home.jsx` / `ReelFeed.jsx` | `foodController.likeFood` | Implemented |
| **F9** | Reel Save / Bookmark (Atomic Counter)| Consumer | `Home.jsx` / `ReelFeed.jsx` | `foodController.saveFood` | Implemented |
| **F10** | Bookmarked Reels Collection Screen | Consumer | `Saved.jsx` / `ReelFeed.jsx` | `foodController.getSaveFood` | Implemented |
| **F11** | Food Video Upload & ImageKit CDN | Merchant | `CreateFood.jsx` | `foodController.createFood` | Implemented |
| **F12** | Merchant Profile & Dish Catalog | Public / Consumer | `Profile.jsx` | `foodPartnerController.getFoodPartnerById` | Implemented |
| **F13** | Multi-Role Navigation & Routing | All | `BottomNav.jsx` / `AppRoutes.jsx` | N/A (Client-Side) | Implemented |
| **F14** | Cross-Origin Cookies & CORS | All | `axios` client config | `app.use(cors(...))` | Implemented |
| **F15** | Role-Guarding Auth Middlewares | Backend Security | N/A | `auth.middleware.js` | Implemented |

---

## Detailed Feature Registry

### F1: Consumer User Registration
* **Summary:** Registration of consumer accounts with fullName, email, and bcrypt-hashed password. Automatically logs the user in via JWT cookie.
* **Code Reference:** [`UserRegister.jsx:11-33`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/UserRegister.jsx#L11-L33) & [`auth.controller.js:6-43`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L6-L43).
* **Data Touched:** `users` collection in MongoDB. Unique index on `email`.
* **APIs Involved:** `POST /api/auth/user/register`.
* **Say It Out Loud:**
  > "When a consumer signs up, our React registration form sends their name, email, and password to `/api/auth/user/register`. The controller verifies email uniqueness in MongoDB, hashes the password using bcrypt with 10 rounds, writes the record, signs a stateless JWT containing the user ID, and sends it back in a cookie so they are immediately authenticated."

### F2: Consumer User Login
* **Summary:** Authenticates returning consumers against stored bcrypt hash, issuing a JWT session cookie.
* **Code Reference:** [`UserLogin.jsx:10-25`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/UserLogin.jsx#L10-L25) & [`auth.controller.js:45-81`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L45-L81).
* **Data Touched:** `users` collection (read query).
* **APIs Involved:** `POST /api/auth/user/login`.
* **Say It Out Loud:**
  > "To log in consumers, `loginUser` finds the account by email and compares the plaintext password against the stored bcrypt hash. If valid, it signs a JWT, sets it in a cookie, and redirects the user to the discovery feed."

### F3: Consumer User Logout
* **Summary:** Stateless session clearing via cookie invalidation.
* **Code Reference:** [`auth.routes.js:9`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L9) & [`auth.controller.js:83-88`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L83-L88).
* **APIs Involved:** `GET /api/auth/user/logout`.
* **Say It Out Loud:**
  > "Logging out triggers `res.clearCookie('token')`, which instructs the client browser to delete the authentication token."

### F4: Food Partner Registration
* **Summary:** Merchant onboarding with store name, contact, phone, address, email, and password.
* **Code Reference:** [`FoodPartnerRegister.jsx:11-36`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/FoodPartnerRegister.jsx#L11-L36) & [`auth.controller.js:91-134`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L91-L134).
* **Data Touched:** `foodpartners` collection. Unique index on `email`.
* **APIs Involved:** `POST /api/auth/food-partner/register`.
* **Say It Out Loud:**
  > "For restaurants, `registerFoodPartner` validates email uniqueness, hashes the password with bcrypt, persists the store location and contact info into `foodpartners`, and issues a merchant JWT cookie routing them to `/create-food`."

### F5: Food Partner Login
* **Summary:** Authenticates food partners and redirects to upload studio.
* **Code Reference:** [`FoodPartnerLogin.jsx:10-25`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/FoodPartnerLogin.jsx#L10-L25) & [`auth.controller.js:136-172`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L136-L172).
* **APIs Involved:** `POST /api/auth/food-partner/login`.
* **Say It Out Loud:**
  > "Partner login validates credentials against `foodpartners` and sets a session cookie allowing partners to manage their dish catalog."

### F6: Food Partner Logout
* **Summary:** Clears partner session cookie.
* **Code Reference:** [`auth.controller.js:174-179`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L174-L179).
* **APIs Involved:** `GET /api/auth/food-partner/logout`.
* **Say It Out Loud:**
  > "Partner logout clears the session cookie from the browser."

### F7: Video Reel Feed & Autoplay on 60% Intersection
* **Summary:** Full-screen vertical video feed with snap-scrolling and automated play/pause management.
* **Code Reference:** [`Home.jsx:10-19`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L10-L19) & [`ReelFeed.jsx:13-31`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/ReelFeed.jsx#L13-L31) & [`food.controller.js:25-31`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L25-L31).
* **Data Touched:** `foods` collection.
* **APIs Involved:** `GET /api/food`.
* **Say It Out Loud:**
  > "Our main feed fetches dish reels from `/api/food`. In `ReelFeed.jsx`, an `IntersectionObserver` monitors every video element; when one occupies 60% or more of the viewport, it calls `video.play()` muted and looping, pausing off-screen videos to guarantee 60fps mobile scrolling."

### F8: Reel Like / Unlike (Atomic Counter Toggle)
* **Summary:** Toggleable like button updating `likes` collection and atomically incrementing/decrementing `likeCount`.
* **Code Reference:** [`Home.jsx:23-35`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L23-L35) & [`food.controller.js:34-72`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L34-L72).
* **Data Touched:** `likes` collection (create/delete) & `foods` collection (`$inc: { likeCount: 1 or -1 }`).
* **APIs Involved:** `POST /api/food/like`.
* **Say It Out Loud:**
  > "Tapping the heart icon checks the `likes` collection: if found, it deletes the record and applies `$inc: { likeCount: -1 }`; if not, it creates the like and applies `$inc: { likeCount: 1 }`."

### F9: Reel Save / Bookmark (Atomic Counter Toggle)
* **Summary:** Bookmarks dish reel to user's saved list, maintaining atomic `savesCount`.
* **Code Reference:** [`Home.jsx:37-45`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L37-L45) & [`food.controller.js:74-113`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L74-L113).
* **Data Touched:** `saves` collection & `foods` collection.
* **APIs Involved:** `POST /api/food/save`.
* **Say It Out Loud:**
  > "Bookmarking toggles records in the `saves` collection alongside an atomic `$inc` update on the dish's `savesCount`."

### F10: Saved Reels Collection Screen
* **Summary:** View bookmarked reels populated with dish details.
* **Code Reference:** [`Saved.jsx:9-23`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Saved.jsx#L9-L23) & [`food.controller.js:115-130`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L115-L130).
* **Data Touched:** `saves` populated with `foods`.
* **APIs Involved:** `GET /api/food/save`.
* **Say It Out Loud:**
  > "The Saved screen calls `/api/food/save`, where Mongoose populates saved food documents, rendering them in the same smooth `ReelFeed` component."

### F11: Food Video Upload & ImageKit Cloud CDN
* **Summary:** Drag-and-drop video upload, Multer memory buffering, ImageKit CDN ingestion, and MongoDB record creation.
* **Code Reference:** [`CreateFood.jsx:50-67`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/food-partner/CreateFood.jsx#L50-L67), [`storage.service.js:9-16`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/services/storage.service.js#L9-L16), [`food.controller.js:8-23`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L8-L23).
* **Data Touched:** `foods` collection & ImageKit Cloud Media Storage.
* **APIs Involved:** `POST /api/food`.
* **Say It Out Loud:**
  > "Partners drag a video into `CreateFood.jsx`, which shows an instant local preview using `URL.createObjectURL`. On submission, Multer buffers the binary in memory, `storageService` uploads it to ImageKit with a unique UUID, and the resulting CDN URL is saved in MongoDB linked to the partner's account."

### F12: Merchant Profile & Video Catalog
* **Summary:** Restaurant landing page displaying location, stats pills, and 3-column video catalog grid.
* **Code Reference:** [`Profile.jsx:11-18`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/food-partner/Profile.jsx#L11-L18) & [`food-partner.controller.js:4-23`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food-partner.controller.js#L4-L23).
* **Data Touched:** `foodpartners` & `foods`.
* **APIs Involved:** `GET /api/food-partner/:id`.
* **Say It Out Loud:**
  > "Tapping 'Visit store' opens `/food-partner/:id`, where `getFoodPartnerById` combines the restaurant's address and info with all their published reels into a 3-column video grid."

### F13: Multi-Role Navigation & App Shell
* **Summary:** Sticky mobile bottom navigation with active tab indication and role-based onboarding routes.
* **Code Reference:** [`BottomNav.jsx:9-29`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/BottomNav.jsx#L9-L29) & [`AppRoutes.jsx:14-30`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/routes/AppRoutes.jsx#L14-L30).
* **Say It Out Loud:**
  > "I built mobile-first bottom navigation using React Router's `NavLink` with dynamic active class evaluation, tying our feed, saved items, and role-based onboarding together."

### F14: Cross-Origin Cookies & CORS
* **Summary:** Enables credentialed cookie transfer between Vite (:5173) and Express (:3000).
* **Code Reference:** [`app.js:10-13`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/app.js#L10-L13).
* **Say It Out Loud:**
  > "I configured Express CORS with `origin: 'http://localhost:5173'` and `credentials: true`, paired with Axios `withCredentials: true`, allowing secure cross-origin cookie authentication."

### F15: Role-Guarding Auth Middlewares
* **Summary:** Custom Express middlewares verifying JWT cookies and attaching `req.user` or `req.foodPartner`.
* **Code Reference:** [`auth.middleware.js:6-62`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/middlewares/auth.middleware.js#L6-L62).
* **Say It Out Loud:**
  > "Our two custom auth middlewares check incoming JWT cookies, verify signatures, load the database entity, and protect routes so consumers cannot upload dishes and unauthenticated requests are blocked with a 401."
