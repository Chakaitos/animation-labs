# Fix for Duplicate Signup Verification Emails (CORRECTED)

## Problem

Users are receiving TWO verification emails when they sign up:
1. Supabase's default email
2. Our custom branded Resend email

## Root Cause

The code currently:
1. Calls `supabase.auth.signUp()` which triggers Supabase to send its default verification email (if email confirmations are enabled)
2. Then manually generates a verification link using `admin.generateLink()` and sends a custom branded email via Resend

Both emails are being sent because Supabase has "Enable email confirmations" turned ON in the production dashboard.

## Solution Options (Aligned with Supabase)

### **Option B: Send Email Hook** ✅ RECOMMENDED

This keeps your custom Resend emails and suppresses Supabase's emails.

#### How It Works
1. Supabase tries to send email → Calls your webhook
2. Your webhook returns 200 OK (acknowledges but doesn't send)
3. Your existing code sends the custom Resend email
4. Result: Only YOUR custom branded email is sent

#### Setup Steps

**1. Generate webhook secret:**
```bash
openssl rand -hex 32
```

**2. Add to environment variables:**
```bash
# .env.local (local)
SUPABASE_WEBHOOK_SECRET=your-generated-secret-here

# Vercel (production)
vercel env add SUPABASE_WEBHOOK_SECRET
# Paste the secret when prompted
```

**3. Deploy the webhook** (already created at `app/api/hooks/send-email/route.ts`)

**4. Configure Supabase Dashboard:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **Hooks**
4. Under **Send Email Hook**, click **Enable Hook**
5. Fill in the form:
   ```
   Hook URL: https://animationlabs.ai/api/hooks/send-email
   Secrets: your-generated-secret-here
   ```
6. Click **Save**

**5. Test the fix:**
- Sign up with a new email
- Check you receive only ONE email (custom Resend one)
- Verify it comes from `hello@animationlabs.ai`
- Confirm the verification link works

#### What Happens Now

```
User signs up
  ↓
supabase.auth.signUp()  → Creates user
  ↓
Supabase: "I should send confirmation email"
  ↓
Supabase calls: POST /api/hooks/send-email
  ↓
Your webhook: Returns 200 OK (but doesn't send)
  ↓
Your code: admin.generateLink() + sendVerificationEmail()
  ↓
Result: Only custom Resend email sent ✅
```

---

### **Option A: SMTP Configuration** (Alternative)

Use Resend's SMTP so Supabase sends through Resend, but using Supabase's templates.

#### How It Works
- Supabase sends emails through Resend's SMTP server
- You customize templates in Supabase dashboard
- Remove custom email code from your app

#### Setup Steps

**1. Get Resend SMTP credentials:**
- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: Your `RESEND_API_KEY`

**2. Configure Supabase SMTP:**
1. Go to: **Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Fill in:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: re_your_api_key
   Sender Email: hello@animationlabs.ai
   Sender Name: Animation Labs
   ```
4. Save

**3. Customize email templates:**
1. Go to: **Authentication** → **Email Templates**
2. Edit "Confirm signup" template
3. Customize with your branding

**4. Remove custom email code:**

In `lib/actions/auth.ts`, remove this section:
```typescript
// Remove lines 58-83 (the admin.generateLink + sendVerificationEmail code)
```

#### Pros & Cons

**Pros:**
- Simpler code (less to maintain)
- Centralized in Supabase dashboard
- All emails visible in Resend

**Cons:**
- Less control over email design
- Template customization is limited (HTML only, not React)
- Can't use React Email components
- Harder to preview/test locally

---

## Comparison

| Feature | Option B (Hook) | Option A (SMTP) |
|---------|----------------|-----------------|
| Custom React Email templates | ✅ Yes | ❌ No (HTML only) |
| Full design control | ✅ Yes | ⚠️ Limited |
| Easy to preview/test | ✅ Yes | ❌ No |
| Consistent with existing emails | ✅ Yes | ⚠️ Different |
| Setup complexity | ⚠️ Medium | ✅ Simple |
| Code maintenance | ⚠️ More code | ✅ Less code |

## Recommended Approach

**Use Option B (Send Email Hook)** because:
- ✅ Keeps your custom React Email templates
- ✅ Consistent branding with video/payment emails
- ✅ Better control and flexibility
- ✅ Easier to test and preview locally
- ✅ Maintains current code architecture

Only use Option A if you want to simplify and don't need custom email design.

## Testing Checklist

After implementing Option B:

- [ ] Generate webhook secret (`openssl rand -hex 32`)
- [ ] Add `SUPABASE_WEBHOOK_SECRET` to `.env.local` and Vercel
- [ ] Deploy webhook endpoint (already created)
- [ ] Configure Send Email Hook in Supabase dashboard
- [ ] Test signup receives only ONE email
- [ ] Email is from `hello@animationlabs.ai`
- [ ] Email has Animation Labs branding
- [ ] Verification link works correctly
- [ ] User redirected to dashboard after verification
- [ ] Welcome email sent after verification
- [ ] Check Supabase logs: Hook returns 200 OK
- [ ] Check Vercel logs: Custom email sent via Resend

## Rollback Plan

If you need to rollback:

1. Go to Supabase Dashboard → Authentication → Hooks
2. Disable the Send Email Hook
3. Supabase will resume sending its default emails
4. You'll get duplicate emails again (original problem)

## Additional Notes

- The webhook endpoint is at `app/api/hooks/send-email/route.ts`
- It returns 200 OK but doesn't actually send emails
- Your existing code in `lib/actions/auth.ts` handles sending
- The hook prevents Supabase from sending, not your app
- After verification, a welcome email is sent (see `app/auth/callback/route.ts`)
