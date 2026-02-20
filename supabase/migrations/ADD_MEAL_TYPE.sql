-- ADD MEAL_TYPE COLUMN AND RESTORE FULL FUNCTIONALITY

-- 1. Check if meal_type enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_type') THEN
        CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'supper');
    END IF;
END $$;

-- 2. Add meal_type column to menu_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'meal_type'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN meal_type meal_type DEFAULT 'lunch';
    END IF;
END $$;

-- 3. Add meal_type column to food_orders if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_orders' AND column_name = 'meal_type'
    ) THEN
        ALTER TABLE food_orders ADD COLUMN meal_type meal_type DEFAULT 'lunch';
    END IF;
END $$;

-- 4. Update any existing menu items to have a meal_type
UPDATE menu_items SET meal_type = 'lunch' WHERE meal_type IS NULL;

-- 5. Verify the columns exist
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('menu_items', 'food_orders')
    AND column_name = 'meal_type';

-- Success message
SELECT 'meal_type column added successfully!' as status;
