-- CHECK ACTUAL DATABASE SCHEMA

-- 1. Show ALL columns in menu_items table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'menu_items'
ORDER BY ordinal_position;

-- 2. Show ALL columns in food_orders table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'food_orders'
ORDER BY ordinal_position;

-- 3. Show ALL columns in food_order_items table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'food_order_items'
ORDER BY ordinal_position;

-- 4. Check if tables even exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('menu_items', 'food_orders', 'food_order_items')
ORDER BY table_name;
