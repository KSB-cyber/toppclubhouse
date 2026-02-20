-- Add missing role types to app_role enum
DO $$ 
BEGIN
    -- Add hr_office if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hr_office' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'hr_office';
    END IF;
    
    -- Add superadmin if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'superadmin' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'superadmin';
    END IF;
END $$;

-- Ensure your account is approved and has superadmin role
UPDATE profiles 
SET account_approved = true 
WHERE email = 'darlingtonrich83@gmail.com';