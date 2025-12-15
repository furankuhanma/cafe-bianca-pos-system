Phase 1 (MVP): 10 major sections with ~80+ specific tasks
# 🧠 Cafe Bianca POS System — TODO

## Phase 1 (MVP)

Goal: Build a usable POS system that allows a coffee shop to take orders, store transactions, and view basic analytics.

---

## 1️⃣ Project Setup & Tooling

* [/] Initialize Git repository
* [/] Create GitHub repository
* [/] Set up Vite + React project
* [/] Install Tailwind CSS
* [/] Configure Tailwind theme (colors, fonts)
* [/] Set up ESLint + Prettier
* [/] Create basic folder structure (`components`, `pages`, `hooks`, etc.)
* [/] Add README.md (project overview, MVP scope)
* [/] Add TODO.md (this file)
* [/] Configure environment variables support (`.env`)

---

## 2️⃣ Supabase Setup & Configuration

* [/] Create Supabase project
* [/] Get Supabase URL and anon key
* [/] Configure `supabase.js` client
* [/] Test Supabase connection from frontend
* [/] Enable Row Level Security (RLS)
* [/] Set temporary public access for MVP
* [/] Create development and production environments

---

## 3️⃣ Database Schema Implementation

* [ ] Create `categories` table
* [ ] Create `products` table
* [ ] Create `orders` table
* [ ] Create `order_items` table
* [ ] Define foreign key relationships
* [ ] Add indexes (`status`, `created_at`, `category_id`)
* [ ] Create enum types (`order_status`, `payment_method`)
* [ ] Seed initial categories (Coffee, Non-Coffee, Pastries)
* [ ] Seed sample products

---

## 4️⃣ Core Layout & Navigation

* [ ] Build base layout component
* [ ] Create sidebar navigation
* [ ] Create header component
* [ ] Add responsive layout (tablet-friendly)
* [ ] Set up React Router
* [ ] Define routes (POS, Products, Orders, Dashboard)
* [ ] Add active route highlighting
* [ ] Handle 404 page

---

## 5️⃣ Product & Category Management

* [ ] Fetch categories from Supabase
* [ ] Fetch products from Supabase
* [ ] Display products in grid view
* [ ] Filter products by category
* [ ] Show product availability status
* [ ] Create product form UI
* [ ] Add new product (name, price, category)
* [ ] Edit existing product
* [ ] Enable/disable product availability
* [ ] Validate product inputs

---

## 6️⃣ POS Ordering Flow (Core MVP Feature)

* [ ] Create POS view page
* [ ] Implement product click → add to cart
* [ ] Create Cart Context
* [ ] Display cart items
* [ ] Update item quantity (+ / -)
* [ ] Remove item from cart
* [ ] Calculate subtotal and total
* [ ] Handle empty cart state
* [ ] Add notes/customizations per item

---

## 7️⃣ Order Creation & Persistence

* [ ] Create order submission logic
* [ ] Insert order into `orders` table
* [ ] Insert order items into `order_items`
* [ ] Generate unique order number
* [ ] Handle payment method selection
* [ ] Show order success confirmation
* [ ] Clear cart after successful order
* [ ] Handle error states (failed insert)
* [ ] Prevent duplicate submissions

---

## 8️⃣ Order History & Queue

* [ ] Fetch orders from Supabase
* [ ] Display order list (latest first)
* [ ] View order details (items, total)
* [ ] Filter by order status
* [ ] Mark order as completed
* [ ] Mark order as cancelled
* [ ] Display order timestamps
* [ ] Add basic pagination

---

## 9️⃣ Basic Analytics Dashboard

* [ ] Create dashboard page
* [ ] Show total orders (daily)
* [ ] Show total sales amount
* [ ] Show completed vs cancelled orders
* [ ] Fetch aggregated data from Supabase
* [ ] Display simple cards (KPIs)
* [ ] Handle empty/no data state
* [ ] Refresh analytics in real-time or on load

---

## 🔟 UX, Validation & Polish

* [ ] Add loading states (skeletons/spinners)
* [ ] Add confirmation modals (complete/cancel order)
* [ ] Improve button states (disabled, hover)
* [ ] Format prices consistently
* [ ] Improve error messages (user-friendly)
* [ ] Ensure keyboard accessibility
* [ ] Mobile responsiveness check
* [ ] Final MVP bug fixing & cleanup

---

## ✅ Phase 1 Exit Criteria (MVP Done When):

* Cashier can create an order in under 30 seconds
* Orders are saved reliably in database
* Order history is viewable
* Basic sales numbers are visible
* App runs without crashes in normal usage

---

📌 Next: Phase 2 (Auth, roles, multi-location, inventory)




Phase 2: Future enhancements (auth, analytics, kitchen display)

Known issues tracker

Nice-to-have ideas

Definition of done checklist