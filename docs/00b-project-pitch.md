# Project Pitches: Zomato Reel Feed

This document provides rehearsable project pitches tailored for technical recruiter phone screens, engineering hiring manager screens, and deep-dive technical interview loops.

---

## 1. The 30-Second Elevator Pitch (Recruiter / First Contact)

> "I built **Zomato Reel Feed**, a full-stack MERN video discovery platform that brings the addictive vertical reel experience of Instagram and TikTok to restaurant food discovery.
> 
> The application allows food partners to upload culinary video reels directly to ImageKit's media CDN via Express and Multer, while consumers scroll through a seamless, low-latency feed where videos auto-play and pause using a custom React 19 IntersectionObserver hook.
> 
> Under the hood, I architected dual-role authentication with bcrypt hashing and HTTP-only JWT cookies, paired with atomic MongoDB operations for real-time likes, saves, and partner profile catalogs.
> 
> It solves the high drop-off rate of static photo menus by turning dish discovery into an engaging, visual-first culinary journey."

---

## 2. The 2-Minute Technical Pitch (Hiring Manager / Team Screen)

> "Hi, I'm excited to share **Zomato Reel Feed**. The core problem I wanted to solve was that traditional food delivery apps rely on static, low-resolution food photos and text menus, which fail to convey dish freshness, portion size, and culinary craft—leading to decision fatigue and higher churn.
> 
> To solve this, I built a vertical video-first culinary marketplace with two distinct user personas: **Consumers** and **Food Partners**.
> 
> **On the frontend**, I built a Single Page Application using React 19 and Vite. The heart of the experience is the vertical `ReelFeed` component. Instead of triggering expensive re-renders or brute-force scroll listeners, I engineered an IntersectionObserver pipeline with multi-threshold tracking. When a video reel crosses 60% viewport visibility, it seamlessly plays with muted audio and inline looping, while off-screen videos pause immediately to conserve GPU memory and mobile network bandwidth.
> 
> **On the backend**, I built an Express 5 REST API backed by MongoDB via Mongoose. I implemented dual-role authentication where consumers and restaurant partners have distinct schemas, register/login endpoints, and dedicated JWT-verifying middlewares (`authUserMiddleware` and `authFoodPartnerMiddleware`). 
> 
> **For video asset management**, I bypassed local disk bottlenecks by configuring Multer memory storage and streaming uploaded MP4/WebM videos directly to ImageKit's global CDN via their Node.js SDK, capturing back CDN URLs with global edge caching.
> 
> **For social interactions**, I engineered toggleable like and bookmark endpoints using atomic `$inc` updates on the food documents alongside relational join collections (`Like` and `Save`), ensuring counter consistency without expensive full-document table locks.
> 
> In a production evolution, I've designed the architecture to incorporate adaptive bitrate streaming with HLS/DASH, Redis caching for hot feeds, and a multimodal Gemini Vision API pipeline to automatically detect ingredients, cuisine tags, and dietary labels directly from uploaded reel video frames."

---

## 3. The 3-Minute Deep-Dive Technical Walkthrough (Senior Engineer Loop)

> "When an interviewer asks: *'Walk me through the architecture and the most challenging technical decisions of your project.'*
> 
> **Problem & High-Level Architecture:**
> Zomato Reel Feed is a decoupled MERN stack application designed for high-engagement, video-first food discovery. The architecture divides responsibilities cleanly: a React 19 client on port 5173 communicates over CORS with credentials enabled to an Express 5 API on port 3000, which coordinates with a MongoDB cluster and ImageKit's media delivery CDN.
> 
> **1. The Video Ingestion Pipeline:**
> When a Food Partner uploads a new reel in `CreateFood.jsx`, the client creates an in-memory blob URL via `URL.createObjectURL` for instant drag-and-drop previewing without network overhead. Upon submission, the multipart form-data sends the video buffer to Express. Rather than writing large binary files to the server's ephemeral container disk, Multer captures the file in memory buffer, and our storage service streams it to ImageKit with UUID-based key generation. The resulting HTTPS CDN endpoint is persisted into MongoDB alongside restaurant reference IDs.
> 
> **2. The Viewport Auto-Play Engine:**
> Managing concurrent HTML5 video playback in a virtualized vertical DOM list often causes browser stuttering and high battery drain. In `ReelFeed.jsx`, I maintained an efficient `Map` of DOM element references stored in a `useRef` hook. An `IntersectionObserver` instance observes all active video tags using a threshold array of `[0, 0.25, 0.6, 0.9, 1]`. Only the video occupying greater than or equal to 60% of the active viewport is instructed to play via an unhandled promise catch block; all other targets immediately trigger `.pause()`.
> 
> **3. Authentication & State Isolation:**
> Security is enforced through HTTP-only cookies containing signed JWTs. I deliberately avoided localStorage to eliminate Cross-Site Scripting (XSS) token theft vulnerabilities. I constructed two separate auth middlewares: `authUserMiddleware` and `authFoodPartnerMiddleware`. This ensures that general foodies cannot inject mock food items or access merchant dashboards, while authenticated users can seamlessly favorite and bookmark reels.
> 
> **4. Data Model & Concurrency:**
> For likes and bookmarks, I used a hybrid data model. We maintain relational records in `Like` and `Save` schemas with compound unique indexes on `(user, food)` to prevent duplicate actions. Concurrently, the parent `Food` document maintains denormalized counters (`likeCount`, `savesCount`) updated atomically via `$inc: 1` or `$inc: -1`. This provides $O(1)$ read performance when hydrating the global feed without requiring an expensive aggregate count across millions of like rows.
> 
> **5. What I Would Refactor in Version 2:**
> While the current architecture runs cleanly, uploading raw MP4s directly without background chunking presents bandwidth constraints on 3G/4G networks. In v2, I would replace direct Multer uploads with client-side presigned URLs to an S3 bucket, trigger an AWS MediaConvert or FFmpeg queue to transcode videos into multi-bitrate HLS streams (`.m3u8`), and cache the hot feed in Redis with a sliding window algorithm."
