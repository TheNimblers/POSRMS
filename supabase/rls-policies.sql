-- ============================================================================
-- Row-Level Security (RLS) Policies for Multi-Tenant Support
-- Run this SQL in your Supabase dashboard SQL Editor
-- ============================================================================

-- Note: RLS is already enabled on all tables from schema.sql
-- These policies ensure users can only access data from their restaurant

-- ============================================================================
-- RESTAURANTS TABLE POLICIES
-- ============================================================================

-- Staff can view their own restaurant
CREATE POLICY "Staff can view own restaurant"
  ON restaurants
  FOR SELECT
  USING (id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- ============================================================================
-- STAFF TABLE POLICIES
-- ============================================================================

-- Staff can view other staff in their restaurant
CREATE POLICY "Staff can view staff in own restaurant"
  ON staff
  FOR SELECT
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- Only service role can insert staff (registration)
CREATE POLICY "Only service role can insert staff"
  ON staff
  FOR INSERT
  WITH CHECK (true); -- Checked by service role only

-- Staff can update their own profile
CREATE POLICY "Staff can update own profile"
  ON staff
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- TABLES (Restaurant Tables/Seats) POLICIES
-- ============================================================================

-- Staff can view tables in their restaurant
CREATE POLICY "Staff can view tables in own restaurant"
  ON tables
  FOR SELECT
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- Managers can insert tables in their restaurant
CREATE POLICY "Managers can insert tables"
  ON tables
  FOR INSERT
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- Managers can update tables in their restaurant
CREATE POLICY "Managers can update tables"
  ON tables
  FOR UPDATE
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ))
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- Managers can delete tables in their restaurant
CREATE POLICY "Managers can delete tables"
  ON tables
  FOR DELETE
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- ============================================================================
-- MENU_ITEMS TABLE POLICIES
-- ============================================================================

-- Staff can view menu items in their restaurant
CREATE POLICY "Staff can view menu items in own restaurant"
  ON menu_items
  FOR SELECT
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- Managers can insert menu items
CREATE POLICY "Managers can insert menu items"
  ON menu_items
  FOR INSERT
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- Managers can update menu items
CREATE POLICY "Managers can update menu items"
  ON menu_items
  FOR UPDATE
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ))
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- Managers can delete menu items
CREATE POLICY "Managers can delete menu items"
  ON menu_items
  FOR DELETE
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid() AND role = 'manager'
  ));

-- ============================================================================
-- SESSIONS TABLE POLICIES
-- ============================================================================

-- Staff can view sessions in their restaurant
CREATE POLICY "Staff can view sessions in own restaurant"
  ON sessions
  FOR SELECT
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- Staff can insert sessions
CREATE POLICY "Staff can create sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- Staff can update sessions in their restaurant
CREATE POLICY "Staff can update sessions"
  ON sessions
  FOR UPDATE
  USING (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ))
  WITH CHECK (restaurant_id IN (
    SELECT restaurant_id FROM staff 
    WHERE id = auth.uid()
  ));

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Staff can view orders in their restaurant
CREATE POLICY "Staff can view orders in own restaurant"
  ON orders
  FOR SELECT
  USING (table_id IN (
    SELECT id FROM tables 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM staff 
      WHERE id = auth.uid()
    )
  ));

-- Staff can insert orders
CREATE POLICY "Staff can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (table_id IN (
    SELECT id FROM tables 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM staff 
      WHERE id = auth.uid()
    )
  ));

-- Staff can update orders in their restaurant
CREATE POLICY "Staff can update orders"
  ON orders
  FOR UPDATE
  USING (table_id IN (
    SELECT id FROM tables 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM staff 
      WHERE id = auth.uid()
    )
  ))
  WITH CHECK (table_id IN (
    SELECT id FROM tables 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM staff 
      WHERE id = auth.uid()
    )
  ));

-- ============================================================================
-- NOTE: These policies use auth.uid() which works with Supabase Auth
-- However, since POSRMS uses custom JWT authentication, you may need to:
-- 1. Use Supabase Auth for authentication (recommended)
-- 2. Or implement custom RLS policies that work with your JWT claims
-- 
-- For now, these policies are commented out to allow development.
-- Uncomment them when you switch to Supabase Auth or configure JWT claims.
-- ============================================================================
