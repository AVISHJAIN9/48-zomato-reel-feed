# Feature Group 1: Consumer User Authentication (F1 – F3)

This section details the consumer identity lifecycle, including account registration, password hashing, session issuance via HTTP-only JWT cookies, and session invalidation.

---

## F1: Consumer User Registration

### Overview & User-Facing Behavior
Enables new consumers to create an account by providing first name, last name, unique email address, and password on `/user/register`. Upon successful creation, the user is authenticated immediately without requiring a separate login step, and redirected to `/`.

### Files and Functions Involved
* [`zomato/frontend/src/pages/auth/UserRegister.jsx`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/UserRegister.jsx):
  * `handleSubmit(e)` ([lines 11–33](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/UserRegister.jsx#L11-L33)): Extracts form values, concatenates names into `fullName`, and initiates Axios POST request.
* [`zomato/backend/src/routes/auth.routes.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js):
  * Route binding ([line 7](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L7)): `router.post('/user/register', authController.registerUser)`.
* [`zomato/backend/src/controllers/auth.controller.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js):
  * `registerUser(req, res)` ([lines 6–43](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L6-L43)): Handles uniqueness validation, bcrypt password hashing, MongoDB insertion, JWT token signing, and cookie dispatch.
* [`zomato/backend/src/models/user.model.js`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/user.model.js):
  * Schema definition ([lines 4–21](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/user.model.js#L4-L21)): Declares `fullName`, `email` (unique index), `password`, and timestamps.

### Functions Called in Execution
1. `userModel.findOne({ email })`:
   * **Parameters:** Query object `{ email: string }`.
   * **Return Value:** Existing user document or `null`.
   * **Purpose:** Ensures no account collision occurs on the specified email.
2. `bcrypt.hash(password, 10)`:
   * **Parameters:** Plaintext password string, salt rounds integer (`10`).
   * **Return Value:** Promise resolving to 60-character bcrypt hash string.
   * **Purpose:** Salts and hashes password to prevent cleartext exposure.
3. `userModel.create({ fullName, email, password: hashedPassword })`:
   * **Parameters:** Object containing user properties.
   * **Return Value:** Promise resolving to created Mongoose document with assigned `_id`.
   * **Purpose:** Persists consumer entity in MongoDB.
4. `jwt.sign({ id: user._id }, process.env.JWT_SECRET)`:
   * **Parameters:** Payload `{ id: ObjectId }`, secret key string.
   * **Return Value:** Cryptographic JWT token string.
   * **Purpose:** Generates stateless session token.
5. `res.cookie("token", token)`:
   * **Parameters:** Cookie name `"token"`, token value.
   * **Return Value:** Express Response object.
   * **Purpose:** Sends `Set-Cookie` header to client browser.

### Data & Collections Touched
* Collection: `users` in MongoDB.
* Operations: Read query (`findOne`) and write insert (`create`).
* Indexes: `email_1` (unique index created by Mongoose schema).

### Security & Performance
* **Security:** Passwords hashed with bcrypt (10 rounds). Password hash is stripped from return JSON (`_id`, `email`, `fullName` returned only).
* **Vulnerability:** Cookie is currently set without explicit `httpOnly: true` or `secure: true` flags in code ([`auth.controller.js:32`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L32)).

### Say It Out Loud (Spoken Interview Script)
> "When a consumer wants to join our platform, they fill out their name, email, and password on our React registration screen.
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

### Overview & User-Facing Behavior
Authenticates registered consumers using their email and password on `/user/login`. Successful verification issues a fresh JWT cookie and redirects the user to the discovery feed.

### Files and Functions Involved
* [`zomato/frontend/src/pages/auth/UserLogin.jsx:10-25`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/UserLogin.jsx#L10-L25): Handles client submit and Axios call.
* [`zomato/backend/src/routes/auth.routes.js:8`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L8): Binds POST `/user/login`.
* [`zomato/backend/src/controllers/auth.controller.js:45-81`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L45-L81): `loginUser` controller function.

### Functions Called in Execution
1. `userModel.findOne({ email })`: Queries user by email.
2. `bcrypt.compare(password, user.password)`: Compares candidate plaintext password against stored bcrypt hash. Returns boolean.
3. `jwt.sign({ id: user._id }, process.env.JWT_SECRET)`: Signs payload.
4. `res.cookie("token", token)`: Sets session cookie.

### Edge Cases & Error Handling
* Returns identical generic error message (`"Invalid email or password"`) for both missing user and invalid password to prevent account enumeration attacks.

### Say It Out Loud (Spoken Interview Script)
> "To authenticate returning consumers, I built the login flow in `UserLogin.jsx`.
> 
> When the user submits their credentials, an Axios POST is dispatched to `/api/auth/user/login`. The controller first looks up the user document by email. If no account matches, or if `bcrypt.compare` indicates the password hash does not match, I return a 400 status with the generic message 'Invalid email or password'.
> 
> Using an identical message for both missing accounts and bad passwords was a deliberate security choice to defend against account enumeration and brute-force harvesting.
> 
> Once validated, I sign a JWT using our `JWT_SECRET`, attach it to the response as a cookie, and return the sanitized user profile, prompting the client to route the user to `/`."

---

## F3: Consumer User Logout

### Overview & User-Facing Behavior
Terminates the active session by clearing the authentication cookie from the client's browser.

### Files and Functions Involved
* [`zomato/backend/src/routes/auth.routes.js:9`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L9): `router.get('/user/logout', authController.logoutUser)`.
* [`zomato/backend/src/controllers/auth.controller.js:83-88`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L83-L88): `logoutUser`.

### Say It Out Loud (Spoken Interview Script)
> "For logging out consumers, I built a lightweight GET endpoint at `/api/auth/user/logout`.
> 
> When invoked, the controller calls Express's `res.clearCookie('token')` method, which sends a Set-Cookie header instructing the browser to immediately expire the authentication cookie.
> 
> Because our authentication is stateless, clearing the client-side cookie is sufficient for session termination without making expensive database writes.
> 
> If we needed enterprise-grade instant revocation across all devices, I would introduce a Redis token blocklist checked during middleware verification."
