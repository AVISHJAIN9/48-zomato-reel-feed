# Step 2.5: Say It Out Loud – Master Interview Rehearsal Scripts

This page consolidates the spoken interview explanations for all 15 features across the **Zomato Reel Feed** project. 

Each script is written in **first-person spoken English**, following this exact conversational cadence:
1. What the feature does and why a user needs it.
2. How it works step by step from user action to database/cloud and back, citing real components, routes, and controllers.
3. Why this approach was chosen and the primary alternative rejected.
4. How failures, edge cases, and errors are handled.
5. One honest limitation and how you would improve it in production.

---

## F1: Consumer User Registration

> "When a consumer wants to join our platform, they fill out their first name, last name, email, and password on our React registration screen.
> 
> When they submit, my frontend handler in `UserRegister.jsx` formats the payload and sends an Axios POST request to our Express backend at `/api/auth/user/register` with credentials enabled.
> 
> On the server side, `registerUser` first queries the MongoDB `users` collection to ensure that the email isn't already registered. If it is, I return a 400 Bad Request immediately. 
> 
> If the email is unique, I pass the plaintext password through `bcrypt.hash` with 10 salt rounds so we never store unencrypted credentials. Then I persist the user document via Mongoose, sign a JSON Web Token containing their newly generated MongoDB `_id`, and set that token directly in the browser's cookies before returning a 201 response.
> 
> I chose JWT cookies over traditional server-side Redis sessions because JWTs are completely stateless, allowing our API to scale horizontally behind a load balancer without sticky session bottlenecks.
> 
> If the database connection drops during registration, Mongoose throws an error which Express captures. One limitation I would address in production is adding the `httpOnly` and `sameSite` flags to the cookie options to prevent malicious client scripts from reading the token."

---

## F2: Consumer User Login

> "To authenticate returning consumers, I built the login flow in `UserLogin.jsx`.
> 
> When the user submits their credentials, an Axios POST is dispatched to `/api/auth/user/login`. The controller first looks up the user document by email. If no account matches, or if `bcrypt.compare` indicates the password hash does not match, I return a 400 status with the generic message 'Invalid email or password'.
> 
> Using an identical message for both missing accounts and bad passwords was a deliberate security choice to defend against account enumeration and brute-force harvesting.
> 
> Once validated, I sign a JWT using our `JWT_SECRET`, attach it to the response as a cookie, and return the sanitized user profile, prompting the client to route the user to `/`."

---

## F3: Consumer User Logout

> "For logging out consumers, I built a lightweight GET endpoint at `/api/auth/user/logout`.
> 
> When invoked, the controller calls Express's `res.clearCookie('token')` method, which sends a Set-Cookie header instructing the browser to immediately expire the authentication cookie.
> 
> Because our authentication is stateless, clearing the client-side cookie is sufficient for session termination without making expensive database writes.
> 
> If we needed enterprise-grade instant revocation across all devices, I would introduce a Redis token blocklist checked during middleware verification."

---

## F4: Food Partner Registration

> "To onboard merchant restaurants, I created a dedicated partner registration pipeline.
> 
> When a merchant submits their business details on `/food-partner/register`, our React component bundles their commercial address, telephone number, business name, and contact person into an Axios call to `/api/auth/food-partner/register`.
> 
> In Express, `registerFoodPartner` queries our `foodpartners` collection to check whether an account with that business email exists. If a collision is found, it sends back a 400 status.
> 
> Otherwise, I hash their credentials with bcrypt at 10 rounds, create the merchant record in MongoDB, sign a JWT with the partner's unique ID, and dispatch it in a cookie.
> 
> I kept Food Partners in a separate MongoDB collection from regular consumers because merchants have fundamentally different operational schemas—such as physical store locations and contact numbers—and need strict authorization checks to prevent regular users from publishing unauthorized food reels."

---

## F5: Food Partner Login

> "When a food partner returns to publish new content, they log in via `FoodPartnerLogin.jsx`.
> 
> The form handler transmits the email and password to `/api/auth/food-partner/login`. The controller validates that the partner exists in `foodpartners` and checks the password with `bcrypt.compare`.
> 
> Upon successful verification, a JWT token is created and stored in the cookie header, returning an HTTP 200 payload that immediately routes the merchant to `/create-food` so they can upload fresh reels."

---

## F6: Food Partner Logout

> "The partner logout endpoint at `/api/auth/food-partner/logout` calls `res.clearCookie('token')`.
> 
> This clears the authentication cookie from the browser, concluding the merchant's session cleanly without lingering state on the server."

---

## F7: Video Reel Feed & Viewport Intersection Autoplay

