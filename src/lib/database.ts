// src/lib/database.ts
import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Helper to generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize database
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  });

  // Check if database exists in localStorage
  const savedDb = localStorage.getItem('cafebianca_db');
  
  if (savedDb) {
    // Load existing database
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uint8Array);
    console.log('✅ Loaded existing database from localStorage');
  } else {
    // Create new database
    db = new SQL.Database();
    console.log('✅ Created new database');
    
    // Create tables
    createTables(db);
    
    // Save to localStorage
    saveDatabase(db);
  }

  return db;
}

// Create database tables
function createTables(database: Database) {
  database.exec(`
    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id TEXT,
      image_url TEXT,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  console.log('✅ Database tables created');
}

// Save database to localStorage
export function saveDatabase(database: Database) {
  const data = database.export();
  const buffer = JSON.stringify(Array.from(data));
  localStorage.setItem('cafebianca_db', buffer);
}

// Get database instance
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// ==================== CATEGORIES ====================

export async function getAllCategories() {
  const database = getDatabase();
  const result = database.exec(`
    SELECT * FROM categories 
    WHERE is_active = 1 
    ORDER BY display_order
  `);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

export async function createCategory(data: {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}) {
  const database = getDatabase();
  const id = generateId();

  database.run(`
    INSERT INTO categories (id, name, description, display_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `, [
    id,
    data.name,
    data.description || null,
    data.display_order || 0,
    data.is_active ? 1 : 0
  ]);

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM categories WHERE id = ?`, [id]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const category: any = {};
  columns.forEach((col, idx) => {
    category[col] = values[idx];
  });
  
  return category;
}

export async function updateCategory(id: string, data: {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}) {
  const database = getDatabase();

  database.run(`
    UPDATE categories 
    SET name = ?, description = ?, display_order = ?, is_active = ?
    WHERE id = ?
  `, [
    data.name,
    data.description || null,
    data.display_order || 0,
    data.is_active ? 1 : 0,
    id
  ]);

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM categories WHERE id = ?`, [id]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const category: any = {};
  columns.forEach((col, idx) => {
    category[col] = values[idx];
  });
  
  return category;
}

export async function deleteCategory(id: string) {
  const database = getDatabase();

  const checkResult = database.exec(
    `SELECT COUNT(*) FROM products WHERE category_id = ?`,
    [id]
  );

  const rawCount = checkResult?.[0]?.values?.[0]?.[0];
  const count = Number(rawCount ?? 0);

  if (count > 0) {
    throw new Error('Cannot delete category with products');
  }

  database.run(`DELETE FROM categories WHERE id = ?`, [id]);
  saveDatabase(database);
}



// ==================== PRODUCTS ====================

export async function getAllProducts(includeUnavailable = false) {
  const database = getDatabase();
  
  const query = includeUnavailable
    ? `SELECT * FROM products ORDER BY name`
    : `SELECT * FROM products WHERE is_available = 1 ORDER BY name`;

  const result = database.exec(query);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

export async function createProduct(data: {
  name: string;
  price: number;
  category_id?: string;
  image_url?: string;
  description?: string;
  is_available?: boolean;
}) {
  const database = getDatabase();
  const id = generateId();

  database.run(`
    INSERT INTO products (id, name, price, category_id, image_url, description, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    data.name,
    data.price,
    data.category_id || null,
    data.image_url || null,
    data.description || null,
    data.is_available ? 1 : 0
  ]);

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM products WHERE id = ?`, [id]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const product: any = {};
  columns.forEach((col, idx) => {
    product[col] = values[idx];
  });
  
  return product;
}

export async function updateProduct(id: string, data: {
  name: string;
  price: number;
  category_id?: string;
  image_url?: string;
  description?: string;
  is_available?: boolean;
}) {
  const database = getDatabase();

  database.run(`
    UPDATE products 
    SET name = ?, price = ?, category_id = ?, image_url = ?, description = ?, is_available = ?
    WHERE id = ?
  `, [
    data.name,
    data.price,
    data.category_id || null,
    data.image_url || null,
    data.description || null,
    data.is_available ? 1 : 0,
    id
  ]);

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM products WHERE id = ?`, [id]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const product: any = {};
  columns.forEach((col, idx) => {
    product[col] = values[idx];
  });
  
  return product;
}

export async function deleteProduct(id: string) {
  const database = getDatabase();
  database.run(`DELETE FROM products WHERE id = ?`, [id]);
  saveDatabase(database);
}

// ==================== ORDERS ====================

export async function getAllOrders() {
  const database = getDatabase();
  
  const ordersResult = database.exec(`
    SELECT * FROM orders 
    ORDER BY created_at DESC 
    LIMIT 50
  `);

  if (ordersResult.length === 0) return [];

  const columns = ordersResult[0].columns;
  const values = ordersResult[0].values;

  const orders = values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });

  // Get items for each order
  return orders.map(order => {
    const itemsResult = database.exec(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);

    const order_items = itemsResult.length > 0 
      ? itemsResult[0].values.map(row => {
          const item: any = {};
          itemsResult[0].columns.forEach((col, idx) => {
            item[col] = row[idx];
          });
          return {
            ...item,
            products: { name: item.product_name }
          };
        })
      : [];

    return {
      ...order,
      order_items
    };
  });
}

export async function createOrder(data: {
  total_amount: number;
  status?: string;
  payment_method: string;
  customer_name?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_time: number;
    notes?: string;
  }>;
}) {
  const database = getDatabase();
  const orderId = generateId();
  const orderNumber = `ORD-${Date.now()}`;

  // Insert order
  database.run(`
    INSERT INTO orders (id, order_number, customer_name, total_amount, status, payment_method)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    orderId,
    orderNumber,
    data.customer_name || null,
    data.total_amount,
    data.status || 'pending',
    data.payment_method
  ]);

  // Insert order items
  data.items.forEach(item => {
    database.run(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price_at_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      generateId(),
      orderId,
      item.product_id,
      item.quantity,
      item.price_at_time,
      item.notes || null
    ]);
  });

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const order: any = {};
  columns.forEach((col, idx) => {
    order[col] = values[idx];
  });
  
  return order;
}

export async function updateOrder(id: string, data: {
  status: string;
  completed_at?: string;
}) {
  const database = getDatabase();

  database.run(`
    UPDATE orders 
    SET status = ?, completed_at = ?
    WHERE id = ?
  `, [
    data.status,
    data.completed_at || null,
    id
  ]);

  saveDatabase(database);

  const result = database.exec(`SELECT * FROM orders WHERE id = ?`, [id]);
  const columns = result[0].columns;
  const values = result[0].values[0];
  
  const order: any = {};
  columns.forEach((col, idx) => {
    order[col] = values[idx];
  });
  
  return order;
}

export async function deleteOrder(id: string) {
  const database = getDatabase();
  
  // Delete order items
  database.run(`DELETE FROM order_items WHERE order_id = ?`, [id]);
  
  // Delete order
  database.run(`DELETE FROM orders WHERE id = ?`, [id]);
  
  saveDatabase(database);
}