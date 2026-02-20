-- REMOVE ALL EMAIL TRIGGERS AND FUNCTIONS FROM ENTIRE SYSTEM

-- Drop all email-related triggers
DROP TRIGGER IF EXISTS food_order_created_email ON public.food_orders;
DROP TRIGGER IF EXISTS food_order_delivered_email ON public.food_orders;
DROP TRIGGER IF EXISTS role_change_email ON public.user_roles;
DROP TRIGGER IF EXISTS password_changed_email ON auth.users;

-- Drop all email notification functions
DROP FUNCTION IF EXISTS notify_food_order_created();
DROP FUNCTION IF EXISTS notify_food_order_delivered();
DROP FUNCTION IF EXISTS notify_role_change();
DROP FUNCTION IF EXISTS notify_user_login();
DROP FUNCTION IF EXISTS notify_password_changed();
DROP FUNCTION IF EXISTS send_email_notification(TEXT, TEXT, TEXT);

-- Drop email queue table (optional - comment out if you want to keep the table)
DROP TABLE IF EXISTS public.email_queue CASCADE;

-- Verify all triggers are removed
SELECT 
  trigger_name, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%email%' OR trigger_name LIKE '%notify%';

-- Should return 0 rows if successful
