# Supabase Email Configuration for The Good Loose Coins

## Current Issue
- Users are receiving magic links instead of 6-digit OTP codes
- Emails are branded as "Supabase" instead of "The Good Loose Coins"

## Solution: Configure Supabase Email Settings

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `thegoodloosecoins` 
3. Navigate to **Authentication** → **Settings**

### Step 2: Configure Email Templates
1. In the Authentication settings, find **Email Templates** section
2. Click on **Confirm signup** template
3. Update the email template to:
   - **From Name**: `The Good Loose Coins`
   - **Subject**: `Verify your email - The Good Loose Coins`
   - **Body**: Customize to use your branding and mention the 6-digit code

### Step 3: Force OTP Instead of Magic Links
1. In **Authentication** → **Settings** 
2. Find **Email confirmation** section
3. **Disable** "Enable email confirmations" if it forces magic links
4. **Enable** "Enable OTP" or similar option for 6-digit codes

### Step 4: Custom SMTP (Optional - Requires Paid Plan)
For complete control over sender name and domain:
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure custom SMTP with your domain
3. Set sender name as "The Good Loose Coins Team"
4. This requires:
   - Custom domain setup
   - SMTP credentials (like SendGrid, AWS SES, etc.)
   - Supabase Pro plan or higher

### Step 5: Alternative - Custom Email Service
If Supabase limitations persist, we can:
1. Disable Supabase email confirmations entirely
2. Implement custom email service using:
   - SendGrid API
   - AWS SES
   - Nodemailer with custom SMTP
3. Send branded OTP emails directly from our backend

## Current Code Changes
The signup flow has been updated to:
- Use `signInWithOtp()` instead of `signUp()` initially
- This should force 6-digit codes instead of magic links  
- Complete account creation only after OTP verification

## Testing
After configuration:
1. Try signing up with a new email
2. Should receive 6-digit code from "The Good Loose Coins"
3. No more magic links or Supabase branding