-- FINAL DATABASE OPTIMIZATION (NO VACUUM)
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CLEAN UP LARGE IMAGES
-- ============================================

UPDATE menu_items 
SET image_url = NULL 
WHERE image_url IS NOT NULL 
  AND LENGTH(image_url) > 200;

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

-- Drop old indexes
DROP INDEX IF EXISTS idx_menu_items_available;
DROP INDEX IF EXISTS idx_food_orders_user;
DROP INDEX IF EXISTS idx_food_orders_date;
DROP INDEX IF EXISTS idx_food_orders_status;
DROP INDEX IF EXISTS idx_food_order_items_order;
DROP INDEX IF EXISTS idx_food_order_items_menu;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_date ON food_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_order_items_order ON food_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_food_order_items_menu ON food_order_items(menu_item_id);

-- ============================================
-- STEP 3: OPTIMIZE RLS POLICIES
-- ============================================

-- Menu items
DROP POLICY IF EXISTS "view_menu_items" ON menu_items;
DROP POLICY IF EXISTS "manage_menu_items" ON menu_items;

CREATE POLICY "view_menu_items" ON menu_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "manage_menu_items" ON menu_items
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Food orders
DROP POLICY IF EXISTS "view_own_orders" ON food_orders;
DROP POLICY IF EXISTS "create_orders" ON food_orders;
DROP POLICY IF EXISTS "update_orders" ON food_orders;

CREATE POLICY "view_own_orders" ON food_orders
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "create_orders" ON food_orders
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_orders" ON food_orders
  FOR UPDATE TO authenticated 
  USING (public.is_admin(auth.uid()));

-- ============================================
-- VERIFY
-- ============================================

SELECT 'Optimization Complete!' as status;

SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('menu_items', 'food_orders', 'food_order_items')
  AND schemaname = 'public'
ORDER BY tablename;
