-- FIX BROKEN COLUMN NAME

-- Drop the broken column
ALTER TABLE menu_items DROP COLUMN IF EXISTS "upper(meal_type::text)";

-- Add correct meal_type column
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS meal_type meal_type DEFAULT 'lunch' NOT NULL;

-- Verify columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;
