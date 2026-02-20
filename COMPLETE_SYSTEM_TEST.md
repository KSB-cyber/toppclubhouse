# TOPP Clubhouse - Complete System Test Checklist

## URGENT: Test Before Presentation

### 1. AUTHENTICATION & REGISTRATION ✓
- [ ] **Register New User**
  - Go to /register
  - Fill in: Full Name, Email, Password, Phone, Department, Employee ID
  - Click "Sign Up"
  - Expected: Account created, shows "Pending Approval" screen
  
- [ ] **Login**
  - Go to /login
  - Enter email and password
  - Click "Sign In"
  - Expected: Redirects to dashboard (if approved) or pending screen

- [ ] **Password Reset**
  - Go to /login → Click "Forgot Password"
  - Enter email
  - Expected: Success message (email sent if SMTP configured)

### 2. USER APPROVAL (Admin/HR) ✓
- [ ] **Approve New Users**
  - Login as admin/hr_head
  - Go to User Approvals page
  - Click "Approve" on pending user
  - Expected: User approved, notification sent

### 3. ROLE MANAGEMENT (Admin) ✓
- [ ] **Assign Roles**
  - Login as admin
  - Go to User Management
  - Click "Add Role" on a user
  - Select role (e.g., club_house_manager)
  - Click "Assign Role"
  - Expected: Old roles removed, new role assigned, notification sent

### 4. FOOD ORDERING (All Users) ⚠️ CHECK THIS
- [ ] **Check Time Restrictions**
  - Current time restrictions:
    - Breakfast: 7:00 AM - 9:00 AM
    - Lunch: 7:00 AM - 9:30 AM
    - Supper: 7:00 AM - 5:00 PM
  - Expected: Only available meal types are enabled

- [ ] **Browse Menu**
  - Go to Food Ordering page
  - Switch between Breakfast/Lunch/Supper tabs
  - Search for items
  - Expected: Menu items load and display

- [ ] **Add to Cart**
  - Click "Add to Order" on menu item
  - Expected: Item added to cart, badge shows count

- [ ] **Place Order**
  - Click "View Cart"
  - Adjust quantities with +/- buttons
  - Select delivery date (today or future)
  - Select delivery time
  - Add special requests (optional)
  - Click "Place Order"
  - Expected: Order created, notification sent, cart cleared

- [ ] **Common Issues:**
  - ❌ Error: "Ordering time has passed" → You're outside time window
  - ❌ Error: Database error → Check RLS policies
  - ❌ Cart empty → Items not being added

### 5. MENU MANAGEMENT (Club House Manager) ⚠️ CHECK THIS
- [ ] **Add Menu Item**
  - Login as club_house_manager
  - Go to Manage Menu
  - Click "Add Menu Item"
  - Fill in: Name, Meal Type, Description, Price
  - Upload image (JPG/PNG under 5MB)
  - Set dietary options (Vegetarian/Vegan)
  - Add allergens
  - Click "Create"
  - Expected: Menu item created with image

- [ ] **Edit Menu Item**
  - Click edit icon on existing item
  - Change details or upload new image
  - Click "Update"
  - Expected: Item updated

- [ ] **Delete Menu Item**
  - Click delete icon
  - Expected: Item deleted

- [ ] **Common Issues:**
  - ❌ Image upload fails → Run storage bucket SQL migration
  - ❌ "Bucket not found" → Create 'menu-images' bucket
  - ❌ "Permission denied" → Check storage policies

### 6. FOOD ORDERS MANAGEMENT (Club House Manager) ✓
- [ ] **View Orders**
  - Go to Food Orders page
  - Default shows today's orders
  - Click date picker to select different date
  - Click "Today" button to return to today
  - Expected: Orders filtered by date

- [ ] **Issue Order (Mark as Delivered)**
  - Find order with status "Received"
  - Click "Issue Order" button
  - Expected: Status changes to "Delivered", user can download receipt

- [ ] **Print Receipt**
  - Find delivered order
  - Click "Print Receipt"
  - Expected: Receipt opens in new window for printing

- [ ] **View Menu Items Summary**
  - Click "Menu Items Summary" tab
  - Filter by meal type
  - Expected: Shows grouped statistics (quantities, order counts)

### 7. MY BOOKINGS (All Users) ✓
- [ ] **View Food Orders**
  - Go to My Bookings → Food Orders tab
  - Expected: See all your food orders

- [ ] **Download E-Ticket**
  - Click "Download E-Ticket" on any order
  - Expected: Receipt/ticket downloads

- [ ] **Download Receipt**
  - Only visible when status = "Delivered"
  - Click "Download Receipt"
  - Expected: Receipt downloads

### 8. ACCOMMODATION BOOKING ✓
- [ ] **Browse Accommodations**
  - Go to Accommodations page
  - View available rooms
  - Expected: List of accommodations

- [ ] **Request Accommodation**
  - Click "Book Now"
  - Select check-in/check-out dates
  - Add guests count
  - Add special requests
  - Click "Submit Request"
  - Expected: Booking created, pending approval

- [ ] **View My Bookings**
  - Go to My Bookings → Accommodation tab
  - Expected: See your accommodation requests

### 9. FACILITY BOOKING ✓
- [ ] **Browse Facilities**
  - Go to Facilities page
  - View available facilities
  - Expected: List of facilities

- [ ] **Request Facility**
  - Click "Book Now"
  - Select date, start time, end time
  - Add purpose and attendees
  - Click "Submit Request"
  - Expected: Booking created, pending approval

