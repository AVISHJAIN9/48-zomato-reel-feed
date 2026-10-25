# Feature Group 2: Food Partner Authentication (F4 – F6)

This section covers the merchant partner authentication lifecycle, supporting onboarding, authentication, and role separation from standard consumers.

---

## F4: Food Partner Registration

### Overview & User-Facing Behavior
Allows restaurants, cloud kitchens, and culinary creators to register an official business account on `/food-partner/register`. The merchant provides Business Name, Contact Name, Phone, Email, Password, and Physical Address. Upon completion, the partner is logged in and redirected to `/create-food`.

### Files and Functions Involved
* [`zomato/frontend/src/pages/auth/FoodPartnerRegister.jsx:11-36`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/FoodPartnerRegister.jsx#L11-L36): Captures form fields, maps `businessName` to `name`, sends Axios POST with `withCredentials: true`, and navigates to `/create-food`.
* [`zomato/backend/src/routes/auth.routes.js:14`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L14): `router.post('/food-partner/register', authController.registerFoodPartner)`.
* [`zomato/backend/src/controllers/auth.controller.js:91-134`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L91-L134): `registerFoodPartner`.
* [`zomato/backend/src/models/foodpartner.model.js:3-31`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/models/foodpartner.model.js#L3-L31): Partner schema with fields `name`, `contactName`, `phone`, `address`, `email`, and `password`.

### Functions Called in Execution
1. `foodPartnerModel.findOne({ email })`: Verifies partner email uniqueness.
2. `bcrypt.hash(password, 10)`: Computes salted password hash.
3. `foodPartnerModel.create(...)`: Inserts partner record into MongoDB.
4. `jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET)`: Issues signed JWT.
5. `res.cookie("token", token)`: Sets HTTP cookie.

### Say It Out Loud (Spoken Interview Script)
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

### Overview & User-Facing Behavior
Enables registered partners to log in with their email and password on `/food-partner/login`, receiving their JWT session cookie and navigating directly to the video upload console (`/create-food`).

### Files and Functions Involved
* [`zomato/frontend/src/pages/auth/FoodPartnerLogin.jsx:10-25`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/frontend/src/pages/auth/FoodPartnerLogin.jsx#L10-L25).
* [`zomato/backend/src/routes/auth.routes.js:15`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L15).
* [`zomato/backend/src/controllers/auth.controller.js:136-172`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L136-L172).

### Say It Out Loud (Spoken Interview Script)
> "When a food partner returns to publish new content, they log in via `FoodPartnerLogin.jsx`.
> 
> The form handler transmits the email and password to `/api/auth/food-partner/login`. The controller validates that the partner exists in `foodpartners` and checks the password with `bcrypt.compare`.
> 
> Upon successful verification, a JWT token is created and stored in the cookie header, returning an HTTP 200 payload that immediately routes the merchant to `/create-food` so they can upload fresh reels."

---

## F6: Food Partner Logout

### Overview & User-Facing Behavior
Clears the food partner's session cookie.

### Files and Functions Involved
* [`zomato/backend/src/routes/auth.routes.js:16`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/routes/auth.routes.js#L16).
* [`zomato/backend/src/controllers/auth.controller.js:174-179`](file:///Users/avishjain/avishjain9-repos/55-zomato-reel-feed/zomato/backend/src/controllers/auth.controller.js#L174-L179).

### Say It Out Loud (Spoken Interview Script)
> "The partner logout endpoint at `/api/auth/food-partner/logout` calls `res.clearCookie('token')`.
> 
> This clears the authentication cookie from the browser, concluding the merchant's session cleanly without lingering state on the server."
