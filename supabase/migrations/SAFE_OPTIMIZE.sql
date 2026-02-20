-- SAFE DATABASE OPTIMIZATION - Checks columns first
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CHECK TABLE STRUCTURE
-- ============================================

-- See what columns actually exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: CLEAN UP LARGE DATA (SAFE)
-- ============================================

-- Remove large images safely
UPDATE menu_items 
SET image_url = NULL 
WHERE image_url IS NOT NULL 
  AND LENGTH(image_url) > 200;

-- ============================================
-- STEP 3: ADD INDEXES (SAFE - checks first)
-- ============================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_menu_items_available;
DROP INDEX IF EXISTS idx_food_orders_user;
DROP INDEX IF EXISTS idx_food_orders_date;
DROP INDEX IF EXISTS idx_food_orders_status;
DROP INDEX IF EXISTS idx_food_order_items_order;
DROP INDEX IF EXISTS idx_food_order_items_menu;

-- Create indexes only on columns that exist
DO $$
BEGIN
  -- Menu items indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='is_available') THEN
    CREATE INDEX idx_menu_items_available ON menu_items(is_available) WHERE is_available = true;
  END IF;

  -- Food orders indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_orders' AND column_name='user_id') THEN
    CREATE INDEX idx_food_orders_user ON food_orders(user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_orders' AND column_name='order_date') THEN
    CREATE INDEX idx_food_orders_date ON food_orders(order_date DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_orders' AND column_name='status') THEN
    CREATE INDEX idx_food_orders_status ON food_orders(status);
  END IF;

  -- Food order items indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_order_items' AND column_name='order_id') THEN
    CREATE INDEX idx_food_order_items_order ON food_order_items(order_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_order_items' AND column_name='menu_item_id') THEN
    CREATE INDEX idx_food_order_items_menu ON food_order_items(menu_item_id);
  END IF;
END $$;

-- ============================================
-- STEP 4: SIMPLIFY RLS POLICIES
-- ============================================

-- Menu items - allow everyone to view
DROP POLICY IF EXISTS "view_menu_items" ON menu_items;
CREATE POLICY "view_menu_items" ON menu_items
  FOR SELECT TO authenticated
  USING (true);

-- Menu items - allow admins to manage
DROP POLICY IF EXISTS "manage_menu_items" ON menu_items;
CREATE POLICY "manage_menu_items" ON menu_items
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Food orders - view own orders
DROP POLICY IF EXISTS "view_own_orders" ON food_orders;
CREATE POLICY "view_own_orders" ON food_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Food orders - create orders
DROP POLICY IF EXISTS "create_orders" ON food_orders;
CREATE POLICY "create_orders" ON food_orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Food orders - update orders (admins only)
DROP POLICY IF EXISTS "update_orders" ON food_orders;
CREATE POLICY "update_orders" ON food_orders
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- STEP 5: VACUUM
-- ============================================

VACUUM ANALYZE menu_items;
VACUUM ANALYZE food_orders;
VACUUM ANALYZE food_order_items;

-- ============================================
-- STEP 6: VERIFY
-- ============================================

SELECT 
  'menu_items' as table_name,
  COUNT(*) as total_rows,
  pg_size_pretty(pg_total_relation_size('menu_items')) as table_size
FROM menu_items
UNION ALL
SELECT 
  'food_orders',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('food_orders'))
FROM food_orders
UNION ALL
SELECT 
  'food_order_items',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('food_order_items'))
FROM food_order_items;

-- Show created indexes
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('menu_items', 'food_orders', 'food_order_items')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
