# 💎 LuxeJewels: Unabridged Technical Architecture & Deep Dive

## 1. High-Level Architecture
LuxeJewels follows a decoupled **Client-Server Architecture**, consisting of a RESTful API backend and a Single Page Application (SPA) frontend. 

* **Frontend:** Built with **Angular 17** using modern Standalone Components (bypassing legacy NgModules), heavily relying on RxJS for reactive state management and Angular Router for lazy-loaded route splitting.
* **Backend:** Built with **Node.js & Express.js**, following the classic MVC (Model-View-Controller) structure, but adapted for API serving (routes -> controllers -> models).
* **Database:** **MongoDB**, a NoSQL document database, utilizing **Mongoose** as an Object Data Modeling (ODM) library strictly defining schemas, relationships (refs), and validation.
* **Authentication:** Stateless, token-based authentication using **JSON Web Tokens (JWT)** and **bcryptjs** for secure password hashing.

---

## 2. Deep Dive: Database Schema & Models (MongoDB / Mongoose)
The database consists of 6 primary collections. Here is the exact breakdown of every single field and its technical purpose.

### A. Users Collection (`User.js`)
Handles authentication, authorization, and basic profile data.
* `_id` *(ObjectId)*: MongoDB auto-generated unique identifier.
* `name` *(String, Required, Trimmed)*: The user's full name. Trimmed to prevent leading/trailing whitespace.
* `email` *(String, Required, Unique, Lowercase)*: Uniquely identifies the user. Enforced lowercase for consistent login lookups.
* `password` *(String, Required)*: The user's password. **Crucially, this is NEVER stored in plaintext.** It is hashed using `bcrypt` with 12 salt rounds before saving to the DB.
* `phone` *(String, Optional)*: Contact number.
* `role` *(String, Enum: ['user', 'admin'])*: Determines RBAC (Role-Based Access Control). Defaults to `'user'`.
* `createdAt` *(Date)*: Timestamp of registration.

### B. Products Collection (`Product.js`)
Stores the catalog. Optimized with a **Text Index** on `name`, `description`, and `category` for ultra-fast full-text search.
* `_id` *(ObjectId)*: Unique product identifier.
* `name` *(String, Required)*: The display name of the jewellery piece.
* `price` *(Number, Required)*: Base price in INR (₹).
* `category` *(String, Enum)*: Strictly restricted to `'Rings'`, `'Necklaces'`, `'Earrings'`, `'Bracelets'`, or `'Watches'`.
* `description` *(String, Required)*: Detailed text for the product page.
* `images` *(Array of Strings)*: Array of image URLs allowing for product galleries and hover-zoom effects.
* `goldType` *(String, Enum)*: `'18K'`, `'22K'`, `'24K'`, `'Silver'`, `'Platinum'`. 
* `weight` *(String)*: Physical weight, stored as a string with unit (e.g., `"5.2g"`).
* `stock` *(Number)*: Inventory count. Defaults to 0. Updates automatically upon order completion.
* `rating` *(Number)*: Average review score (0-5). Auto-calculated continuously based on `Reviews`.
* `numReviews` *(Number)*: Count of total reviews left by users.
* `featured` *(Boolean)*: Flag used by the frontend to render the item in the "Featured Products Grid" on the Home Page.
* `bestSeller` *(Boolean)*: Flag used to render the item in the Home Page's "Best Sellers" horizontal carousel.

### C. Orders Collection (`Order.js`)
Tracks financial transactions and fulfillment.
* `_id` *(ObjectId)*: Unique order invoice/receipt number.
* `userId` *(ObjectId, Ref: 'User')*: Establishes a relational link back to the user who placed it.
* `products` *(Array of Objects)*: Captures a historical snapshot of the cart at checkout (prevents past orders from altering if a product price changes later).
  * `productId` *(ObjectId)*, `name` *(String)*, `price` *(Number)*, `quantity` *(Number)*, `image` *(String)*.
