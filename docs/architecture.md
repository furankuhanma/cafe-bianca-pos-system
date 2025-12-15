# Cafe Bianca POS System - Architecture

## 📋 Overview
A scalable, cloud-based Point of Sale system for coffee shops built with React and Supabase. Designed for fast order processing, real-time updates, and comprehensive sales tracking.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                     (React Application)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   POS View   │  │   Kitchen    │  │   Reports    │      │
│  │   (Cashier)  │  │   Display    │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Products   │  │  Categories  │  │    Order     │      │
│  │  Management  │  │  Management  │  │   History    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Supabase Client SDK
                            │ (REST API / Realtime)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │   PostgreSQL   │    │   Realtime     │                   │
│  │    Database    │◄───┤   Subscriptions│                   │
│  └────────────────┘    └────────────────┘                   │
│                                                               │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │      Auth      │    │    Storage     │                   │
│  │   (Optional)   │    │  (for images)  │                   │
│  └────────────────┘    └────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite (via bolt.new)
- **Styling:** Tailwind CSS
- **State Management:** React Context API + Hooks
- **Routing:** React Router v6
- **UI Components:** Headless UI / Radix UI (for accessibility)
- **Icons:** Lucide React

### Backend (Supabase)
- **Database:** PostgreSQL 15
- **API:** Auto-generated REST API
- **Real-time:** WebSocket subscriptions
- **Storage:** For product images (optional)
- **Functions:** Edge Functions (for complex operations)

### DevOps
- **Version Control:** Git + GitHub
- **Deployment:** Netlify / Vercel
- **Environment:** `.env` files for secrets

---

## 🗄️ Database Schema

### Core Tables

#### `categories`
Stores product categories (user-defined)
- `id` (uuid, PK)
- `name` (text, unique)
- `description` (text)
- `display_order` (integer)
- `is_active` (boolean)
- `created_at` (timestamp)

#### `products`
All menu items
- `id` (uuid, PK)
- `name` (text)
- `price` (numeric)
- `category_id` (uuid, FK → categories)
- `image_url` (text)
- `is_available` (boolean)
- `created_at` (timestamp)

#### `orders`
Customer orders
- `id` (uuid, PK)
- `order_number` (text, unique, auto-generated)
- `customer_name` (text, optional)
- `total_amount` (numeric)
- `status` (enum: pending, completed, cancelled)
- `payment_method` (enum: cash, gcash)
- `created_at` (timestamp)
- `completed_at` (timestamp, nullable)

#### `order_items`
Line items for each order
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders)
- `product_id` (uuid, FK → products)
- `quantity` (integer)
- `price_at_time` (numeric) - snapshot of price
- `notes` (text) - customizations
- `created_at` (timestamp)

### Relationships
```
categories (1) ──── (many) products
orders (1) ──── (many) order_items
products (1) ──── (many) order_items
```

---

## 🎨 Frontend Architecture

### Project Structure
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Input.jsx
│   ├── pos/             # POS-specific components
│   │   ├── ProductGrid.jsx
│   │   ├── OrderCart.jsx
│   │   └── PaymentModal.jsx
│   ├── products/        # Product management
│   │   ├── ProductForm.jsx
│   │   └── ProductList.jsx
│   └── layout/          # Layout components
│       ├── Sidebar.jsx
│       └── Header.jsx
├── pages/
│   ├── POSView.jsx
│   ├── ProductsPage.jsx
│   ├── OrderHistoryPage.jsx
│   └── DashboardPage.jsx
├── hooks/
│   ├── useProducts.js   # Fetch/manage products
│   ├── useOrders.js     # Order operations
│   └── useCategories.js # Category operations
├── context/
│   ├── CartContext.jsx  # Shopping cart state
│   └── AuthContext.jsx  # Authentication (future)
├── lib/
│   ├── supabase.js      # Supabase client config
│   └── utils.js         # Helper functions
├── App.jsx
└── main.jsx
```

### State Management Strategy

**Local State (useState)**
- Form inputs
- Modal open/close
- UI toggles

**Context API**
- Shopping cart
- Current order
- User session (future)

**Server State (Supabase)**
- Products
- Orders
- Categories
- Real-time subscriptions

---

## 🔄 Data Flow

### Creating an Order
```
User Action (Click "Add to Cart")
    ↓
Update Cart Context (in-memory)
    ↓
User clicks "Complete Order"
    ↓
POST to Supabase `orders` table
    ↓
POST to Supabase `order_items` table (batch)
    ↓
Clear cart
    ↓
Show success message
    ↓
Redirect to order confirmation
```

### Real-time Updates (Kitchen Display)
```
Supabase Realtime Channel
    ↓
Listen to `orders` table changes
    ↓
Filter: status = 'pending'
    ↓
Update UI automatically when new orders arrive
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)
For MVP: Allow all operations (public mode)
For Production:
- Implement authentication
- Restrict write access to authenticated users
- Separate cashier/admin roles

### Environment Variables
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Performance Optimizations

### Frontend
- Lazy load routes with `React.lazy()`
- Memoize expensive calculations with `useMemo`
- Debounce search inputs
- Virtualize long lists (react-window)

### Database
- Indexed columns: `category_id`, `status`, `created_at`
- Pagination for order history (50 orders per page)
- Cache product list in localStorage

### Network
- Optimize images (compress before upload)
- Use Supabase CDN for images
- Batch insert order_items

---

## 📊 Scalability Plan

### Current (MVP)
- Single-location support
- ~100 orders/day capacity
- Basic analytics

### Phase 2
- Multi-location support
- User roles (cashier, manager, admin)
- Advanced analytics (charts, trends)

### Phase 3
- Mobile app (React Native)
- Inventory management
- Customer loyalty program
- Integration with payment gateways

---

## 🧪 Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Component logic

### Integration Tests
- Supabase queries
- Order creation flow
- Payment processing

### E2E Tests (Future)
- Complete order workflow
- Product management
- Report generation

---

## 📝 API Design

### Supabase Queries

**Fetch Products**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*, categories(*)')
  .eq('is_available', true)
  .order('name');
```

**Create Order**
```javascript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    customer_name,
    total_amount,
    status: 'pending',
    payment_method
  })
  .select()
  .single();

// Then insert order items
const { error: itemsError } = await supabase
  .from('order_items')
  .insert(items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_time: item.price
  })));
```

---

## 🎯 Key Design Decisions

1. **Supabase over custom backend**: Faster development, built-in real-time
2. **React Context over Redux**: Simpler for small-medium state
3. **Tailwind over CSS-in-JS**: Faster styling, smaller bundle
4. **Vite over CRA**: Faster builds, better DX
5. **PostgreSQL**: ACID compliance for financial data

---

## 📚 Documentation Standards

- All components have JSDoc comments
- Complex functions include inline comments
- README.md for setup instructions
- API documentation in separate file
- Changelog for version tracking

---

## 🔄 Development Workflow

1. Design feature in TODO.md
2. Create branch (`feature/feature-name`)
3. Implement with tests
4. Test locally
5. Push to GitHub
6. Deploy preview on Netlify
7. Merge to main
8. Auto-deploy to production

---

## 📞 Support & Maintenance

- Monitor Supabase logs for errors
- Set up error tracking (Sentry)
- Weekly database backups
- Monthly dependency updates
- Quarterly security audits