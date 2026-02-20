-- Add indexes to improve query performance across all tables

-- Menu items indexes (for food ordering page)
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_meal_type ON public.menu_items(meal_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_available_meal ON public.menu_items(is_available, meal_type);

-- Profiles indexes (for user management and approvals)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_account_approved ON public.profiles(account_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Food orders indexes
CREATE INDEX IF NOT EXISTS idx_food_orders_user_id ON public.food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_order_date ON public.food_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON public.food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_created_at ON public.food_orders(created_at DESC);

-- Accommodation requests indexes
CREATE INDEX IF NOT EXISTS idx_accommodation_requests_user_id ON public.accommodation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_requests_status ON public.accommodation_requests(status);
CREATE INDEX IF NOT EXISTS idx_accommodation_requests_created_at ON public.accommodation_requests(created_at DESC);

-- Facility requests indexes
CREATE INDEX IF NOT EXISTS idx_facility_requests_user_id ON public.facility_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_requests_status ON public.facility_requests(status);
CREATE INDEX IF NOT EXISTS idx_facility_requests_created_at ON public.facility_requests(created_at DESC);

-- Accommodation bookings indexes
CREATE INDEX IF NOT EXISTS idx_accommodation_bookings_user_id ON public.accommodation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_bookings_status ON public.accommodation_bookings(status);

-- Facility bookings indexes
CREATE INDEX IF NOT EXISTS idx_facility_bookings_user_id ON public.facility_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_status ON public.facility_bookings(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
