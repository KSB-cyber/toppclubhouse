# Email Notifications Setup Guide

## Overview
This system automatically sends email notifications for:
1. **Food Order Confirmation** - When user places an order
2. **Food Order Delivery** - When CHM marks order as delivered
3. **Role Changes** - When admin assigns a new role to user
4. **Password Reset** - Built-in Supabase feature
5. **Login Alerts** - Optional security feature

## Setup Steps

### 1. Run the SQL Migration
Execute `setup_email_notifications.sql` in your Supabase SQL Editor to create:
- Email queue table
- Trigger functions for automatic notifications
- Database triggers

### 2. Configure Supabase Email Settings

#### Option A: Use Supabase Built-in SMTP (Recommended for Production)
1. Go to **Supabase Dashboard** → **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Configure your SMTP provider (Gmail, SendGrid, AWS SES, etc.):
   ```
   Host: smtp.gmail.com (or your provider)
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   Sender Email: noreply@toppclubhouse.com
   Sender Name: TOPP Clubhouse
   ```

#### Option B: Use Supabase Default (Development Only)
- Supabase provides default email service for development
- Limited to 3 emails per hour
- Not recommended for production

### 3. Enable Email Templates

Go to **Supabase Dashboard** → **Authentication** → **Email Templates** and customize:

#### Confirmation Email (Sign Up)
```html
<h2>Welcome to TOPP Clubhouse!</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### Password Reset Email
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

### 4. Process Email Queue (Choose One Method)

#### Method A: Supabase Edge Function (Recommended)
Create a Supabase Edge Function to process the email queue:

```typescript
// supabase/functions/process-emails/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get unsent emails
  const { data: emails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('sent', false)
    .limit(10)

  for (const email of emails || []) {
    try {
      // Send email using your preferred service
      // Example: SendGrid, AWS SES, Resend, etc.
      
      // Mark as sent
      await supabase
        .from('email_queue')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', email.id)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  return new Response(JSON.stringify({ processed: emails?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Set up a cron job to run this every minute:
```bash
# In Supabase Dashboard → Edge Functions → Cron Jobs
0 * * * * # Every minute
```

#### Method B: External Service (Alternative)
Use a service like Zapier, Make.com, or n8n to:
1. Poll the `email_queue` table every minute
2. Send emails via your email provider
3. Mark emails as sent

#### Method C: Simple Webhook (Quick Setup)
Create a webhook that processes emails on-demand:
1. Deploy the edge function above
2. Call it manually or via cron from your server

### 5. Test the System

#### Test Food Order Email
```sql
-- Place a test order (will trigger email)
INSERT INTO food_orders (user_id, order_date, delivery_time, meal_type, total_amount)
VALUES (
  'your-user-id',
  CURRENT_DATE,
  NOW() + INTERVAL '2 hours',
  'lunch',
  25.00
);
```

#### Test Role Change Email
```sql
-- Assign a role (will trigger email)
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'club_house_manager');
```

#### Check Email Queue
```sql
-- View pending emails
SELECT * FROM email_queue WHERE sent = false;

-- View sent emails
SELECT * FROM email_queue WHERE sent = true ORDER BY sent_at DESC;
```

### 6. Built-in Supabase Features (Already Working)

These work automatically without additional setup:

#### Password Reset
Users can reset password via:
```typescript
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://yourapp.com/reset-password',
})
```

#### Email Verification
Automatically sent when users sign up:
```typescript
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
})
```

## Email Queue Management

### Monitor Queue
```sql
-- Check queue status
SELECT 
  COUNT(*) FILTER (WHERE sent = false) as pending,
  COUNT(*) FILTER (WHERE sent = true) as sent,
  COUNT(*) as total
FROM email_queue;
```

### Clear Old Emails
```sql
-- Delete emails older than 30 days
DELETE FROM email_queue 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Retry Failed Emails
```sql
-- Reset failed emails for retry
UPDATE email_queue 
SET sent = false 
WHERE sent = false 
  AND created_at < NOW() - INTERVAL '1 hour';
```

## Troubleshooting

### Emails Not Sending
1. Check SMTP settings in Supabase Dashboard
2. Verify email queue has entries: `SELECT * FROM email_queue`
3. Check Edge Function logs
4. Verify sender email is verified with your SMTP provider

### Emails Going to Spam
1. Set up SPF, DKIM, and DMARC records for your domain
2. Use a verified sender email
3. Avoid spam trigger words in subject/body
4. Use a reputable SMTP provider

### Rate Limiting
- Most SMTP providers have rate limits
- Process emails in batches
- Add delays between sends if needed

## Security Notes

- Email queue table has RLS enabled (system-only access)
- Use service role key for Edge Functions
- Never expose SMTP credentials in client code
- Regularly clean up old emails from queue

## Cost Considerations

- Supabase default email: Free (limited)
- Custom SMTP: Varies by provider
  - SendGrid: 100 emails/day free
  - AWS SES: $0.10 per 1,000 emails
  - Gmail: Free (with limits)
  - Resend: 3,000 emails/month free
