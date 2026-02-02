-- This script should be run to assign superadmin role to the original admin
-- Replace 'your-email@example.com' with your actual email address

-- Update the original admin's role to superadmin
UPDATE user_roles 
SET role = 'superadmin' 
WHERE user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE email = 'your-email@example.com'
  LIMIT 1
);

-- If no role exists, insert superadmin role
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'superadmin'
FROM profiles 
WHERE email = 'your-email@example.com'
AND user_id NOT IN (SELECT user_id FROM user_roles);

-- Ensure the account is approved
UPDATE profiles 
SET account_approved = true 
WHERE email = 'your-email@example.com';