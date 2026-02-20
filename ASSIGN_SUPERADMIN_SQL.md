# Assign Superadmin Role via Supabase SQL

## Quick Commands

### 1. Find User by Email
```sql
-- Find the user_id by email
SELECT user_id, email, full_name, account_approved 
FROM profiles 
WHERE email = 'user@example.com';
```

### 2. Approve Account (If Not Approved)
```sql
-- Approve the user's account first
UPDATE profiles 
SET account_approved = true 
WHERE email = 'user@example.com';
```

### 3. Assign Superadmin Role
```sql
-- Insert superadmin role (replace USER_ID with actual user_id from step 1)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### 4. Send Notification (Optional but Recommended)
```sql
-- Send notification to user (replace USER_ID)
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES (
  'USER_ID_HERE',
  'Superadmin Access Granted',
  'You have been granted Superadmin (IT) access. Please refresh your browser to see the admin panel.',
  'role_assignment',
  false
);
```

---

## Complete One-Step Command

**Replace `user@example.com` with the actual email:**

```sql
-- Complete command: Approve + Assign Superadmin + Notify
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id
  SELECT user_id INTO v_user_id 
  FROM profiles 
  WHERE email = 'user@example.com';
  
  -- Approve account
  UPDATE profiles 
  SET account_approved = true 
  WHERE user_id = v_user_id;
  
  -- Assign superadmin role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'superadmin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Send notification
  INSERT INTO notifications (user_id, title, message, type, is_read)
  VALUES (
    v_user_id,
    'Superadmin Access Granted',
    'You have been granted Superadmin (IT) access. Please refresh your browser to see the admin panel.',
    'role_assignment',
    false
  );
  
  RAISE NOTICE 'Superadmin role assigned successfully to user_id: %', v_user_id;
END $$;
```

---

## Verification Commands

### Check if Role was Assigned
```sql
-- Verify the role assignment
SELECT 
  p.email,
  p.full_name,
  p.account_approved,
  ur.role,
  ur.created_at
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'user@example.com';
```

### Check All Superadmins
```sql
-- List all superadmins
SELECT 
  p.email,
  p.full_name,
  p.department,
  ur.role,
  ur.created_at
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'superadmin'
ORDER BY ur.created_at DESC;
```

---

## Remove Superadmin Role (If Needed)

```sql
-- Remove superadmin role
DELETE FROM user_roles 
WHERE user_id = (
  SELECT user_id FROM profiles WHERE email = 'user@example.com'
)
AND role = 'superadmin';
```

---

## What Happens After Running SQL?

### Immediate Effects:
1. ✅ Role saved in database
2. ✅ Account approved (if it wasn't)
3. ✅ Notification sent to user

### User Side:
1. User receives notification (if online)
2. Page auto-refreshes after 2 seconds
3. **OR** User manually refreshes browser (F5)
4. ✅ Admin panel appears in sidebar
5. ✅ User can access all admin features

---

## Superadmin Permissions

The superadmin role has access to:
- ✅ User Management
- ✅ Account Approvals
- ✅ Admin Role Management
- ✅ View all users and roles
- ✅ Assign/remove admin roles

**Note**: Superadmin is specifically for IT department to manage other admins.

---

## Step-by-Step Guide

### Using Supabase Dashboard:

1. **Go to SQL Editor**
   - https://supabase.com/dashboard/project/umzmuhqcdnvhqgzzsman/sql

2. **Copy the Complete One-Step Command**
   - Replace `user@example.com` with actual email

3. **Click "Run"**
   - Wait for success message

4. **Verify**
   - Run verification command to confirm

5. **Tell User to Refresh**
   - User should press F5 or Ctrl+R
   - Admin panel will appear immediately

---

## Troubleshooting

### Issue: "User not found"
**Solution**: Check email spelling, or find user_id manually:
```sql
SELECT * FROM profiles WHERE email ILIKE '%partial_email%';
```

### Issue: "Duplicate key violation"
**Solution**: User already has superadmin role. Check with:
```sql
SELECT * FROM user_roles WHERE user_id = 'USER_ID' AND role = 'superadmin';
```

### Issue: User still doesn't see admin panel
**Solution**: 
1. Verify role assigned (run verification command)
2. Check account_approved is true
3. Ask user to log out and log back in
4. Clear browser cache

---

## Quick Reference

| Action | Command |
|--------|---------|
| Find user | `SELECT * FROM profiles WHERE email = 'email@example.com'` |
| Approve account | `UPDATE profiles SET account_approved = true WHERE email = 'email@example.com'` |
| Assign superadmin | `INSERT INTO user_roles (user_id, role) VALUES ('USER_ID', 'superadmin')` |
| Remove superadmin | `DELETE FROM user_roles WHERE user_id = 'USER_ID' AND role = 'superadmin'` |
| Check roles | `SELECT * FROM user_roles WHERE user_id = 'USER_ID'` |

---

## Example with Real Email

```sql
-- Example: Assign superadmin to john@company.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id 
  FROM profiles 
  WHERE email = 'john@company.com';
  
  UPDATE profiles 
  SET account_approved = true 
  WHERE user_id = v_user_id;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'superadmin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO notifications (user_id, title, message, type, is_read)
  VALUES (
    v_user_id,
    'Superadmin Access Granted',
    'You have been granted Superadmin (IT) access. Please refresh your browser to see the admin panel.',
    'role_assignment',
    false
  );
  
  RAISE NOTICE 'Superadmin role assigned to john@company.com';
END $$;
```

---

**Last Updated**: January 28, 2025
**Status**: ✅ Ready to Use