* `totalPrice` *(Number)*: The final calculated amount paid.
* `address` *(Object)*: Contains `name`, `phone`, `street`, `city`, `pincode`.
* `paymentMethod` *(String, Enum)*: `'COD'` (Cash on Delivery) or `'Online'`.
* `status` *(String, Enum)*: Lifecycle of the order: `'Pending'`, `'Processing'`, `'Shipped'`, `'Delivered'`. Changing this value updates the visual tracking bar in the user dashboard.

### D. Cart & Wishlist Collections (`Cart.js`, `Wishlist.js`)
* **Cart**: Contains a unique document per user (`userId` ref). Holds an array of `products` spanning `productId` and `quantity`. This allows cross-device persistent carts (unlike `localStorage` carts).
* **Wishlist**: Similar to Cart, constrained to a unique `userId`. Contains an Array of `ObjectId` references to Products the user likes.

### E. Reviews Collection (`Review.js`)
* `_id` *(ObjectId)*: Unique identifier.
* `userId` *(ObjectId, Ref: 'User')*: Author of the review.
* `productId` *(ObjectId, Ref: 'Product')*: The item being reviewed.
* `rating` *(Number)*: Integer between 1 and 5.
* `comment` *(String)*: Text feedback.

---

## 3. Deep Dive: RESTful API Layer (Express.js)

The Node.js backend exposes structured endpoints. Every endpoint interacting with private data is guarded by specific middleware.

### Middleware Mechanics
* **`auth.js`**: Intercepts requests, extracts the JWT from the `Authorization: Bearer <token>` header, verifies the signature against `JWT_SECRET`, decodes the payload, and attaches the `userId` to the Express `req` object for the controller to use. If the token is invalid/expired, it returns `401 Unauthorized`.
* **`admin.js`**: Chained *after* the auth middleware. It checks if `req.user.role === 'admin'`. If not, it rejects with `403 Forbidden`.

### API Endpoints Breakdown

#### Authentication API (`/api/auth`)
* `POST /register`: Accepts `name`, `email`, `password`, `phone`. Hashes the password, generates a JWT token, returns the user object + token.
* `POST /login`: Looks up the user by `email`. Uses `bcrypt.compare()` to validate the password against the stored hash. Generates and returns a JWT token.
* `GET /profile` *(User)*: Uses the token to return the current logged-in user's data (excluding password hash).

#### Product API (`/api/products`)
* `GET /`: The workhorse endpoint. Retrieves products. Supports robust query parameters pushed straight to Mongoose:
  * `?category=Rings` (Exact match)
  * `?minPrice=10000&maxPrice=50000` (`$gte` and `$lte` operators)
  * `?search=diamond` (Executes MongoDB `$text` search)
  * `?page=1&limit=12` (Implements `.skip()` and `.limit()` for pagination)
  * `?sort=-price` (Sorts by highest price using `-1`)
* `GET /:id`: Retrieves a single product document by ObjectId.
* `POST /`, `PUT /:id`, `DELETE /:id` *(Admin)*: CRUD operations restricted to the admin panel. Updates stock, images, visibility tags, etc.
* `GET /stats` *(Admin)*: Uses MongoDB Aggregation Pipelines to return total products, categories breakdown, and inventory valuation.

#### Cart & Order APIs (`/api/cart`, `/api/orders`)
* `POST /api/cart/add` *(User)*: Finds the user's cart document. If the `productId` exists, increments `quantity`. If not, pushes a new object.
* `POST /api/orders` *(User)*: Validates stock availability, calculates total price, creates an Order document, and importantly, **empties the user's Cart document** in a single atomic-like operation.
* `GET /api/orders` & `/api/orders/stats` *(Admin)*: Analytics endpoints providing metrics required for the Admin Dashboard (Order statuses, Monthly revenue aggregations, etc).

---

## 4. Deep Dive: Frontend Architecture (Angular 17)

The frontend is a strictly typed SPA using Angular's latest features.

