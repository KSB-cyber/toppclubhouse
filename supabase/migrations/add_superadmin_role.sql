-- Add superadmin to the app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'superadmin' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'superadmin';
    END IF;
END $$;

-- Ensure the account is approved
UPDATE profiles 
SET account_approved = true 
WHERE email = 'darlingtonrich83@gmail.com';