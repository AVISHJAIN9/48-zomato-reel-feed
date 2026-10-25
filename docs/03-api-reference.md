# Step 4: API Reference & Endpoint Specifications

This document defines the REST API contract for all endpoints exposed by the **Zomato Reel Feed** backend, as well as external cloud integrations.

---

## Global API Standards

* **Base URL:** `http://localhost:3000`
* **Transport:** HTTP/1.1 over TCP
* **Data Format:** `application/json` (except `/api/food` POST which accepts `multipart/form-data`)
* **Session Transport:** HTTP Cookie (`token`)
* **CORS Settings:** Origin `http://localhost:5173`, Credentials `true`

---

## 1. System Liveness

### `GET /`
* **Purpose:** Basic health and liveness probe.
* **Authentication:** None.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> Inline handler.
* **Success Response:**
  * **Status:** `200 OK`
  * **Body:** `"Hello World"`

---

## 2. Consumer Authentication Endpoints

### `POST /api/auth/user/register`
* **Purpose:** Register new consumer foodie account and issue JWT cookie.
* **Authentication:** None.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> `authController.registerUser`.
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Validation Rules:**
  * `fullName`: String, required by Mongoose schema.
  * `email`: String, required, checked for uniqueness via `userModel.findOne({ email })`.
  * `password`: String, required.
* **Success Response:**
  * **Status:** `201 Created`
  * **Headers:** `Set-Cookie: token=<jwt_string>; Path=/`
  * **Body:**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "_id": "673f8a9e102bc45a19000001",
        "email": "jane@example.com",
        "fullName": "Jane Doe"
      }
    }
    ```
* **Error Responses:**
  * `400 Bad Request`:
    ```json
    { "message": "User already exists" }
    ```
  * `500 Internal Server Error`: MongoDB connection failure.

---

### `POST /api/auth/user/login`
* **Purpose:** Authenticate existing consumer and set session cookie.
* **Authentication:** None.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> `authController.loginUser`.
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response:**
  * **Status:** `200 OK`
  * **Headers:** `Set-Cookie: token=<jwt_string>; Path=/`
  * **Body:**
    ```json
    {
      "message": "User logged in successfully",
      "user": {
        "_id": "673f8a9e102bc45a19000001",
        "email": "jane@example.com",
        "fullName": "Jane Doe"
      }
    }
    ```
* **Error Responses:**
  * `400 Bad Request` (user not found or invalid bcrypt comparison):
    ```json
    { "message": "Invalid email or password" }
    ```

---

### `GET /api/auth/user/logout`
* **Purpose:** Expire consumer session cookie.
* **Authentication:** None.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> `authController.logoutUser`.
* **Success Response:**
  * **Status:** `200 OK`
  * **Headers:** `Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  * **Body:**
    ```json
    { "message": "User logged out successfully" }
    ```

---

## 3. Food Partner Authentication Endpoints

### `POST /api/auth/food-partner/register`
* **Purpose:** Register new merchant partner and issue session cookie.
* **Authentication:** None.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> `authController.registerFoodPartner`.
* **Request Body:**
  ```json
  {
    "name": "Spice Route Kitchen",
    "contactName": "Rajesh Kumar",
    "phone": "+91 98765 43210",
    "email": "partner@spiceroute.com",
    "password": "PartnerSecurePass1!",
    "address": "42 MG Road, Bangalore, India"
  }
  ```
* **Validation Rules:** All fields required by `foodpartner.model.js`. `email` must be unique in `foodpartners`.
* **Success Response:**
  * **Status:** `201 Created`
  * **Headers:** `Set-Cookie: token=<jwt_string>; Path=/`
  * **Body:**
    ```json
    {
      "message": "Food partner registered successfully",
      "foodPartner": {
        "_id": "673f8a9e102bc45a19000002",
        "email": "partner@spiceroute.com",
        "name": "Spice Route Kitchen",
        "address": "42 MG Road, Bangalore, India",
        "contactName": "Rajesh Kumar",
        "phone": "+91 98765 43210"
      }
    }
    ```
