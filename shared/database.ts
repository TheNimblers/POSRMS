// Database schema definitions for POSRMS
// This file defines the structure of all database tables

export interface Staff {
  id: string;
  username: string;
  password_hash: string;
  role: "waiter" | "kitchen" | "bar" | "manager" | "admin" | "team";
  restaurant_id?: string;
  name: string;
  email?: string;
  status: "active" | "inactive" | "suspended";
  permissions: string[];
  shift?: "day" | "evening" | "night";
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Table {
  id: number;
  restaurant_id: string;
  number: string;
  capacity: number;
  status: "available" | "active" | "maintenance" | "reserved";
  assigned_waiter?: string;
  qr_code: string;
  position_x?: number;
  position_y?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  session_id: string;
  restaurant_id: string;
  table_id: number;
  items: OrderItem[];
  status: "new" | "preparing" | "ready" | "served" | "paid" | "cancelled";
  type: "food" | "drink" | "mixed";
  total_amount: number;
  notes?: string;
  waiter_id?: string;
  created_at: string;
  updated_at: string;
  estimated_time?: number;
  actual_time?: number;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
}

export interface Session {
  id: string;
  table_id: number;
  restaurant_id: string;
  start_time: string;
  end_time?: string;
  total_amount: number;
  customer_count: number;
  waiter_id?: string;
  status: "active" | "completed" | "cancelled";
  payment_status: "pending" | "partial" | "paid";
  payment_method?: "cash" | "card" | "digital";
  tip_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  category:
    | "starter"
    | "main"
    | "dessert"
    | "drink"
    | "wine"
    | "beer"
    | "cocktail"
    | "special";
  price_eur: number;
  price_usd: number;
  available: boolean;
  special: boolean;
  allergens?: string[];
  image_url?: string;
  preparation_time: number;
  ingredients?: string[];
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  subscription_status: "trial" | "active" | "suspended" | "cancelled";
  subscription_plan: "trial" | "monthly" | "yearly";
  admins: string[];
  contact_email: string;
  address?: string;
  phone?: string;
  timezone: string;
  currency: "EUR" | "USD";
  tax_rate: number;
  service_charge: number;
  settings: RestaurantSettings;
  created_at: string;
  updated_at: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
}

export interface RestaurantSettings {
  allow_guest_orders: boolean;
  max_table_capacity: number;
  order_timeout_minutes: number;
  auto_assign_waiters: boolean;
  require_payment_confirmation: boolean;
  enable_tips: boolean;
  enable_reviews: boolean;
  kitchen_display_timeout: number;
  bar_display_timeout: number;
}

export interface Notification {
  id: string;
  restaurant_id: string;
  user_id?: string;
  type:
    | "table_activated"
    | "call_waiter"
    | "payment_requested"
    | "order_ready"
    | "system"
    | "subscription";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  expires_at?: string;
}

export interface AuditLog {
  id: string;
  restaurant_id?: string;
  user_id: string;
  action: string;
  entity_type: "order" | "table" | "menu" | "staff" | "restaurant" | "system";
  entity_id?: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan: "trial" | "monthly" | "yearly";
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  price: number;
  currency: "EUR" | "USD";
  payment_method?: string;
  payment_provider?: "stripe" | "paypal" | "mollie";
  payment_provider_id?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
}

export interface Payment {
  id: string;
  session_id: string;
  restaurant_id: string;
  amount: number;
  currency: "EUR" | "USD";
  method: "cash" | "card" | "digital";
  status: "pending" | "completed" | "failed" | "refunded";
  provider?: "stripe" | "paypal" | "mollie";
  provider_transaction_id?: string;
  tip_amount?: number;
  processing_fee?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Review {
  id: string;
  session_id: string;
  restaurant_id: string;
  table_id: number;
  rating: number; // 1-5 stars
  comment?: string;
  service_rating?: number;
  food_rating?: number;
  atmosphere_rating?: number;
  customer_name?: string;
  customer_email?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// Helper types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Database initialization queries (for SQLite/PostgreSQL)
export const createTableQueries = {
  restaurants: `
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      subscription_status TEXT NOT NULL DEFAULT 'trial',
      subscription_plan TEXT NOT NULL DEFAULT 'trial',
      admins TEXT NOT NULL DEFAULT '[]',
      contact_email TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      currency TEXT NOT NULL DEFAULT 'USD',
      tax_rate REAL NOT NULL DEFAULT 0,
      service_charge REAL NOT NULL DEFAULT 0,
      settings TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      trial_ends_at TEXT,
      subscription_ends_at TEXT
    )
  `,

  staff: `
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      restaurant_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      permissions TEXT NOT NULL DEFAULT '[]',
      shift TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `,

  tables: `
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id TEXT NOT NULL,
      number TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      assigned_waiter TEXT,
      qr_code TEXT NOT NULL,
      position_x REAL,
      position_y REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (assigned_waiter) REFERENCES staff(id),
      UNIQUE(restaurant_id, number)
    )
  `,

  sessions: `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      table_id INTEGER NOT NULL,
      restaurant_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      customer_count INTEGER NOT NULL DEFAULT 1,
      waiter_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      tip_amount REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (waiter_id) REFERENCES staff(id)
    )
  `,

  menu_items: `
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price_eur REAL NOT NULL,
      price_usd REAL NOT NULL,
      available BOOLEAN NOT NULL DEFAULT true,
      special BOOLEAN NOT NULL DEFAULT false,
      allergens TEXT DEFAULT '[]',
      image_url TEXT,
      preparation_time INTEGER NOT NULL DEFAULT 15,
      ingredients TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `,

  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      session_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'new',
      type TEXT NOT NULL,
      total_amount REAL NOT NULL,
      notes TEXT,
      waiter_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      estimated_time INTEGER,
      actual_time INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (waiter_id) REFERENCES staff(id)
    )
  `,

  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      user_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT DEFAULT '{}',
      read BOOLEAN NOT NULL DEFAULT false,
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (user_id) REFERENCES staff(id)
    )
  `,

  audit_logs: `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (user_id) REFERENCES staff(id)
    )
  `,

  subscriptions: `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      status TEXT NOT NULL,
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      payment_method TEXT,
      payment_provider TEXT,
      payment_provider_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cancelled_at TEXT,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `,

  payments: `
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      provider TEXT,
      provider_transaction_id TEXT,
      tip_amount REAL DEFAULT 0,
      processing_fee REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `,

  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
      food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
      atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
      customer_name TEXT,
      customer_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (table_id) REFERENCES tables(id)
    )
  `,
};

// Indexes for better performance
export const createIndexQueries = [
  "CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON staff(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username)",
  "CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_table ON sessions(table_id)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_restaurant ON sessions(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id)",
  "CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
  "CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu_items(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_notifications_restaurant ON notifications(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_audit_restaurant ON audit_logs(restaurant_id)",
  "CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)",
];