### A. Routing & Lazy Loading (`app.routes.ts`)
Instead of bundling the whole app, it uses `loadComponent` dynamic imports. 
* E.g., navigating to `/checkout` dynamically fetches the JavaScript chunk for the Checkout page. This forces the initial load time to be lightning fast.
* **Route Guards (`auth.guard.ts`, `admin.guard.ts`)**: Utilize Angular's `CanActivateFn` to inspect the `auth.service`. If a user goes to `/admin` but isn't an admin, the router intercepts the navigation and bounces them back to `/login`.

### B. Service Layer & Interceptors
* **`auth.interceptor.ts`**: An HTTP Interceptor that listens to *every single outgoing HTTP request*. If an auth token exists in `localStorage`, it automatically clones the request and injects the `Authorization: Bearer <token>` header, keeping API calls DRY.
* **Services (`product.service.ts`, `cart.service.ts`, etc.)**: These inject Angular's `HttpClient`. They handle all asynchronous communication, wrapping responses in RxJS `Observables`.

### C. State Management (RxJS)
Instead of bulky state libraries like NgRx, intermediate state (like the Cart total, or Auth status) is managed via RxJS `BehaviorSubject` instances embedded within Services. 
* For example: When a user clicks "Add to Cart", the `cart.service` fires an API call, updates a `BehaviorSubject`, and any component subscribed to it (like the Navbar cart icon badge) immediately updates reactively without a refresh.

### D. Component Tree & Pages
1. **Home (`/`)**: Heavily visually driven. Contains the Hero section, Featured Products, and Best Sellers (which uses a purely CSS-driven horizontal scrolling container or an Angular carousel library).
2. **Shop (`/shop`)**: A deeply interactive dashboard. Filter changes trigger parameterized routing (updating URL to `/shop?category=Rings`), so users can copy-paste the URL and share their exact filtered view. Includes real-time debounced searching.
3. **Product Detail (`/product/:id`)**: Implements mouse-tracking DOM manipulation for image zoom (`transform: scale(1.08)` bound to mouse coordinates).
4. **Admin Dashboard (`/admin`)**: A restricted quadrant featuring advanced data tables, CRUD forms with reactive validation (`FormBuilder`), and data visualization (likely using HTML Canvas or a library like Chart.js/Ng2-Charts parsing the `/stats` API).

---

## 5. UI/UX & Design System (CSS3)

Built strictly on vanilla CSS utilizing CSS Variables (`:root`) to ensure a cohesive theme without the overhead of Bootstrap or Tailwind.

### The "Luxury" Aesthetic
* **Colors**: Pure black (`#0D0D0D`) dominating the background, accented by a specific gold hex (`#D4AF37`). Surfaces (cards, inputs) sit on slightly elevated greys (`#1A1A1A`, `#1E1E1E`). 
* **Typography**: Playfair Display (a serif font) creates a premium print-magazine feel for headings. Poppins (sans-serif) creates readable, modern body text.
* **Micro-interactions:**
  * `transition: all 0.3s ease` applied globally.
  * Hovering over product cards applies `transform: translateY(-4px)` (a slight lift) and a glowing gold box shadow.
  * Buttons utilize `pulse` and `fadeIn` keyframes.

---

## 6. Security Deep Dive

1. **Authentication:** Purely stateless via JWT. No session memory footprint on the Node.js server. Tokens are valid for 30 days.
2. **Password Cryptography:** By utilizing bcrypt with a work factor (salt rounds) of 12, brute-forcing the DB is profoundly computationally expensive.
3. **CORS Security:** Cross-Origin Resource Sharing is strictly configured, allowing only the Angular frontend's URL (`http://localhost:4200` in dev, or the production URL) to interface with the Express server.
4. **Data Sanitization:** Mongoose schemas enforce data types vigorously. If a client attempts to pass a string into the `price` field, the ODM rejects the write operation immediately, preventing NoSQL injection.
