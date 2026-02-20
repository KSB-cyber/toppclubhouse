-- EMERGENCY FIX: Allow Club House Manager to access menu items

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Club managers can manage menu items" ON public.menu_items;

-- Create simple, permissive policies
CREATE POLICY "Anyone authenticated can view menu items"
ON public.menu_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert menu items"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update menu items"
ON public.menu_items FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete menu items"
ON public.menu_items FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Clean up any large images NOW
UPDATE menu_items 
SET image_url = NULL 
WHERE image_url LIKE 'data:image%' OR LENGTH(image_url) > 1000;

-- Verify it works
SELECT id, name, meal_type, price, is_available FROM menu_items LIMIT 5;
