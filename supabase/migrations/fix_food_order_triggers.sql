-- Quick fix for upper() function error in food order triggers

-- Drop existing triggers
DROP TRIGGER IF EXISTS food_order_created_email ON public.food_orders;
DROP TRIGGER IF EXISTS food_order_delivered_email ON public.food_orders;

-- Recreate trigger function for food order confirmation (FIXED)
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

  -- Send order confirmation email (only if email_queue table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_queue') THEN
    INSERT INTO public.email_queue (recipient_email, subject, body, created_at)
    VALUES (
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
TOPP Clubhouse Team',
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger function for food order delivery (FIXED)
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

    -- Send delivery notification email (only if email_queue table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_queue') THEN
      INSERT INTO public.email_queue (recipient_email, subject, body, created_at)
      VALUES (
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
TOPP Clubhouse Team',
        now()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER food_order_created_email
  AFTER INSERT ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_food_order_created();

CREATE TRIGGER food_order_delivered_email
  AFTER UPDATE ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_food_order_delivered();
