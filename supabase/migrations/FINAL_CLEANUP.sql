-- FINAL EMERGENCY FIX - Run this NOW!

-- 1. Remove ALL large images (anything over 200 characters is suspicious)
UPDATE menu_items 
SET image_url = NULL 
WHERE LENGTH(COALESCE(image_url, '')) > 200;

-- 2. Remove base64 images
UPDATE menu_items 
SET image_url = NULL 
WHERE image_url LIKE 'data:%';

-- 3. Check what's left
SELECT 
  id, 
  name, 
  meal_type,
  CASE 
    WHEN image_url IS NULL THEN 'No image'
    ELSE SUBSTRING(image_url, 1, 50) || '...'
  END as image_preview,
  LENGTH(COALESCE(image_url, '')) as url_length
FROM menu_items
ORDER BY LENGTH(COALESCE(image_url, '')) DESC;

-- 4. Verify menu_items table is clean
SELECT COUNT(*) as total_items FROM menu_items;
