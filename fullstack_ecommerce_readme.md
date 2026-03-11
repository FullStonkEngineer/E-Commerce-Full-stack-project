# Full-Stack E-Commerce Project

This repository contains a full-stack e-commerce application built with **Node.js**, **Express**, **MongoDB**, **Stripe**, **Zustand**, and **React**. It features user authentication, product management, shopping cart functionality, coupons, Stripe payment integration, and an admin dashboard.

---

## Table of Contents

- [Backend](#backend)
  - [Controllers](#controllers)
    - [Analytics](#analytics)
    - [Auth](#auth)
    - [Cart](#cart)
    - [Coupon](#coupon)
    - [Payment](#payment)
    - [Product](#product)
    - [Stripe Webhook](#stripe-webhook)
  - [Middleware](#middleware)
    - [Auth Middleware](#auth-middleware)
  - [API Utility Modules](#api-utility-modules)
    - [axios.js](#axiosjs)
    - [refreshManager.js](#refreshmanagerjs)
    - [imageToBase64.js](#imagetobase64js)
- [Frontend](#frontend)
  - [Stores](#stores)
    - [Cart Store](#cart-store-zustand)
    - [Product Store](#product-store-zustand)
    - [User Authentication Store](#user-authentication-store-zustand)
- [Styling Approach](#styling-approach)
- [Dependencies](#dependencies)

---

## Backend

### Controllers

#### Analytics

- Handles analytics data for the admin dashboard.
- Responsibilities:
  - Aggregate store metrics: total users, products, sales, revenue
  - Generate daily sales data for charts
  - Fill missing dates for continuous timelines
  - Optimize database queries using `Promise.all` and MongoDB aggregations
- Notes:
  - `countDocuments` used for accuracy
  - Could cache responses to reduce DB load on high traffic

#### Auth

- Manages authentication and JWT refresh logic.
- Uses **Redis** to:
  - Invalidate tokens
  - Enable forced logout
  - Prevent refresh token reuse attacks
- Tokens:
  - Access tokens: 15 min expiry
  - Refresh tokens stored in httpOnly cookies (`sameSite: strict`)
- Pros: scalable, secure, widely used
- Tradeoffs: token revocation complexity, stateful JWT

#### Cart

- Embedded in the User document.
- Stores cart items as `{ product: ObjectId, quantity }`.
- Endpoints support:
  - Add, update, remove items
  - Fetch cart with product details
- Design Decisions:
  - Embedded cart simplifies queries and transactions
  - Hydration merges product info on fetch
  - Input validation and safe error handling implemented

#### Coupon

- Manages user-specific coupons with:
  - `code`, `discountPercentage`, `expirationDate`, `isActive`
- Supports:
  - Retrieve active coupon
  - Validate coupon before checkout
- Design Decisions:
  - User-scoped for targeted promotions
  - Lazy expiration handling
  - Only necessary coupon data returned

#### Payment

- Handles Stripe checkout sessions and automated reward coupons.
- Responsibilities:
  - Validate products & quantities
  - Apply user coupons
  - Auto-generate reward coupons for large orders (≥ $200)
  - Return Stripe checkout URL
- Tradeoffs:
  - Product verification requires extra DB queries
  - Coupons handled lazily
  - Metadata stored for order fulfillment and analytics

#### Product

- CRUD operations for products.
- Fetch featured, recommended, and category-specific products.
- Uses Redis to cache featured products for 1 hour.
- Design Considerations:
  - `$sample` used for recommended products
  - Clear error handling and validation
  - Cache updated on deletion or toggle

#### Stripe Webhook

- Handles `checkout.session.completed` events.
- Responsibilities:
  - Ensure idempotency
  - Validate products from DB
  - Deactivate coupon after successful order
- Tradeoffs:
  - Extra DB read for product validation
  - Metadata ensures accurate pricing
  - Logs internal errors, minimal client response

---

### Middleware

#### Auth Middleware

- Protects sensitive routes and enforces authentication.
- Tradeoffs:
  - Stateless JWT makes revocation more complex
  - Admin check assumes a string role

---

### API Utility Modules

#### axios.js

- Centralized Axios instance for API requests.
- Features:
  - Environment-aware `baseURL`
  - Cookies (`withCredentials: true`)
  - Automatic token refresh with retry
- Benefits:
  - Avoids repeated refresh handling
  - Prevents race conditions

#### refreshManager.js

- Ensures only one token refresh occurs at a time.
- Prevents:
  - Duplicate refresh requests
  - Race conditions
  - Invalid session states

#### imageToBase64.js

- Converts image files to Base64 strings for API upload.
- Usage:

```js
const base64Image = await fileToBase64(file);
```

- Simplifies client-side image uploads.

---

## Frontend

### Stores

#### Cart Store (Zustand)

- Manages cart items, coupon logic, and totals.
- Features:
  - Fetch, add, remove, update cart items
  - Apply and remove coupons
  - Optimistic UI updates
  - Local total calculation for responsiveness
- Errors surfaced via toast notifications.

#### Product Store (Zustand)

- Manages frontend product state.
- Features:
  - CRUD operations
  - Fetch products by category and featured
  - Toggle featured status
- Updates local state after API calls to reduce network requests.

#### User Authentication Store (Zustand)

- Manages authenticated user state.
- Features:
  - Signup, login, logout
  - Check auth on app load
  - Refresh access tokens
- Integrates with refresh manager to coordinate token refreshes.
- State persisted via httpOnly cookies.

---

### Styling Approach

- **Tailwind CSS** with component-driven abstraction.
- Reusable UI primitives:
  - `FormInput`, `FormCard`, `PageContainer`, `Card`, `PrimaryButton`, `PrimaryIconButton`
- Benefits:
  - No global CSS conflicts
  - Predictable styling
  - Fast iteration
- Conditional styling handled via `clsx`.
- Framer Motion used for animations across pages and components.

---

### Routing & Page Structure

- **React Router v6** used for client-side routing.
- Auth-protected routes redirect automatically:
  - `/secret-dashboard` → Admin dashboard (admin-only)
  - `/cart` → Login required
  - Purchase pages → Login required
- Core pages:
  - `HomePage` – landing page, features `FeaturedProducts`, category sections
  - `CategoryPage` – lists products by category
  - `LoginPage` / `SignupPage` – auth forms with toast error handling
  - `CartPage` – cart items, totals, coupon input, Stripe checkout
  - `AdminPage` – dashboard for admins
  - `PurchaseSuccessPage` / `PurchaseCancelPage` – post-checkout flows

---

### Key Components

#### ProductCard

- Displays product image, name, price.
- `Add to Cart` button with auth check.
- Uses `useCartStore.addToCart` and toast notifications.
- Overlay and hover effects with Tailwind styling.

#### CategoryItem

- Clickable category card linking to `/category/:category`.
- Background image with gradient overlay.
- Hover scale animation for engagement.

#### FeaturedProducts

- Responsive carousel of featured products (1–4 items per screen depending on viewport).
- Prev/Next buttons with disabled state at edges.
- Uses `ProductCard` internally.
- Smooth transition and slide effect.

---

### Complex Pages

#### AdminPage

- Layout: `AdminLayout` + `AdminTabs`.
- Tabs:
  1. **Create Product** – Form for adding products with image upload.
  2. **Products List** – Table of products with delete/toggle featured.
  3. **Analytics** – Summary cards + daily sales line chart (`Recharts`).
- Integrates `useProductStore` for CRUD & analytics.
- Animations via Framer Motion for smooth transitions.

#### LoginPage

- Form with email/password fields.
- Uses `useUserStore.login`.
- Handles error states via `react-hot-toast`.
- Redirects logged-in users away from login.
- Loading spinner while authenticating.

#### CartPage

- Lists cart items (`CartItem` component).
- Subtotal, discount, and total displayed.
- Coupon input handled by `useCartStore`.
- Checkout button integrated with Stripe backend.
- Optimistic UI updates on quantity changes.
- Auth-protected, responsive design.

## Dependencies

### Backend

"dependencies":
"bcryptjs": "^2.4.3",
"cloudinary": "^2.4.0",
"cookie-parser": "^1.4.6",
"cors": "^2.8.6",
"dotenv": "^16.4.5",
"express": "^4.19.2",
"ioredis": "^5.4.1",
"jsonwebtoken": "^9.0.2",
"mongoose": "^8.5.3",
"stripe": "^16.8.0"

"devDependencies":
"nodemon": "^3.1.11"

### Frontend

"dependencies":
"@stripe/stripe-js": "^8.7.0",
"axios": "^1.13.5",
"clsx": "^2.1.1",
"framer-motion": "^12.34.0",
"lucide-react": "^0.564.0",
"react": "^18.2.0",
"react-confetti": "^6.4.0",
"react-dom": "^18.2.0",
"react-hot-toast": "^2.6.0",
"react-router-dom": "^6.30.3",
"recharts": "^3.7.0",
"zustand": "^5.0.11"

"devDependencies":
"@eslint/js": "^9.39.1",
"@types/react": "^19.2.7",
"@types/react-dom": "^19.2.3",
"@vitejs/plugin-react": "^5.1.1",
"autoprefixer": "^10.4.24",
"eslint": "^9.39.1",
"eslint-plugin-react-hooks": "^7.0.1",
"eslint-plugin-react-refresh": "^0.4.24",
"globals": "^16.5.0",
"postcss": "^8.5.6",
"tailwindcss": "^3.4.19",
"vite": "^7.3.1"
