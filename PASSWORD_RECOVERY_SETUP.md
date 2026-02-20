# Password Recovery Email Setup

## Overview
Supabase automatically sends password recovery emails with a secure link/code. This is a **built-in feature** that works out of the box.

## How It Works

### 1. User Requests Password Reset
When a user clicks "Forgot Password" in your app, the system calls:
```typescript
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://yourapp.com/reset-password',
})
```

### 2. Supabase Sends Recovery Email
Supabase automatically sends an email with:
- A secure recovery link (valid for 1 hour)
- Or a 6-digit recovery code (if configured)

### 3. User Resets Password
User clicks the link or enters the code to set a new password.

## Configuration Steps

### Step 1: Configure SMTP Settings
Go to **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**

Enable **Custom SMTP** and configure:
```
Host: smtp.gmail.com (or your provider)
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Sender Email: noreply@toppclubhouse.com
Sender Name: TOPP Clubhouse
```

### Step 2: Customize Recovery Email Template
Go to **Supabase Dashboard** → **Authentication** → **Email Templates** → **Reset Password**

#### Option A: Recovery Link (Default - Recommended)
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for your TOPP Clubhouse account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p><strong>This link will expire in 1 hour.</strong></p>
<p>If you didn't request this, please ignore this email.</p>
<br>
<p>Best regards,<br>TOPP Clubhouse Team</p>
```

#### Option B: Recovery Code (6-digit OTP)
To use recovery codes instead of links:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Enable **"Use OTP instead of magic links"**
3. Update email template:

```html
<h2>Password Recovery Code</h2>
<p>Hi there,</p>
<p>You requested to reset your password for your TOPP Clubhouse account.</p>
<p>Your recovery code is:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; font-family: monospace; background: #f3f4f6; padding: 16px; text-align: center;">{{ .Token }}</h1>
<p><strong>This code will expire in 1 hour.</strong></p>
<p>Enter this code in the password reset page to continue.</p>
<p>If you didn't request this, please ignore this email.</p>
<br>
<p>Best regards,<br>TOPP Clubhouse Team</p>
```

### Step 3: Configure Redirect URL
Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

Add your reset password page URL to **Redirect URLs**:
```
https://yourapp.com/reset-password
http://localhost:5173/reset-password (for development)
```

## Implementation in Your App

### Password Reset Request Page
```typescript
// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Check your email',
        description: 'We sent you a password recovery link.',
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Recovery Email'}
      </button>
    </form>
  );
};
```

### Password Reset Page (for recovery link)
```typescript
// src/pages/auth/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Your password has been updated.',
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdatePassword}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter new password"
        minLength={6}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};
```

### Password Reset with OTP Code
```typescript
// If using OTP codes instead of links
const handleVerifyOTP = async (email: string, token: string, newPassword: string) => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  });

  if (!error) {
    // Now update the password
    await supabase.auth.updateUser({
      password: newPassword,
    });
  }
};
```

## Testing

### Test Password Recovery
1. Go to your login page
2. Click "Forgot Password"
3. Enter your email
4. Check your email inbox
5. Click the recovery link or enter the code
6. Set a new password

### Check Email Queue
```sql
-- View recovery emails sent
SELECT * FROM auth.users WHERE email = 'test@example.com';
```

## Security Features

✅ **Automatic Expiration** - Links/codes expire after 1 hour
✅ **One-time Use** - Each link/code can only be used once
✅ **Rate Limiting** - Prevents spam/abuse
✅ **Secure Tokens** - Cryptographically secure random tokens
✅ **HTTPS Only** - Recovery links only work over HTTPS in production

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify SMTP settings in Supabase Dashboard
3. Check email queue: Dashboard → Authentication → Users → Email logs
4. Verify sender email is authenticated with your SMTP provider

### Link Not Working
1. Check if link expired (1 hour limit)
2. Verify redirect URL is added to allowed URLs in Supabase
3. Check browser console for errors
4. Ensure you're using HTTPS in production

### Rate Limiting
- Supabase limits password reset requests to prevent abuse
- Default: 1 request per email per hour
- If blocked, wait 1 hour or contact support

## Email Providers Comparison

| Provider | Free Tier | Cost | Setup Difficulty |
|----------|-----------|------|------------------|
| Gmail | 500/day | Free | Easy |
| SendGrid | 100/day | $0.10/1000 after | Easy |
| AWS SES | 62,000/month | $0.10/1000 after | Medium |
| Resend | 3,000/month | $20/month after | Easy |
| Mailgun | 5,000/month | $35/month after | Medium |

## Best Practices

1. **Use Custom SMTP** - Don't rely on Supabase default for production
2. **Customize Email Template** - Match your brand
3. **Set Short Expiration** - 1 hour is good for security
4. **Add Branding** - Include logo and company colors
5. **Test Regularly** - Ensure emails are being delivered
6. **Monitor Bounce Rates** - Check email delivery success
7. **Use HTTPS** - Always use secure connections in production

## Summary

✅ Password recovery emails are **built-in** to Supabase
✅ Just configure SMTP settings and customize the template
✅ No SQL code needed - it works automatically
✅ Choose between recovery links or OTP codes
✅ Secure, rate-limited, and production-ready