- [ ] **View My Bookings**
  - Go to My Bookings → Facilities tab
  - Expected: See your facility requests

### 10. BOOKING APPROVALS (Admin) ✓
- [ ] **Approve Accommodation**
  - Go to Booking Approvals
  - View pending accommodation requests
  - Click "Approve" or "Decline"
  - Expected: Status updated, user notified

- [ ] **Approve Facility**
  - View pending facility requests
  - Click "Approve" or "Decline"
  - Expected: Status updated, user notified

### 11. NOTIFICATIONS ✓
- [ ] **View Notifications**
  - Click bell icon in header
  - Expected: List of notifications

- [ ] **Mark as Read**
  - Click on notification
  - Expected: Marked as read, badge count decreases

- [ ] **Auto-Refresh on Role Change**
  - When admin assigns you a role
  - Expected: Notification appears, page auto-refreshes after 2 seconds

### 12. PROFILE MANAGEMENT ✓
- [ ] **View Profile**
  - Click profile icon → Profile
  - Expected: See your profile details

- [ ] **Edit Profile**
  - Update name, phone, department
  - Add dietary preferences
  - Add allergies
  - Click "Save Changes"
  - Expected: Profile updated

### 13. ADMIN PANELS (Check Access Control) ✓
- [ ] **Admin Access**
  - Login as admin
  - Expected: See all admin menu items

- [ ] **HR Head Access**
  - Login as hr_head
  - Expected: See User Approvals, User Management

- [ ] **Club House Manager Access**
  - Login as club_house_manager
  - Expected: See Manage Menu, Food Orders, Facility Approvals

- [ ] **Managing Director Access**
  - Login as managing_director
  - Expected: See Reports, Approvals

- [ ] **Employee Access**
  - Login as employee
  - Expected: No admin panels, only user features

### 14. DATABASE & STORAGE ⚠️ CRITICAL
- [ ] **Storage Bucket Setup**
  ```sql
  -- Run in Supabase SQL Editor
  SELECT * FROM storage.buckets WHERE id = 'menu-images';
  ```
  - Expected: 1 row with public = true
  - If empty: Run `create_menu_images_storage.sql`

- [ ] **Check Policies**
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%menu%';
  ```
  - Expected: 4 policies (upload, view, update, delete)

- [ ] **Check Indexes**
  ```sql
  SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
  ```
  - Expected: Multiple indexes on menu_items, food_orders, profiles, etc.
  - If missing: Run `optimize_menu_items_performance.sql`

### 15. EMAIL NOTIFICATIONS (Optional) ⚠️
- [ ] **SMTP Configuration**
  - Go to Supabase Dashboard → Project Settings → Auth → SMTP
  - Check if custom SMTP is configured
  - If not: Emails won't send (optional feature)

- [ ] **Email Queue**
  ```sql
  SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;
  ```
  - Expected: See queued emails
  - If table doesn't exist: Run `setup_email_notifications.sql`

## CRITICAL ISSUES TO FIX BEFORE PRESENTATION

### Issue 1: Image Upload Fails ⚠️
**Symptoms:** "Bucket not found" or "Permission denied" when uploading menu images

**Fix:**
1. Go to Supabase Dashboard → Storage
2. Create bucket: `menu-images` (public = true)
3. OR run SQL: `create_menu_images_storage.sql`

### Issue 2: Food Ordering Fails ⚠️
**Symptoms:** Error when clicking "Place Order"

**Possible Causes:**
1. **Time Restriction:** Outside ordering hours
   - Solution: Test during allowed hours OR temporarily remove restrictions
   
2. **RLS Policy:** User doesn't have permission
   - Check: User is authenticated and approved
   
3. **Database Error:** Missing columns or constraints
   - Check browser console for exact error

**Debug Steps:**
1. Open browser console (F12)
2. Try placing order
3. Look for red error messages
4. Check Network tab for failed requests
5. Note the exact error message

### Issue 3: Role Assignment Creates Multiple Roles ✅ FIXED
**Status:** Fixed - now removes old roles before assigning new one

### Issue 4: Orders Not Filtered by Date ✅ FIXED
**Status:** Fixed - defaults to today, can select other dates

## QUICK TEST SCRIPT (5 Minutes)

1. **Login as Admin** → Approve a pending user → Assign role
2. **Login as Club House Manager** → Add menu item with image
3. **Login as Employee** → Order food (if within time window)
4. **Back to Club House Manager** → View today's orders → Issue order
5. **Back to Employee** → Check My Bookings → Download receipt

## PRESENTATION TIPS

### What to Show:
✅ User registration and approval workflow
✅ Role-based access control (different dashboards)
✅ Food ordering with time restrictions
✅ Menu management with image upload
✅ Order management and receipt generation
✅ Real-time notifications
✅ Date filtering on orders

### What to Avoid:
❌ Don't try to order outside time windows (will fail)
❌ Don't upload images over 5MB (will fail)
❌ Don't test email features if SMTP not configured

### Backup Plan:
- If food ordering fails: Show menu management instead
- If image upload fails: Use existing menu items
- If time restrictions block: Show historical orders

## FINAL CHECKLIST

- [ ] Storage bucket created
- [ ] At least 3 menu items with images
- [ ] Test user accounts created (admin, CHM, employee)
- [ ] Sample orders placed
- [ ] All migrations run
- [ ] Browser console clear of errors
- [ ] Test during allowed ordering hours

Good luck! 🚀
