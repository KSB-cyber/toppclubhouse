-- Enable the pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send email via Supabase Edge Function or external service
CREATE OR REPLACE FUNCTION send_email_notification(
  recipient_email TEXT,
  subject TEXT,
  body TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into a queue table that can be processed by an edge function
  INSERT INTO public.email_queue (recipient_email, subject, body, created_at)
  VALUES (recipient_email, subject, body, now());
END;
$$;

-- Create email queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  sent_at TIMESTAMPTZ
);

-- Enable RLS on email queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Only system can access email queue
CREATE POLICY "System only access" ON public.email_queue
  FOR ALL USING (false);

-- Trigger function for food order confirmation
CREATE OR REPLACE FUNCTION notify_food_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email and name
  SELECT email, full_name INTO user_email, user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Send order confirmation email
  PERFORM send_email_notification(
    user_email,
    'Food Order Confirmation - TOPP Clubhouse',
    'Dear ' || user_name || ',

Your food order has been received successfully!

Order Details:
- Order ID: #' || substring(NEW.id::text, 1, 8) || '
- Meal Type: ' || UPPER(NEW.meal_type::text) || '
- Order Date: ' || NEW.order_date || '
- Total Amount: GH₵' || NEW.total_amount || '

Your order is being processed and will be ready at the scheduled time.

Thank you for using TOPP Clubhouse services!

Best regards,
TOPP Clubhouse Team'
  );

  RETURN NEW;
END;
$$;

-- Trigger function for food order delivery
CREATE OR REPLACE FUNCTION notify_food_order_delivered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only send email when status changes to delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Get user email and name
    SELECT email, full_name INTO user_email, user_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    -- Send delivery notification email
    PERFORM send_email_notification(
      user_email,
      'Food Order Delivered - TOPP Clubhouse',
      'Dear ' || user_name || ',

Your food order has been delivered!

Order Details:
- Order ID: #' || substring(NEW.id::text, 1, 8) || '
- Meal Type: ' || UPPER(NEW.meal_type::text) || '
- Total Amount: GH₵' || NEW.total_amount || '

Your receipt is now available for download in the My Bookings section.

Thank you for using TOPP Clubhouse services!

Best regards,
TOPP Clubhouse Team'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger function for role changes
CREATE OR REPLACE FUNCTION notify_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  role_label TEXT;
BEGIN
  -- Get user email and name
  SELECT email, full_name INTO user_email, user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Map role to readable label
  role_label := CASE NEW.role
    WHEN 'admin' THEN 'Administrator'
    WHEN 'hr_head' THEN 'HR Head'
    WHEN 'department_head' THEN 'Department Head'
    WHEN 'managing_director' THEN 'Managing Director'
    WHEN 'club_house_manager' THEN 'Club House Manager'
    WHEN 'employee' THEN 'Employee'
    WHEN 'third_party' THEN 'Third Party'
    ELSE NEW.role
  END;

  -- Send role assignment email
  PERFORM send_email_notification(
    user_email,
    'New Role Assigned - TOPP Clubhouse',
    'Dear ' || user_name || ',

You have been assigned a new role in the TOPP Clubhouse system.

New Role: ' || role_label || '

Please log out and log back in to see your new permissions and access levels.

If you have any questions about your new role, please contact the system administrator.

Best regards,
TOPP Clubhouse Team'
  );

  RETURN NEW;
END;
$$;

-- Trigger function for login notifications
CREATE OR REPLACE FUNCTION notify_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email and name
  SELECT email, full_name INTO user_email, user_name
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE u.id = NEW.user_id;

  -- Send login notification email
  PERFORM send_email_notification(
    user_email,
    'Login Alert - TOPP Clubhouse',
    'Dear ' || user_name || ',

A login to your TOPP Clubhouse account was detected.

Login Details:
- Time: ' || now() || '
- IP Address: ' || NEW.ip_address || '

If this was not you, please change your password immediately and contact support.

Best regards,
TOPP Clubhouse Team'
  );

  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS food_order_created_email ON public.food_orders;
CREATE TRIGGER food_order_created_email
  AFTER INSERT ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_food_order_created();

DROP TRIGGER IF EXISTS food_order_delivered_email ON public.food_orders;
CREATE TRIGGER food_order_delivered_email
  AFTER UPDATE ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_food_order_delivered();

DROP TRIGGER IF EXISTS role_change_email ON public.user_roles;
CREATE TRIGGER role_change_email
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_role_change();

-- Note: Login notifications require auth.sessions table access
-- This may need to be set up separately in Supabase Auth settings
