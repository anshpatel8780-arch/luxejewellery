<p align="center">
  <img src="https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<h1 align="center">💎 Kairo Jewellery — Premium Jewellery E-Commerce</h1>

<p align="center">
  A modern, luxury jewellery e-commerce platform with a stunning <strong>Black & Gold</strong> circular branding, full shopping experience, admin panel, and REST API backend.
</p>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🖥️ Tech Stack](#️-tech-stack)
- [📸 Screenshots](#-screenshots)
- [🏗️ Project Structure](#️-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔐 Login Credentials](#-login-credentials)
- [📄 Pages & Features](#-pages--features)
- [🛠️ REST API Reference](#️-rest-api-reference)
- [🗄️ Database Schema](#️-database-schema)
- [🎨 Design System](#-design-system)
- [🔒 Security](#-security)
- [⚡ Performance](#-performance)
- [📱 Responsive Design](#-responsive-design)
- [🚀 Deployment](#-deployment)

---

## 🌟 Overview

**Kairo Jewellery** is a full-stack jewellery e-commerce website inspired by premium brands like **Tanishq**, **Malabar Gold**, and **Kalyan Jewellers**. It features:

- 🛍️ **Complete shopping experience** — browse, filter, search, cart, checkout
- 👤 **Premium User Profiles** — Full-width dashboard with an advanced image upload system (**100MB limit**), custom Multer filtering, and account statistics
- 📦 **Inventory Management** — Automatic stock restoration on order cancellation and strict real-time stock enforcement in the shopping cart
- 🏠 **Saved Addresses System** — Manage multiple shipping addresses, set defaults, and select during checkout
- 🛡️ **Admin panel** — Dashboard stats, product CRUD, order & user management with **enhanced Sidebar UX**
- 🎨 **Luxury Circular Branding** — Refined circular logo identity with gold borders, contrast-aware backgrounds, and **Font Awesome 6** integration
- 📅 **Collection 2026** — Updated hero collections and seasonal rewards for the 2026 roadmap
- 📱 **Fully responsive** — optimized for desktop, tablet, and mobile
- 🔐 **JWT authentication** — secure token-based auth with route guards
- ⚡ **Lazy-loaded routes** — Angular standalone components with code splitting
- 🛠️ **System Integrity** — Global error handling middleware and robust Multer file filtering

---

## 🖥️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Angular 17** | Frontend framework (standalone components) |
| **TypeScript** | Type-safe JavaScript |
| **Angular Router** | Client-side routing with lazy loading |
| **HttpClient** | REST API communication |
| **RxJS** | Reactive state management |
| **Font Awesome 6** | Professional vector iconography |
| **Angular Animations** | Fade-in, slide-in UI effects |
| **CSS3** | Custom styles (no framework) with CSS variables |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **Mongoose** | MongoDB ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cors** | Cross-Origin Resource Sharing |
| **dotenv** | Environment configuration |
| **multer** | File upload handling |

### Database
| Technology | Purpose |
|-----------|---------|
| **MongoDB** | NoSQL document database |
| 6 Collections | Users, Products, Orders, Cart, Wishlist, Reviews |

---

## 📸 Screenshots

### Home Page — Hero Section
> Dark luxury hero with gradient overlay, CTA buttons, and animated statistics.

### Featured Products Grid
> 4-column responsive grid with product cards, prices, ratings, and "Best Seller" badges.

### Shop Categories
> 5 browsable categories — Rings, Necklaces, Earrings, Bracelets, Watches.

### Admin Dashboard
> Stats overview (Orders, Users, Revenue, Products), order status charts, monthly sales visualization.

---

## 🏗️ Project Structure

```
Jewellery Website/
│
├── 📁 backend/                    # Node.js + Express API
│   ├── 📁 controllers/           # Route handler logic
│   │   ├── authController.js     # Register, Login, Profile, User CRUD
│   │   ├── addressController.js  # Saved address management
│   │   ├── productController.js  # Product CRUD, Search, Filter, Stats
│   │   ├── cartController.js     # Cart add, update, remove, clear
│   │   ├── orderController.js    # Order create, status, stats
│   │   ├── reviewController.js   # Create review, get by product
│   │   └── wishlistController.js # Wishlist add, get, remove
│   │
│   ├── 📁 models/                # Mongoose schemas
│   │   ├── User.js               # User schema (bcrypt password hashing)
│   │   ├── Product.js            # Product schema (text index for search)
│   │   ├── Order.js              # Order schema (status tracking)
│   │   ├── Cart.js               # Cart schema (per-user)
│   │   ├── Wishlist.js           # Wishlist schema
│   │   └── Review.js             # Review schema
│   │
│   ├── 📁 middleware/            # Express middleware
│   │   ├── auth.js               # JWT verification
│   │   ├── admin.js              # Admin role check
│   │   └── upload.js             # Multer image upload & validation
│   │
│   ├── 📁 uploads/               # User profile image storage
│   │
│   ├── 📁 routes/                # Route definitions
│   │   ├── auth.js               # /api/register, /api/login, /api/profile/image
│   │   ├── products.js           # /api/products (CRUD + filters)
│   │   ├── cart.js               # /api/cart (add, update, remove)
│   │   ├── orders.js             # /api/orders (create, status, stats)
│   │   ├── reviews.js            # /api/reviews
│   │   └── wishlist.js           # /api/wishlist
│   │
│   ├── server.js                 # Express app entry point
│   ├── seed.js                   # Database seeder (20 products + users)
│   ├── .env                      # Environment variables
│   └── package.json              # Dependencies
│
├── 📁 frontend/                   # Angular 17 SPA
│   └── 📁 src/
│       ├── 📁 app/
│       │   ├── 📁 components/    # Shared layout components
│       │   │   ├── navbar/       # Sticky navbar (scroll-aware, auth-aware)
│       │   │   └── footer/       # 4-column footer
│       │   │
│       │   ├── 📁 pages/         # Route-level page components
│       │   │   ├── home/         # Hero, Featured, Categories, Best Sellers, etc.
│       │   │   ├── shop/         # Filter sidebar + product grid + pagination
│       │   │   ├── product-detail/ # Image gallery, zoom, reviews
│       │   │   ├── cart/         # Cart items, quantity, summary
│       │   │   ├── checkout/     # Address form, payment, order placement
│       │   │   ├── login/        # Email/password login
│       │   │   ├── register/     # User registration
│       │   │   ├── dashboard/    # Profile, Orders (tracking), Wishlist
│       │   │   ├── about/        # Brand story, values
│       │   │   ├── contact/      # Contact form, info
│       │   │   └── admin/        # Dashboard, Products, Orders, Users
│       │   │
│       │   ├── 📁 services/      # API service classes
│       │   │   ├── auth.service.ts
│       │   │   ├── address.service.ts    # Address CRUD service
│       │   │   ├── product.service.ts
│       │   │   ├── cart.service.ts
│       │   │   ├── order.service.ts
│       │   │   ├── review.service.ts
│       │   │   └── wishlist.service.ts
│       │   │
│       │   ├── 📁 guards/        # Route protection
│       │   │   ├── auth.guard.ts  # Logged-in users only
│       │   │   └── admin.guard.ts # Admin users only
│       │   │
│       │   ├── 📁 interceptors/  # HTTP interceptors
│       │   │   └── auth.interceptor.ts # JWT token injection
│       │   │
│       │   ├── 📁 models/        # TypeScript interfaces
│       │   │   └── product.model.ts # All data models
│       │   │
│       │   ├── app.component.ts  # Root component
│       │   ├── app.config.ts     # App configuration (providers)
│       │   └── app.routes.ts     # Routing with lazy loading
│       │
│       ├── styles.css            # Global styles & design system
│       └── index.html            # HTML entry point with SEO
│
└── README.md                      # This file
```

---

## ⚙️ Installation & Setup

### Prerequisites

| Requirement | Version |
|------------|---------|
| **Node.js** | v18+ |
| **npm** | v9+ |
| **MongoDB** | v6+ (running locally or Atlas) |
| **Angular CLI** | v17 (installed via npx) |

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jewellery-website.git
cd jewellery-website
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure the `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jewellery
JWT_SECRET=jewellery_secret_key_2026_luxury
```

Seed the database with sample data:

```bash
node seed.js
```

Start the backend server:

```bash
node server.js
# Output: MongoDB connected successfully
# Output: Server running on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npx ng serve
# Output: Application running on http://localhost:4200/
```

### 4. Open in Browser

```
Frontend:  http://localhost:4200
Backend:   http://localhost:5000
```

---

## 🔐 Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@jewellery.com` | `admin123` | Full admin panel + all user features |
| **User** | `john@example.com` | `user123` | Shop, cart, checkout, dashboard |

---

## 📄 Pages & Features

### 🏠 Home Page (`/`)

| Section | Description |
|---------|------------|
| **Hero** | Full-viewport banner with gradient overlay, heading, CTA buttons, animated stats (500+ Designs, 10K+ Customers, 100% Certified) — **Premium Collection 2026 Edition** |
| **Featured Products** | 4-column grid of featured items with image zoom hover, "Best Seller" badge, price, rating |
| **Categories** | 5 category cards (Rings, Necklaces, Earrings, Bracelets, Watches) with overlay effect |
| **Best Sellers** | Horizontal carousel slider with navigation buttons |
| **Why Choose Us** | 4 icon cards — Premium Quality, Certified Gold, Free Shipping, Easy Returns |
| **Testimonials** | 3-column grid of customer reviews with avatars and ratings |
| **Newsletter** | Email subscription form with success message |

---

### 🛍️ Shop Page (`/shop`)

| Feature | Description |
|---------|------------|
| **Sidebar Filters** | Category, Gold Type (18K/22K/24K/Silver/Platinum), Price Range (min-max), Rating |
| **Search** | Real-time text search across product name, description, category |
| **Sorting** | Latest, Price Low→High, Price High→Low, Top Rated |
| **Pagination** | Navigate between pages, 12 products per page |
| **URL Params** | Direct category links from navbar/footer (e.g., `/shop?category=Rings`) |

---

### 📦 Product Detail Page (`/product/:id`)

| Feature | Description |
|---------|------------|
| **Image Gallery** | Main image with mouse-follow zoom effect, thumbnail selector |
| **Product Info** | Name, category badge, rating stars, price, description |
| **Specifications** | Gold Type, Weight, Stock availability |
| **Actions** | Quantity selector, Add to Cart, Add to Wishlist, Buy Now |
| **Reviews** | Customer reviews list + submit review form (star rating + comment) |

---

### 🛒 Cart Page (`/cart`)

| Feature | Description |
|---------|------------|
| **Item List** | Product image, name, type, unit price, quantity controls (±), remove button |
| **Summary** | Subtotal, Shipping (FREE), Total |
| **Empty State** | Friendly message with "Shop Now" CTA when cart is empty |
| **Proceed** | "Proceed to Checkout" button |

---

### 💳 Checkout Page (`/checkout`)

| Feature | Description |
|---------|------------|
| **Shipping Selection** | Choose from **Saved Addresses** with one click or add a new one |
| **Payment** | Cash on Delivery / Online Payment radio selection |
| **Order Summary** | Item list with thumbnails, quantities, totals |
| **Place Order** | Creates order, clears cart, redirects to dashboard |

---

### 🔑 Login / Register (`/login`, `/register`)

| Feature | Description |
|---------|------------|
| **Login** | Email + Password, error messages, role-based redirect (admin → `/admin`, user → `/dashboard`) |
| **Register** | Name, Email, Phone, Password with validation (min 6 chars) |
| **Design** | Centered card with radial gradient background, **Circular Kairo Jewellery Logo** |

---

### 👤 User Dashboard (`/dashboard`)

| Tab | Features |
|-----|----------|
| **Profile** | Avatar, account stats (Orders, Wishlist, Addresses), **Edit Profile** (Name, Phone), Member Since date |
| **Orders** | Order cards with tracking bar, status, and **Invoice Download (PDF)** |
| **Addresses** | Manage multiple shipping addresses (Add, Edit, Delete, Set Default) |
| **Wishlist** | 4-column grid of saved products with remove button |

---

### 🛡️ Admin Panel (`/admin`)

| Tab | Features |
|-----|----------|
| **Dashboard** | 4 stat cards (Total Orders, Users, Revenue, Products), Order Status bar chart, Monthly Sales bar chart |
| **Products** | Data table (image, name, price, category, stock, rating), Add/Edit product form with fields for name, price, category, gold type, weight, stock, description, image URL, featured/best seller toggles, Delete button |
| **Orders** | Data table with order ID, customer, items count, total, status badge, date, status dropdown to change status (Pending/Processing/Shipped/Delivered) |
| **Users** | Data table with name, email, phone, role badge, join date, delete button (admin users protected) |

---

## 🛠️ REST API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `POST` | `/api/register` | ❌ | Register new user |
| `POST` | `/api/login` | ❌ | Login, returns JWT token |
| `GET` | `/api/profile` | 🔑 User | Get current user profile |
| `GET` | `/api/users` | 🛡️ Admin | List all users |
| `DELETE` | `/api/users/:id` | 🛡️ Admin | Delete a user |

### Products

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `GET` | `/api/products` | ❌ | List products (supports `?category`, `?goldType`, `?minPrice`, `?maxPrice`, `?rating`, `?sort`, `?search`, `?page`, `?limit`, `?featured`, `?bestSeller`) |
| `GET` | `/api/products/:id` | ❌ | Get single product |
| `POST` | `/api/products` | 🛡️ Admin | Create product |
| `PUT` | `/api/products/:id` | 🛡️ Admin | Update product |
| `DELETE` | `/api/products/:id` | 🛡️ Admin | Delete product |
| `GET` | `/api/products/stats` | 🛡️ Admin | Product statistics |

### Cart

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `GET` | `/api/cart` | 🔑 User | Get user's cart |
| `POST` | `/api/cart/add` | 🔑 User | Add item to cart (`{ productId, quantity }`) |
| `PUT` | `/api/cart/update` | 🔑 User | Update item quantity |
| `DELETE` | `/api/cart/remove/:productId` | 🔑 User | Remove item from cart |
| `DELETE` | `/api/cart/clear` | 🔑 User | Clear entire cart |

### Orders

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `POST` | `/api/orders` | 🔑 User | Create new order |
| `GET` | `/api/orders/user` | 🔑 User | Get user's orders |
| `GET` | `/api/orders` | 🛡️ Admin | Get all orders |
| `GET` | `/api/orders/stats` | 🛡️ Admin | Order statistics & analytics |
| `PUT` | `/api/orders/:id/status` | 🛡️ Admin | Update order status |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `POST` | `/api/reviews` | 🔑 User | Create review (`{ productId, rating, comment }`) |
| `GET` | `/api/reviews/:productId` | ❌ | Get product reviews |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `GET` | `/api/wishlist` | 🔑 User | Get user's wishlist |
| `POST` | `/api/wishlist/add` | 🔑 User | Add product to wishlist |
| `DELETE` | `/api/wishlist/remove/:productId` | 🔑 User | Remove from wishlist |

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,           // required, trimmed
  email: String,          // required, unique, lowercase
  password: String,       // required, bcrypt hashed (12 rounds)
  phone: String,          // optional
  role: 'user' | 'admin', // default: 'user'
  createdAt: Date         // auto-generated
}
```

### Products Collection

```javascript
{
  _id: ObjectId,
  name: String,                              // required
  price: Number,                             // required
  category: 'Rings' | 'Necklaces' | 'Earrings' | 'Bracelets' | 'Watches',
  description: String,                       // required
  images: [String],                          // array of URLs
  goldType: '18K' | '22K' | '24K' | 'Silver' | 'Platinum',
  weight: String,                            // e.g. "5.2g"
  stock: Number,                             // default: 0
  rating: Number,                            // 0-5, auto-calculated from reviews
  numReviews: Number,                        // auto-calculated
  featured: Boolean,                         // shown on home page
  bestSeller: Boolean,                       // shown in Best Sellers carousel
  createdAt: Date
}
// Indexes: text(name, description, category), category, price
```

### Orders Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  products: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalPrice: Number,
  address: { name, phone, street, city, pincode },
  paymentMethod: 'COD' | 'Online',
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered',
  createdAt: Date
}
```

### Cart Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  // unique per user
  products: [{
    productId: ObjectId (ref: Product),
    quantity: Number
  }]
}
```

### Wishlist Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  // unique per user
  products: [ObjectId (ref: Product)]
}
```

### Reviews Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  productId: ObjectId (ref: Product),
  rating: Number,      // 1-5
  comment: String,
  createdAt: Date
}
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--gold` | `#D4AF37` | Primary accent, buttons, headings, badges |
| `--gold-light` | `#E8CC6E` | Hover states |
| `--gold-dark` | `#B8960C` | Gradients, pressed states |
| `--black` | `#0D0D0D` | Background primary |
| `--bg-primary` | `#111111` | Page background |
| `--bg-secondary` | `#1A1A1A` | Card backgrounds |
| `--bg-card` | `#1E1E1E` | Surface elements |
| `--text-primary` | `#FFFFFF` | Primary text |
| `--text-secondary` | `#B0B0B0` | Secondary text |
| `--text-muted` | `#777777` | Muted text |
| `--danger` | `#E74C3C` | Error, delete |
| `--success` | `#27AE60` | Success, delivered |
| `--warning` | `#F39C12` | Pending status |
| `--info` | `#3498DB` | Processing status |

### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** (serif) | Headings (h1–h6), hero text, prices |
| **Poppins** (sans-serif) | Body text, buttons, labels, navigation |

### Animations

| Animation | Usage |
|-----------|-------|
| `fadeInUp` | Page sections, product cards |
| `fadeIn` | Tab content, modals |
| `slideInLeft` / `slideInRight` | Carousel, toasts |
| `pulse` | Interactive highlights |
| Hover effects | Image zoom (1.08x), card lift (-4px), shadow glow |

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **JWT Tokens** | 30-day expiry, stored in localStorage |
| **Auth Middleware** | Validates token on every protected request |
| **Admin Middleware** | Checks `role === 'admin'` after auth |
| **Route Guards** | Angular `CanActivateFn` for auth and admin routes |
| **HTTP Interceptor** | Auto-attaches `Authorization: Bearer <token>` header |
| **CORS** | Enabled for cross-origin API access |

---

## ⚡ Performance

| Optimization | Details |
|-------------|---------|
| **Lazy Loading** | All 11 page components are lazy-loaded via dynamic `import()` |
| **Standalone Components** | No NgModules overhead — tree-shakeable |
| **Inventory Control** | Real-time stock restoration on cancellation, bulk stock updates, and cart quantity caps |
| **Image Optimization** | Multer-based server-side validation, enhanced **100MB size limits**, and responsive profile avatars |
| **Error Handling** | Global backend middleware with stack tracing and consistent JSON error responses |
| **CSS Variables** | Single source of truth for theme values — no redundancy |
| **Minimal Dependencies** | No UI framework — custom CSS for smallest bundle |

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| **Desktop** (1024px+) | 4-column product grid, side-by-side layouts, full navbar |
| **Tablet** (768px–1024px) | 2-column product grid, stacked forms |
| **Mobile** (<768px) | 1-column layout, hamburger menu, stackable filters, full-width buttons |

---

## 🚀 Deployment

### Backend (e.g., Railway, Render, Heroku)

```bash
# Set environment variables:
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/jewellery
JWT_SECRET=<your-strong-secret>

# Start command:
node server.js
```

### Frontend (e.g., Vercel, Netlify, Firebase Hosting)

```bash
cd frontend
npx ng build --configuration production

# Deploy the dist/frontend/browser/ folder
```

> **Note**: Update the API base URL in all service files from `http://localhost:5000` to your deployed backend URL before building.

---

## 📊 Seeded Data

The `seed.js` script creates:

- **2 Users** — 1 admin + 1 sample user
- **20 Products** across 5 categories:
  - 4 Rings (₹18,000 – ₹62,000)
  - 4 Necklaces (₹28,000 – ₹95,000)
  - 4 Earrings (₹15,000 – ₹48,000)
  - 4 Bracelets (₹19,000 – ₹85,000)
  - 4 Watches (₹55,000 – ₹1,80,000)

---

## 📝 License

This project is for educational and portfolio purposes.

---

<p align="center">
  Crafted with 💛 by Kairo Jewellery Team
</p>
