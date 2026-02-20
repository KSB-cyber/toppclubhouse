-- Fix RLS policies: Change from RESTRICTIVE to PERMISSIVE
-- The issue is all policies are RESTRICTIVE which requires ALL to pass (AND logic)
-- They should be PERMISSIVE which requires ANY to pass (OR logic)

-- PROFILES TABLE
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- USER_ROLES TABLE
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own default role" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to insert their own default role during signup
CREATE POLICY "Users can insert their own default role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role IN ('employee', 'third_party'));

-- ACCOMMODATION_BOOKINGS TABLE
DROP POLICY IF EXISTS "Admins can update bookings" ON public.accommodation_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.accommodation_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.accommodation_bookings;
DROP POLICY IF EXISTS "Users can update their pending bookings" ON public.accommodation_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.accommodation_bookings;

CREATE POLICY "Users can view their own bookings" ON public.accommodation_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.accommodation_bookings
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create bookings" ON public.accommodation_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending bookings" ON public.accommodation_bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update bookings" ON public.accommodation_bookings
  FOR UPDATE USING (is_admin(auth.uid()));

-- FACILITY_BOOKINGS TABLE
DROP POLICY IF EXISTS "Admins can update facility bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Admins can view all facility bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Users can create facility bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Users can update their pending facility bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Users can view their facility bookings" ON public.facility_bookings;

CREATE POLICY "Users can view their facility bookings" ON public.facility_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all facility bookings" ON public.facility_bookings
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create facility bookings" ON public.facility_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending facility bookings" ON public.facility_bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update facility bookings" ON public.facility_bookings
  FOR UPDATE USING (is_admin(auth.uid()));

-- FOOD_ORDERS TABLE
DROP POLICY IF EXISTS "Admins can update orders" ON public.food_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.food_orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.food_orders;
DROP POLICY IF EXISTS "Users can update their pending orders" ON public.food_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.food_orders;

CREATE POLICY "Users can view their own orders" ON public.food_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.food_orders
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create orders" ON public.food_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending orders" ON public.food_orders
  FOR UPDATE USING (auth.uid() = user_id AND status = 'received');

CREATE POLICY "Admins can update orders" ON public.food_orders
  FOR UPDATE USING (is_admin(auth.uid()));

-- FOOD_ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "Admins can view all order items" ON public.food_order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.food_order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.food_order_items;

CREATE POLICY "Users can view their order items" ON public.food_order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM food_orders WHERE food_orders.id = food_order_items.order_id AND food_orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items" ON public.food_order_items
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create order items" ON public.food_order_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM food_orders WHERE food_orders.id = food_order_items.order_id AND food_orders.user_id = auth.uid()
  ));

-- ACCOMMODATIONS TABLE
DROP POLICY IF EXISTS "Admins can manage accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Authenticated users can view accommodations" ON public.accommodations;

CREATE POLICY "Authenticated users can view accommodations" ON public.accommodations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage accommodations" ON public.accommodations
  FOR ALL USING (is_admin(auth.uid()));

-- FACILITIES TABLE
DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;
DROP POLICY IF EXISTS "Authenticated users can view facilities" ON public.facilities;

CREATE POLICY "Authenticated users can view facilities" ON public.facilities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage facilities" ON public.facilities
  FOR ALL USING (is_admin(auth.uid()));

-- MENU_ITEMS TABLE
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can view menu items" ON public.menu_items;

CREATE POLICY "Authenticated users can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
  FOR ALL USING (is_admin(auth.uid()));

-- NOTIFICATIONS TABLE
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Allow system/service role to create notifications (for triggers)
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create function to notify admins of new user signups
CREATE OR REPLACE FUNCTION public.notify_admins_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Get all admin users and create notifications for them
  FOR admin_user IN 
    SELECT DISTINCT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role IN ('admin', 'hr_head')
  LOOP
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      admin_user.user_id,
      'New User Registration',
      'New user ' || NEW.full_name || ' (' || NEW.email || ') requires approval.',
      'approval',
      '/admin/approvals'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Create function to notify admins of new bookings
CREATE OR REPLACE FUNCTION public.notify_admins_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
  user_name TEXT;
  accommodation_name TEXT;
BEGIN
  SELECT full_name INTO user_name FROM profiles WHERE user_id = NEW.user_id;
  SELECT name INTO accommodation_name FROM accommodations WHERE id = NEW.accommodation_id;
  
  FOR admin_user IN 
    SELECT DISTINCT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role IN ('admin', 'hr_head', 'department_head', 'managing_director')
  LOOP
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      admin_user.user_id,
      'New Accommodation Booking',
      user_name || ' requested booking for ' || accommodation_name,
      'booking',
      '/admin/booking-approvals'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Create function to notify admins of new facility bookings
CREATE OR REPLACE FUNCTION public.notify_admins_new_facility_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
  user_name TEXT;
  facility_name TEXT;
BEGIN
  SELECT full_name INTO user_name FROM profiles WHERE user_id = NEW.user_id;
  SELECT name INTO facility_name FROM facilities WHERE id = NEW.facility_id;
  
  FOR admin_user IN 
    SELECT DISTINCT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role IN ('admin', 'club_house_manager')
  LOOP
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      admin_user.user_id,
      'New Facility Booking',
      user_name || ' requested booking for ' || facility_name,
      'booking',
      '/admin/booking-approvals'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Create function to notify admins of new food orders
CREATE OR REPLACE FUNCTION public.notify_admins_new_food_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
  user_name TEXT;
BEGIN
  SELECT full_name INTO user_name FROM profiles WHERE user_id = NEW.user_id;
  
  FOR admin_user IN 
    SELECT DISTINCT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role IN ('admin', 'club_house_manager')
  LOOP
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      admin_user.user_id,
      'New Food Order',
      user_name || ' placed a ' || NEW.meal_type || ' order',
      'order',
      '/admin/booking-approvals'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_user_signup ON public.profiles;
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_user();

DROP TRIGGER IF EXISTS on_new_accommodation_booking ON public.accommodation_bookings;
CREATE TRIGGER on_new_accommodation_booking
  AFTER INSERT ON public.accommodation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_booking();

DROP TRIGGER IF EXISTS on_new_facility_booking ON public.facility_bookings;
CREATE TRIGGER on_new_facility_booking
  AFTER INSERT ON public.facility_bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_facility_booking();

DROP TRIGGER IF EXISTS on_new_food_order ON public.food_orders;
CREATE TRIGGER on_new_food_order
  AFTER INSERT ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_food_order();