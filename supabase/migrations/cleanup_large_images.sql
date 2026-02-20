-- Clean up large base64 images causing performance issues

-- Option 1: Remove all base64 images (set to NULL)
UPDATE menu_items 
SET image_url = NULL 
WHERE image_url LIKE 'data:image%';

-- Option 2: Keep only external URLs, remove base64
-- (Uncomment if you want to keep external URLs)
-- UPDATE menu_items 
-- SET image_url = NULL 
-- WHERE image_url LIKE 'data:image%';

-- Verify cleanup
SELECT 
  id, 
  name, 
  CASE 
    WHEN image_url IS NULL THEN 'No image'
    WHEN image_url LIKE 'data:image%' THEN 'Base64 (LARGE)'
    ELSE 'External URL'
  END as image_type,
  LENGTH(image_url) as image_size
FROM menu_items
ORDER BY LENGTH(image_url) DESC;