* **Error Responses:**
  * `400 Bad Request`:
    ```json
    { "message": "Food partner account already exists" }
    ```

---

### `POST /api/auth/food-partner/login`
* **Purpose:** Authenticate partner account and issue cookie.
* **Middleware Chain:** `cors` -> `cookieParser` -> `express.json` -> `authController.loginFoodPartner`.
* **Request Body:**
  ```json
  {
    "email": "partner@spiceroute.com",
    "password": "PartnerSecurePass1!"
  }
  ```
* **Success Response:**
  * **Status:** `200 OK`
  * **Body:**
    ```json
    {
      "message": "Food partner logged in successfully",
      "foodPartner": {
        "_id": "673f8a9e102bc45a19000002",
        "email": "partner@spiceroute.com",
        "name": "Spice Route Kitchen"
      }
    }
    ```
* **Error Responses:**
  * `400 Bad Request`: `{ "message": "Invalid email or password" }`

---

### `GET /api/auth/food-partner/logout`
* **Purpose:** Expire partner session cookie.
* **Success Response:** `200 OK` with `{ "message": "Food partner logged out successfully" }`.

---

## 4. Food Feed & Content Endpoints

### `POST /api/food`
* **Purpose:** Upload culinary video reel to ImageKit CDN and create food item.
* **Authentication:** Required (`authFoodPartnerMiddleware`).
* **Middleware Chain:**
  1. `cors`
  2. `cookieParser`
  3. `express.json`
  4. `authMiddleware.authFoodPartnerMiddleware`
  5. `upload.single("mama")` (Multer memoryStorage)
  6. `foodController.createFood`
* **Request Format:** `multipart/form-data`
* **Form Fields:**
  * `name` (text, required): Name of the dish.
  * `description` (text, optional): Description and ingredients.
  * `mama` (binary file, required): MP4 or WebM video stream.
* **Success Response:**
  * **Status:** `201 Created`
  * **Body:**
    ```json
    {
      "message": "food created successfully",
      "food": {
        "_id": "673f8a9e102bc45a19000003",
        "name": "Crispy Paneer Tikka",
        "description": "Charcoal grilled paneer infused with mint and spices.",
        "video": "https://ik.imagekit.io/zomatoreels/f47ac10b-58cc-4372-a567-0e02b2c3d479.mp4",
        "foodPartner": "673f8a9e102bc45a19000002",
        "likeCount": 0,
        "savesCount": 0
      }
    }
    ```
* **Error Responses:**
  * `401 Unauthorized` (missing or invalid token): `{ "message": "Please login first" }` or `{ "message": "Invalid token" }`
  * `500 Internal Server Error`: ImageKit upload failure or Multer buffer crash.

---

### `GET /api/food`
* **Purpose:** Fetch all food reels for the discovery feed.
* **Authentication:** Required (`authUserMiddleware`).
* **Middleware Chain:** `cors` -> `cookieParser` -> `authUserMiddleware` -> `foodController.getFoodItems`.
* **Success Response:**
  * **Status:** `200 OK`
  * **Body:**
    ```json
    {
      "message": "Food items fetched successfully",
      "foodItems": [
        {
          "_id": "673f8a9e102bc45a19000003",
          "name": "Crispy Paneer Tikka",
          "description": "Charcoal grilled paneer infused with mint and spices.",
          "video": "https://ik.imagekit.io/zomatoreels/f47ac10b-58cc-4372-a567-0e02b2c3d479.mp4",
          "foodPartner": "673f8a9e102bc45a19000002",
          "likeCount": 14,
          "savesCount": 3
        }
      ]
    }
    ```

---

### `POST /api/food/like`
* **Purpose:** Toggle like/unlike on a food reel.
* **Authentication:** Required (`authUserMiddleware`).
* **Request Body:**
  ```json
  { "foodId": "673f8a9e102bc45a19000003" }
  ```
