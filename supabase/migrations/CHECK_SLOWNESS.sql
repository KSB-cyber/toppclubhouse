-- CHECK WHAT'S CAUSING SLOWNESS

-- 1. Check for large images
SELECT 
  id,
  name,
  LENGTH(COALESCE(image_url, '')) as url_length,
  CASE 
    WHEN image_url IS NULL THEN 'No image'
    WHEN image_url LIKE 'data:%' THEN 'BASE64 (DELETE THIS!)'
    WHEN LENGTH(image_url) > 200 THEN 'TOO LONG (DELETE THIS!)'
    ELSE 'OK'
  END as status
FROM menu_items
ORDER BY LENGTH(COALESCE(image_url, '')) DESC
LIMIT 20;

-- 2. Delete ALL problematic images NOW
DELETE FROM menu_items WHERE image_url LIKE 'data:%';
UPDATE menu_items SET image_url = NULL WHERE LENGTH(COALESCE(image_url, '')) > 200;

-- 3. Check table sizes
SELECT 
  'menu_items' as table_name,
  COUNT(*) as rows,
  pg_size_pretty(pg_total_relation_size('menu_items')) as size
FROM menu_items
UNION ALL
SELECT 'food_orders', COUNT(*), pg_size_pretty(pg_total_relation_size('food_orders')) FROM food_orders
UNION ALL
SELECT 'food_order_items', COUNT(*), pg_size_pretty(pg_total_relation_size('food_order_items')) FROM food_order_items;

-- 4. If menu_items is over 1MB, there's a problem
SELECT 
  CASE 
    WHEN pg_total_relation_size('menu_items') > 1048576 THEN 'WARNING: menu_items table is too large! Delete items with large images.'
    ELSE 'OK: Table size is normal'
  END as diagnosis;