> "The centerpiece of Zomato Reel Feed is our vertical video feed in `Home.jsx` and `ReelFeed.jsx`.
> 
> When a user loads the app, the frontend hits `/api/food` with their auth cookie. Once the backend verifies the user's JWT, it queries the `foods` collection and returns our video list.
> 
> The real engineering challenge was managing video playback performance. If you render twenty video elements on a mobile browser and rely on scroll event listeners, the main thread stutters, battery drains rapidly, and multiple audio tracks can clash.
> 
> To solve this, I designed `ReelFeed.jsx` using the browser's native `IntersectionObserver` API. I hold references to every video tag inside a `useRef` Map so attaching refs never causes re-renders. 
> 
> I configured the observer with a multi-step threshold. When an observed video enters at least 60% of the active viewport, `video.play()` is invoked inside an unhandled promise catch block to comply with browser autoplay policies. The second it dips below 60%, `video.pause()` executes immediately.
> 
> This guarantees that only the single video the user is actively focused on consumes decoding resources, delivering a silky smooth 60fps scrolling experience."

---

## F8: Reel Like / Unlike (Atomic Counter Toggle)

> "For our engagement system, I built an atomic like/unlike toggle in `food.controller.js`.
> 
> When a user taps the heart icon on a reel, the client sends a POST request with the `foodId` to `/api/food/like`. The controller looks for an existing record in our `likes` collection matching both the user's ID and the food ID.
> 
> If a record exists, the user is unliking the dish: I call `likeModel.deleteOne()` and simultaneously update the food document using MongoDB's atomic `$inc: { likeCount: -1 }`. If no record exists, I create the like document and increment `likeCount` by 1 using `$inc: { likeCount: 1 }`.
> 
> I specifically avoided embedding user ID arrays inside the food document because an array of hundreds of thousands of user IDs would bloat the document and eventually crash against MongoDB's 16MB BSON limit. By pairing a dedicated join collection with an atomic counter on the food document, we get O(1) read performance on the feed with atomic write safety."

---

## F9: Reel Save / Bookmark (Atomic Counter Toggle)

> "Saving dishes functions similarly to our like pipeline. When the user taps the bookmark icon, `saveFood` in `food.controller.js` queries our `saves` collection.
> 
> If the record is present, it deletes the document and decrements `savesCount` on the food item using `$inc`. If absent, it creates the bookmark document and increments `savesCount`.
> 
> The client then optimistically reflects the new save counter without needing to reload the entire feed."

---

## F10: Saved Reels Collection Screen

> "To let users review dishes they've saved for dinner or weekend dining, I built the Saved page at `/saved`.
> 
> When mounted, `Saved.jsx` makes a GET request to `/api/food/save`. On the server side, `getSaveFood` finds all records in `saves` matching the authenticated user ID and uses Mongoose's `.populate('food')` method to join the complete food details.
> 
> On the client, I flatten the populated response array and feed it directly into our reusable `ReelFeed` component, giving users the exact same smooth autoplay and interaction capabilities in their personal bookmarks as on the main discovery feed."

---

## F11: Food Video Upload & ImageKit Cloud CDN

> "The media ingestion pipeline in `CreateFood.jsx` is one of the most critical parts of the application.
> 
> When a restaurant partner wants to showcase a dish, they drag a short video file onto our custom dropzone. To deliver an instant, zero-latency user experience, my React code uses `URL.createObjectURL(videoFile)` to mount an immediate video preview element in the browser before any byte touches the network.
> 
> When the partner clicks 'Save Food', the client bundles the video binary, title, and description into a `FormData` object and dispatches it with credentials to `/api/food`.
> 
> On our Express server, the request first passes through `authFoodPartnerMiddleware` to confirm that the requester is a verified food partner. It then hits Multer, configured with `memoryStorage()`, which buffers the incoming video directly into `req.file.buffer`.
> 
> From there, my controller calls `storageService.uploadFile()`, passing the raw buffer and a cryptographically unique UUID generated with the `uuid` package to prevent file collisions. 
> 
> ImageKit processes the video, stores it on their media cloud, and returns a secure CDN URL. Finally, my controller writes a new document to the `foods` collection in MongoDB, linking the CDN URL with the merchant's `_id`, and returns a 201 status to redirect the partner to the live feed.
> 
> An alternative I evaluated was storing files directly on the server's local disk. I rejected local disk storage because serverless and containerized hosts have ephemeral filesystems that wipe upon restart, and holding large video files on disk makes horizontal autoscaling impossible.
> 
> The trade-off I accepted with memory buffers is Node.js heap usage during concurrent uploads. For a 100x traffic surge, I would upgrade this flow to use direct client-side presigned upload URLs so large video binaries bypass our Node API servers entirely."

---

## F12: Merchant Profile & Video Catalog

