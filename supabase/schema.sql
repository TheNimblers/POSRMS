-- ============================================================================
-- POSRMS Database Schema for Supabase
-- Run this SQL in your Supabase dashboard (SQL Editor) to create all tables
-- ============================================================================

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'active',
  subscription_plan TEXT NOT NULL DEFAULT 'monthly',
  admins TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_email TEXT,
  timezone TEXT DEFAULT 'Europe/Amsterdam',
  currency TEXT DEFAULT 'EUR',
  tax_rate DECIMAL(5,2) DEFAULT 8.5,
  service_charge DECIMAL(5,2) DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create staff table for authentication and user management
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('waiter', 'kitchen', 'bar', 'manager', 'admin', 'team')),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  shift TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tables (restaurant tables/seats) table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  capacity INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'maintenance')),
  qr_code TEXT NOT NULL UNIQUE,
  assigned_waiter_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, number)
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  available BOOLEAN DEFAULT TRUE,
  special BOOLEAN DEFAULT FALSE,
  preparation_time INT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  last_updated_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, name, category)
);

-- Create sessions table (customer sessions at tables)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP WITH TIME ZONE,
  total DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  notes TEXT,
  ordered_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr_code ON tables(qr_code);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_restaurant_id ON sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_table_id ON sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================================
-- Enable Row Level Security (RLS) - Optional but Recommended
-- ============================================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Seed Demo Data
-- ============================================================================

-- Insert Demo Restaurant
INSERT INTO restaurants (id, slug, name, subscription_status, subscription_plan, admins, contact_email, timezone, currency, tax_rate, service_charge)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'demo-restaurant', 'Demo Restaurant', 'active', 'monthly', ARRAY['admin1'], 'admin@demo-restaurant.com', 'Europe/Amsterdam', 'EUR', 8.5, 15),
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6'::uuid, 'bajwa-dhaba', 'Bajwa Dhaba', 'active', 'annual', ARRAY['BajwaManager'], 'info@bajwadhaba.com', 'Asia/Karachi', 'PKR', 5, 10);

-- Insert Demo Staff Accounts (password: 'password' hashed with bcrypt)
INSERT INTO staff (id, username, password_hash, role, restaurant_id, name, email, permissions, status)
VALUES
  ('waiter1-uuid0000000000000000000000'::uuid, 'waiter1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'waiter', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'John Doe', 'waiter1@demo.com', ARRAY['view_tables', 'manage_orders', 'update_order_status'], 'active'),
  ('kitchen1-uuid000000000000000000000'::uuid, 'kitchen1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'kitchen', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Kitchen Team', 'kitchen1@demo.com', ARRAY['view_food_orders', 'update_food_status'], 'active'),
  ('bar1-uuid00000000000000000000000'::uuid, 'bar1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'bar', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Bar Team', 'bar1@demo.com', ARRAY['view_drink_orders', 'update_drink_status'], 'active'),
  ('manager1-uuid000000000000000000000'::uuid, 'manager1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'manager', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Alice Johnson', 'manager1@demo.com', ARRAY['view_tables', 'manage_orders', 'manage_menu', 'manage_staff', 'view_analytics'], 'active'),
  ('admin1-uuid0000000000000000000000'::uuid, 'admin1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'admin', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Bob Wilson', 'admin1@demo.com', ARRAY['full_access'], 'active'),
  ('team1-uuid0000000000000000000000'::uuid, 'team1', '$2a$10$xyzHashedPassword1234567890123456789012345', 'team', NULL, 'POSRMS Team Member', 'team1@posrms.com', ARRAY['manage_restaurants', 'manage_subscriptions', 'view_global_analytics'], 'active');

-- Insert Demo Tables
INSERT INTO tables (restaurant_id, number, capacity, qr_code)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'T1', 4, 'QR-T1'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'T2', 2, 'QR-T2'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'T3', 6, 'QR-T3'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'T4', 4, 'QR-T4');

-- Insert Demo Menu Items
INSERT INTO menu_items (restaurant_id, name, category, price, currency, description, special, preparation_time)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Grilled Salmon', 'main', 26.50, 'EUR', 'Fresh Atlantic salmon with seasonal vegetables', true, 25),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Caesar Salad', 'starter', 14.50, 'EUR', 'Crisp romaine, parmesan, and house dressing', false, 10),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'House Lemonade', 'drink', 5.50, 'EUR', 'Fresh lemon juice with mint', false, 3);

-- ============================================================================
-- Note: You'll need to update the password hashes with actual bcrypt hashes
-- For now, the placeholder hash is shown. You can generate proper bcrypt hashes
-- using a tool or your backend code before inserting real demo accounts.
-- ============================================================================