* **Success Response (When Liking):**
  * **Status:** `201 Created`
  * **Body:**
    ```json
    {
      "message": "Food liked successfully",
      "like": {
        "_id": "673f8a9e102bc45a19000010",
        "user": "673f8a9e102bc45a19000001",
        "food": "673f8a9e102bc45a19000003",
        "createdAt": "2026-10-25T07:12:00.000Z"
      }
    }
    ```
* **Success Response (When Unliking):**
  * **Status:** `200 OK`
  * **Body:**
    ```json
    { "message": "Food unliked successfully" }
    ```

---

### `POST /api/food/save`
* **Purpose:** Toggle bookmark on a food reel.
* **Authentication:** Required (`authUserMiddleware`).
* **Request Body:** `{ "foodId": "673f8a9e102bc45a19000003" }`
* **Success Response (When Saving):** `201 Created` with `{ "message": "Food saved successfully", "save": { ... } }`.
* **Success Response (When Unsaving):** `200 OK` with `{ "message": "Food unsaved successfully" }`.

---

### `GET /api/food/save`
* **Purpose:** Retrieve all bookmarked reels for the authenticated consumer.
* **Authentication:** Required (`authUserMiddleware`).
* **Success Response:**
  * **Status:** `200 OK`
  * **Body:**
    ```json
    {
      "message": "Saved foods retrieved successfully",
      "savedFoods": [
        {
          "_id": "673f8a9e102bc45a19000020",
          "user": "673f8a9e102bc45a19000001",
          "food": {
            "_id": "673f8a9e102bc45a19000003",
            "name": "Crispy Paneer Tikka",
            "video": "https://ik.imagekit.io/zomatoreels/f47ac10b.mp4",
            "description": "Charcoal grilled paneer.",
            "likeCount": 14,
            "savesCount": 3,
            "foodPartner": "673f8a9e102bc45a19000002"
          }
        }
      ]
    }
    ```
* **Error Response:**
  * `404 Not Found`: `{ "message": "No saved foods found" }`

---

## 5. Food Partner Store Profile Endpoints

### `GET /api/food-partner/:id`
* **Purpose:** Retrieve restaurant metadata and all published food reels.
* **Authentication:** Required (`authUserMiddleware`).
* **URL Parameters:** `:id` (MongoDB ObjectId of the merchant).
* **Success Response:**
  * **Status:** `200 OK`
  * **Body:**
    ```json
    {
      "message": "Food partner retrieved successfully",
      "foodPartner": {
        "_id": "673f8a9e102bc45a19000002",
        "name": "Spice Route Kitchen",
        "contactName": "Rajesh Kumar",
        "phone": "+91 98765 43210",
        "address": "42 MG Road, Bangalore, India",
        "email": "partner@spiceroute.com",
        "foodItems": [
          {
            "_id": "673f8a9e102bc45a19000003",
            "name": "Crispy Paneer Tikka",
            "video": "https://ik.imagekit.io/zomatoreels/f47ac10b.mp4",
            "likeCount": 14,
            "savesCount": 3
          }
        ]
      }
    }
    ```
* **Error Response:**
  * `404 Not Found`: `{ "message": "Food partner not found" }`

---

## 6. External Cloud API: ImageKit.io Upload API

* **Endpoint Called by Backend:** `https://upload.imagekit.io/api/v1/files/upload`
* **Protocol:** HTTPS POST with Basic Authentication using base64 encoded `IMAGEKIT_PRIVATE_KEY:`
* **Payload:**
  * `file`: Base64 string or Binary stream of the video buffer.
  * `fileName`: Generated UUID string (`uuid()`).
* **Timeouts & Retries:** ImageKit SDK uses default HTTP socket timeout (approx 30s). [CONFIRM WITH DEVELOPER: Retries and exponential backoff are not currently configured in code].