> "To connect dish discovery with actual restaurant orders, I built the merchant profile feature in `Profile.jsx` and `food-partner.controller.js`.
> 
> When a consumer taps 'Visit store' on any reel overlay, React Router navigates them to `/food-partner/:id`. The component reads the restaurant ID from the URL and dispatches a GET request to `/api/food-partner/:id`.
> 
> On the backend, `getFoodPartnerById` performs two queries: first, it fetches the merchant document from `foodpartners` to get the store's verified business name and physical address; second, it queries our `foods` collection where `foodPartner` matches the ID to pull their entire dish catalog.
> 
> If the partner doesn't exist, I return a 404 immediately. Otherwise, I convert the Mongoose document to a plain object, attach the food items array, and send back a 200 payload.
> 
> On the frontend, I render a clean header displaying their address and operational badges, followed by an Instagram-style three-column video grid of their uploaded reels.
> 
> One optimization I would make for higher scale is indexing the `foodPartner` foreign key on the `foods` collection and adding pagination so restaurants with hundreds of dishes don't dump their entire catalog in a single unindexed query."

---

## F13: Navigation & Multi-Role App Shell

> "To provide an app-like mobile experience in the browser, I designed `BottomNav.jsx` using React Router's `NavLink` component.
> 
> The component uses function-as-children class evaluation to dynamically apply the `.is-active` state based on URL matching, giving users an immediate visual cue whether they are on the discovery feed or their bookmarked collection.
> 
> In `AppRoutes.jsx`, I cleanly separated general consumer screens from merchant onboarding paths, providing an intuitive onboarding gateway in `ChooseRegister.jsx`."

---

## F14: Cross-Origin Cookies & CORS Configuration

> "Because our client and API run on separate ports during development—5173 and 3000—browsers trigger strict Cross-Origin Resource Sharing security checks.
> 
> By default, browsers refuse to send or accept cookies across different origins. To solve this, I configured the `cors` package in `app.js` with `origin: 'http://localhost:5173'` and `credentials: true`.
> 
> On the frontend, every Axios call includes `{ withCredentials: true }`. This dual configuration ensures that our signed JWT session cookies travel safely back and forth without wildcard vulnerabilities."

---

## F15: Role-Guarding Auth Middlewares

> "To enforce security and role-based access control, I created two custom Express middlewares in `auth.middleware.js`: `authUserMiddleware` and `authFoodPartnerMiddleware`.
> 
> When a request hits a protected route, the middleware inspects `req.cookies.token`. If the cookie is missing, it immediately rejects the call with a 401 'Please login first'.
> 
> If present, it passes the token through `jwt.verify` wrapped in a try/catch block. If the token is signed with our secret, it extracts the decoded ID and queries the respective collection—`users` or `foodpartners`—attaching the full entity to the request object before calling `next()`.
> 
> This guarantees that downstream controllers like `createFood` have instant, verified access to `req.foodPartner._id` without writing repetitive authentication code in every handler."

---

## Rehearsal Checklist

Tick each feature once you have successfully explained it out loud, without reading notes, in under the targeted rehearsal time:

- [ ] **F1: Consumer Registration & Session** *(Target: ~45 seconds / ~12 lines)*
- [ ] **F2: Consumer Login & Session** *(Target: ~35 seconds / ~10 lines)*
- [ ] **F3: Consumer Session Invalidation (Logout)** *(Target: ~20 seconds / ~6 lines)*
- [ ] **F4: Food Partner Registration & Session** *(Target: ~45 seconds / ~12 lines)*
- [ ] **F5: Food Partner Login & Session** *(Target: ~30 seconds / ~8 lines)*
- [ ] **F6: Food Partner Logout** *(Target: ~20 seconds / ~5 lines)*
- [ ] **F7: Video Reel Feed & Viewport Intersection Autoplay** *(Target: ~60 seconds / ~18 lines)*
- [ ] **F8: Reel Like / Unlike (Atomic Counter Toggle)** *(Target: ~45 seconds / ~14 lines)*
- [ ] **F9: Reel Save / Bookmark (Atomic Counter Toggle)** *(Target: ~35 seconds / ~10 lines)*
- [ ] **F10: Saved Reels Collection Screen** *(Target: ~35 seconds / ~10 lines)*
- [ ] **F11: Food Video Upload & ImageKit Cloud CDN** *(Target: ~75 seconds / ~22 lines)*
- [ ] **F12: Merchant Profile & Video Catalog** *(Target: ~45 seconds / ~14 lines)*
- [ ] **F13: Navigation & Multi-Role App Shell** *(Target: ~25 seconds / ~7 lines)*
- [ ] **F14: Cross-Origin Cookies & CORS Configuration** *(Target: ~30 seconds / ~8 lines)*
- [ ] **F15: Role-Guarding Auth Middlewares** *(Target: ~40 seconds / ~12 lines)*
