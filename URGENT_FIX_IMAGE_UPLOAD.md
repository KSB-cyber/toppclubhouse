# URGENT: Fix Image Upload - Run This Now!

## Step 1: Create Storage Bucket (2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **umzmuhqcdnvhqgzzsman**
3. Click **Storage** in the left sidebar
4. Click **New bucket** button
5. Fill in:
   - Name: `menu-images`
   - Public bucket: ✅ **CHECK THIS BOX**
   - File size limit: `5` MB
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
6. Click **Create bucket**

## Step 2: Set Storage Policies (1 minute)

1. Still in **Storage** → Click on **menu-images** bucket
2. Click **Policies** tab
3. Click **New Policy** button
4. Click **For full customization** → **Create policy**

### Policy 1: Upload Images
```
Policy name: Anyone can upload menu images
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'menu-images'
```
Click **Review** → **Save policy**

### Policy 2: View Images
```
Policy name: Public can view menu images
Allowed operation: SELECT
Target roles: public
USING expression: bucket_id = 'menu-images'
```
Click **Review** → **Save policy**

### Policy 3: Update Images
```
Policy name: Anyone can update menu images
Allowed operation: UPDATE
Target roles: authenticated
USING expression: bucket_id = 'menu-images'
```
Click **Review** → **Save policy**

### Policy 4: Delete Images
```
Policy name: Anyone can delete menu images
Allowed operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'menu-images'
```
Click **Review** → **Save policy**

## Step 3: Alternative - Run SQL (30 seconds)

**OR** instead of Steps 1-2, just run this SQL:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New query**
3. Paste the contents of `supabase/migrations/create_menu_images_storage.sql`
4. Click **Run**

## Step 4: Test Image Upload

1. Log in as Club House Manager
2. Go to **Manage Menu**
3. Click **Add Menu Item**
4. Fill in the form
5. Click the image upload area
6. Select an image (JPG, PNG, or WEBP under 5MB)
7. Click **Create**

✅ **It should work now!**

## If It Still Fails

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to **Console** tab
3. Try uploading again
4. Look for error messages
5. Send me the error message

### Common Issues

**Error: "Bucket not found"**
- Solution: Make sure bucket name is exactly `menu-images` (with hyphen)

**Error: "Permission denied"**
- Solution: Check that bucket is marked as **Public**
- Solution: Verify all 4 policies are created

**Error: "File too large"**
- Solution: Image must be under 5MB
- Solution: Compress image before uploading

**Error: "Invalid file type"**
- Solution: Only JPG, PNG, WEBP, GIF allowed
- Solution: Convert image to supported format

### Quick Verification

Run this in SQL Editor to check if bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'menu-images';
```

Should return 1 row with `public = true`

Run this to check policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%menu%';
```

Should return 4 policies

## Summary

✅ Code is fixed (better error handling, unique filenames)
✅ SQL migration is ready
✅ Just need to create the storage bucket

**Total time: 3 minutes**

Good luck with your presentation! 🚀
