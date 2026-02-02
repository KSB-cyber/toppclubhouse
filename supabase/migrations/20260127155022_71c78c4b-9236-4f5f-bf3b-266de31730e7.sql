-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'hr_head', 'department_head', 'managing_director', 'club_house_manager', 'employee', 'third_party');

-- Create approval status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'declined');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('received', 'preparing', 'ready', 'delivered', 'cancelled');

-- Create meal type enum
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'supper');

-- Profiles table for user details
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  employee_id TEXT,
  avatar_url TEXT,
  dietary_preferences TEXT[],
  allergies TEXT[],
  is_third_party BOOLEAN DEFAULT false,
  account_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Accommodations table (rooms/units)
CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL,
  capacity INTEGER DEFAULT 1,
  amenities TEXT[],
  images TEXT[],
  price_per_night DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Accommodation bookings
CREATE TABLE public.accommodation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  accommodation_id UUID REFERENCES public.accommodations(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  special_requests TEXT,
  status approval_status DEFAULT 'pending',
  department_approval approval_status DEFAULT 'pending',
  hr_approval approval_status DEFAULT 'pending',
  md_approval approval_status,
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Menu items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  meal_type meal_type NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  available_from DATE,
  available_until DATE,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  allergens TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Food orders
CREATE TABLE public.food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_date DATE NOT NULL,
  delivery_time TIMESTAMPTZ NOT NULL,
  meal_type meal_type NOT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  special_requests TEXT,
  status order_status DEFAULT 'received',
  admin_approval approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Food order items
CREATE TABLE public.food_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.food_orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Facilities
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  facility_type TEXT NOT NULL,
  capacity INTEGER,
  amenities TEXT[],
  images TEXT[],
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Facility bookings
CREATE TABLE public.facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT,
  attendees INTEGER DEFAULT 1,
  status approval_status DEFAULT 'pending',
  club_manager_approval approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is any admin type
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'hr_head', 'department_head', 'managing_director', 'club_house_manager')
  )
$$;

-- Function to check if user account is approved
CREATE OR REPLACE FUNCTION public.is_account_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT account_approved FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Accommodations policies (viewable by all authenticated, manageable by admin)
CREATE POLICY "Authenticated users can view accommodations" ON public.accommodations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage accommodations" ON public.accommodations
  FOR ALL USING (public.is_admin(auth.uid()));

-- Accommodation bookings policies
CREATE POLICY "Users can view their own bookings" ON public.accommodation_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.accommodation_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending bookings" ON public.accommodation_bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all bookings" ON public.accommodation_bookings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update bookings" ON public.accommodation_bookings
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Menu items policies
CREATE POLICY "Authenticated users can view menu items" ON public.menu_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
  FOR ALL USING (public.is_admin(auth.uid()));

-- Food orders policies
CREATE POLICY "Users can view their own orders" ON public.food_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.food_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending orders" ON public.food_orders
  FOR UPDATE USING (auth.uid() = user_id AND status = 'received');

CREATE POLICY "Admins can view all orders" ON public.food_orders
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update orders" ON public.food_orders
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Food order items policies
CREATE POLICY "Users can view their order items" ON public.food_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.food_orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create order items" ON public.food_order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.food_orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items" ON public.food_order_items
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Facilities policies
CREATE POLICY "Authenticated users can view facilities" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage facilities" ON public.facilities
  FOR ALL USING (public.is_admin(auth.uid()));

-- Facility bookings policies
CREATE POLICY "Users can view their facility bookings" ON public.facility_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create facility bookings" ON public.facility_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_account_approved(auth.uid()));

CREATE POLICY "Users can update their pending facility bookings" ON public.facility_bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all facility bookings" ON public.facility_bookings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update facility bookings" ON public.facility_bookings
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accommodation_bookings_updated_at BEFORE UPDATE ON public.accommodation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_orders_updated_at BEFORE UPDATE ON public.food_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facility_bookings_updated_at BEFORE UPDATE ON public.facility_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accommodation_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.facility_bookings;