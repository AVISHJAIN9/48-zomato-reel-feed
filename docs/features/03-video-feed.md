# Feature Group 3: Video Reel Feed & Interactions (F7 – F10)

This section covers the core consumer experience: full-screen vertical video playback with viewport-based autoplay, atomic liking, bookmarking, and the saved reels collection.

---

## F7: Video Reel Feed & Viewport Intersection Autoplay

### Overview & User-Facing Behavior
Provides an infinite, snap-scrolling vertical video reel experience. When a video crosses 60% visibility in the mobile viewport, it begins playing with audio muted and loops continuously. Any video scrolled out of view pauses instantly to optimize system memory, GPU load, and mobile network consumption.

### Files and Functions Involved
* [`zomato/frontend/src/pages/general/Home.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx):
  * `useEffect` ([lines 10–19](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L10-L19)): Initiates feed fetch via Axios.
  * `likeVideo(item)` ([lines 23–35](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L23-L35)): Handles like toggling.
  * `saveVideo(item)` ([lines 37–45](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L37-L45)): Handles bookmark toggling.
* [`zomato/frontend/src/components/ReelFeed.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/ReelFeed.jsx):
  * `IntersectionObserver` setup ([lines 13–31](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/ReelFeed.jsx#L13-L31)): Monitors active video elements using threshold array `[0, 0.25, 0.6, 0.9, 1]`.
  * `setVideoRef(id)` ([lines 33–36](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/components/ReelFeed.jsx#L33-L36)): Curates a `Map()` of HTML5 video elements stored in `useRef`.
* [`zomato/backend/src/routes/food.routes.js:21-23`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/food.routes.js#L21-L23): `router.get('/', authMiddleware.authUserMiddleware, foodController.getFoodItems)`.
* [`zomato/backend/src/controllers/food.controller.js:25-31`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L25-L31): `getFoodItems`.

### Key Implementation Mechanics
```javascript
// Excerpt from ReelFeed.jsx lines 13-31
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target
      if (!(video instanceof HTMLVideoElement)) return
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        video.play().catch(() => { /* ignore autoplay errors */ })
      } else {
        video.pause()
      }
    })
  },
  { threshold: [0, 0.25, 0.6, 0.9, 1] }
)
```

### Say It Out Loud (Spoken Interview Script)
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

### Overview & User-Facing Behavior
Allows consumers to like or unlike a dish reel by clicking the Heart icon. The like count updates dynamically on the UI, and the user's like state is persisted in MongoDB.

### Files and Functions Involved
* [`zomato/frontend/src/pages/general/Home.jsx:23-35`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L23-L35): `likeVideo(item)` toggles like state in local component state.
* [`zomato/backend/src/routes/food.routes.js:26-28`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/food.routes.js#L26-L28): `router.post('/like', authMiddleware.authUserMiddleware, foodController.likeFood)`.
* [`zomato/backend/src/controllers/food.controller.js:34-72`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L34-L72): `likeFood`.
* [`zomato/backend/src/models/likes.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/likes.model.js): Relational schema with `user` and `food` ObjectIds.

### Data Model & Concurrency Design
Instead of maintaining an unbounded array of user IDs inside the `Food` document (which risks hitting MongoDB's 16MB document size limit and causes massive document growth/fragmentation), likes are stored in a dedicated `likes` collection. To avoid running an expensive `$lookup` count every time a reel is loaded, the parent `Food` document maintains an integer `likeCount` incremented or decremented atomically via `$inc`.

### Say It Out Loud (Spoken Interview Script)
> "For our engagement system, I built an atomic like/unlike toggle in `food.controller.js`.
> 
> When a user taps the heart icon on a reel, the client sends a POST request with the `foodId` to `/api/food/like`. The controller looks for an existing record in our `likes` collection matching both the user's ID and the food ID.
> 
> If a record exists, the user is unliking the dish: I call `likeModel.deleteOne()` and simultaneously update the food document using MongoDB's atomic `$inc: { likeCount: -1 }`. If no record exists, I create the like document and increment `likeCount` by 1 using `$inc: { likeCount: 1 }`.
> 
> I specifically avoided embedding user ID arrays inside the food document because an array of hundreds of thousands of user IDs would bloat the document and eventually crash against MongoDB's 16MB BSON limit. By pairing a dedicated join collection with an atomic counter on the food document, we get O(1) read performance on the feed with atomic write safety."

---

## F9: Reel Save / Bookmark (Atomic Counter Toggle)

### Overview & User-Facing Behavior
Enables consumers to bookmark dishes to a private collection. The bookmark counter increments/decrements atomically and updates the UI state.

### Files and Functions Involved
* [`zomato/frontend/src/pages/general/Home.jsx:37-45`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Home.jsx#L37-L45): `saveVideo(item)`.
* [`zomato/backend/src/routes/food.routes.js:31-34`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/food.routes.js#L31-L34): `router.post('/save', authMiddleware.authUserMiddleware, foodController.saveFood)`.
* [`zomato/backend/src/controllers/food.controller.js:74-113`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L74-L113): `saveFood`.
* [`zomato/backend/src/models/save.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/save.model.js): Schema referencing `user` and `food`.

### Say It Out Loud (Spoken Interview Script)
> "Saving dishes functions similarly to our like pipeline. When the user taps the bookmark icon, `saveFood` in `food.controller.js` queries our `saves` collection.
> 
> If the record is present, it deletes the document and decrements `savesCount` on the food item using `$inc`. If absent, it creates the bookmark document and increments `savesCount`.
> 
> The client then optimistically reflects the new save counter without needing to reload the entire feed."

---

## F10: Saved Reels Collection Screen

### Overview & User-Facing Behavior
Provides a dedicated view on `/saved` where consumers can review all the food reels they have personally bookmarked.

### Files and Functions Involved
* [`zomato/frontend/src/pages/general/Saved.jsx:9-23`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/general/Saved.jsx#L9-L23): Fetches bookmarked items from backend and flattens populated `food` objects.
* [`zomato/backend/src/routes/food.routes.js:37-40`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/food.routes.js#L37-L40): `router.get('/save', authMiddleware.authUserMiddleware, foodController.getSaveFood)`.
* [`zomato/backend/src/controllers/food.controller.js:115-130`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/food.controller.js#L115-L130): `getSaveFood`.

### Say It Out Loud (Spoken Interview Script)
> "To let users review dishes they've saved for dinner or weekend dining, I built the Saved page at `/saved`.
> 
> When mounted, `Saved.jsx` makes a GET request to `/api/food/save`. On the server side, `getSaveFood` finds all records in `saves` matching the authenticated user ID and uses Mongoose's `.populate('food')` method to join the complete food details.
> 
> On the client, I flatten the populated response array and feed it directly into our reusable `ReelFeed` component, giving users the exact same smooth autoplay and interaction capabilities in their personal bookmarks as on the main discovery feed."
