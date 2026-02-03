# Email Configuration Guide

## Current State

AnimateLabs has custom branded email templates built with React Email. However, email delivery depends on proper environment configuration.

## Environment Variables Required

### Production (Vercel)

**Required for custom emails:**
- `RESEND_API_KEY` - API key from Resend dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase dashboard

**Already configured:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_SECRET`
- `N8N_WEBHOOK_URL`

### How to Verify

Check Vercel environment variables:
```bash
# Via Vercel dashboard:
# https://vercel.com/[team]/[project]/settings/environment-variables

# Or via CLI:
vercel env ls
```

## Email Flow

### 1. Verification Email (Signup)

**Flow:**
1. User submits signup form
2. `lib/actions/auth.ts` `signUp()` function is called
3. Creates user via `supabase.auth.signUp()`
4. Generates magic link via `supabaseAdmin.auth.admin.generateLink()`
5. Calls `sendVerificationEmail()` with branded template
6. Redirects to `/verify-email` page

**What users see:**
- If RESEND_API_KEY is set: Branded "Welcome to Animation Labs" email
- If not set: Supabase default plain text email (if SMTP configured)

**Current issue:**
- Supabase SMTP is configured, so it sends its own email
- Our custom email is ALSO sent
- User receives TWO emails (one branded, one plain)

**Solution options:**
1. Disable Supabase SMTP (recommended) - only custom emails sent
2. Disable custom emails in code - only Supabase emails sent
3. Keep both (current state) - user gets two emails

### 2. Password Reset Email

**Flow:**
1. User submits forgot password form
2. `lib/actions/auth.ts` `resetPassword()` function is called
3. Generates recovery link via `supabaseAdmin.auth.admin.generateLink()`
4. Calls `sendPasswordResetEmail()` with branded template

**Same issue:** Dual emails if SMTP configured

### 3. Welcome Email (After Email Verification)

**Flow:**
1. User clicks verification link in email
2. Supabase redirects to `/auth/callback?token_hash=...&type=email`
3. Route handler calls `supabase.auth.verifyOtp()`
4. On success, calls `sendWelcomeEmail()` asynchronously
5. Redirects user to dashboard

**This is working correctly** - only sent by our code, not Supabase

### 4. Video Ready Email

**Flow:**
1. n8n workflow completes video generation
2. Calls `/api/webhooks/video-status` with status=completed
3. Webhook updates database
4. Calls `sendVideoReadyEmail()` asynchronously

**Issue:** Not being sent (no logs in Resend or Vercel)

**Possible causes:**
1. Webhook not being called by n8n
2. Email function failing silently
3. RESEND_API_KEY not set in Vercel

**Debug steps:**
1. Check Vercel logs for `=== VIDEO STATUS WEBHOOK CALLED ===`
2. Check if email trigger conditions are met
3. Check for email sending errors in logs

### 5. Payment Failed Email

**Flow:**
1. Stripe sends `invoice.payment_failed` webhook
2. `/api/webhooks/stripe` handler processes event
3. Calls `sendPaymentFailedEmail()` asynchronously

**Status:** Not tested yet

## Supabase SMTP Configuration

### Current Setup

Supabase project has SMTP configured, which means:
- Supabase sends its own emails for auth events
- Plain text templates (not branded)
- No control over content

### To Disable Supabase SMTP

1. Go to Supabase dashboard
2. Navigate to Authentication > Email Templates
3. Disable "Send emails via SMTP"
4. Custom emails will be the only ones sent

**Important:** If you disable SMTP, you MUST have `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` set, or users won't receive any emails.

## Auth Callback Routes

### /auth/callback (Primary)

Main route for handling Supabase email verification redirects.

**Handles:**
- Email verification (`type=email` or `type=signup`)
- Password recovery (`type=recovery`)
- Sends welcome email after verification
- Extensive logging for debugging

### /auth/confirm (Legacy)

Redirects to `/auth/callback` for backward compatibility.

**Why keep it:**
- Old email links might still use this path
- Supabase might default to this path in some cases

## Testing Email Flow

### Signup Email

1. Create new account at `/signup`
2. Check email inbox for verification email
3. Click verification link
4. Should redirect to dashboard
5. Check for welcome email

### Video Email

1. Create a new video
2. Wait for completion
3. Check Vercel logs for webhook calls
4. Check Resend dashboard for email sends
5. Check email inbox

### Debugging

**Vercel logs:**
```bash
vercel logs [deployment-url] --follow
```

**Look for:**
- `=== VIDEO STATUS WEBHOOK CALLED ===`
- `=== SENDING VIDEO READY EMAIL ===`
- `=== VIDEO EMAIL SENT SUCCESSFULLY ===`
- Any error messages

**Resend logs:**
- Dashboard: https://resend.com/emails
- Check for email ID matching logs

## Troubleshooting

### No emails being sent

1. Check `RESEND_API_KEY` is set in Vercel
2. Check Vercel function logs for errors
3. Verify Resend domain is verified

### Duplicate emails

1. Check if Supabase SMTP is enabled
2. Disable SMTP or remove custom email calls

### Wrong redirect URL

1. Check Supabase Site URL setting
2. Should be: `https://[your-domain]` (no trailing slash)
3. Should NOT include `/auth/callback` prefix

### Emails in spam

1. Verify sending domain in Resend
2. Add SPF, DKIM, DMARC records
3. Use transactional email best practices

## Next Steps

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Verify `RESEND_API_KEY` is set in Vercel
3. Test signup flow in production
4. Check Vercel logs for webhook calls
5. Test video completion flow
6. Monitor Resend dashboard for email delivery

## References

- Resend Dashboard: https://resend.com/
- Supabase Auth Settings: https://supabase.com/dashboard/project/[project-id]/auth/email-templates
- Vercel Logs: https://vercel.com/[team]/[project]/logs
