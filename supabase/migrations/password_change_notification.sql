-- Trigger function for password change notification
CREATE OR REPLACE FUNCTION notify_password_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only notify if password was actually changed
  IF NEW.encrypted_password IS DISTINCT FROM OLD.encrypted_password THEN
    -- Get user email
    user_email := NEW.email;
    
    -- Get user name from profiles
    SELECT full_name INTO user_name
    FROM public.profiles
    WHERE user_id = NEW.id;

    -- Send password change notification email
    PERFORM send_email_notification(
      user_email,
      'Password Changed - TOPP Clubhouse',
      'Dear ' || COALESCE(user_name, 'User') || ',

Your password has been successfully changed.

Change Details:
- Time: ' || now() || '
- Account: ' || user_email || '

If you did not make this change, please contact support immediately at support@toppclubhouse.com

For security reasons, we recommend:
- Using a strong, unique password
- Enabling two-factor authentication
- Not sharing your password with anyone

Best regards,
TOPP Clubhouse Security Team'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table for password changes
DROP TRIGGER IF EXISTS password_changed_email ON auth.users;
CREATE TRIGGER password_changed_email
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password)
  EXECUTE FUNCTION notify_password_changed();

-- Note: Password recovery emails are automatically sent by Supabase Auth
-- This trigger only sends a confirmation after the password is successfully changed
