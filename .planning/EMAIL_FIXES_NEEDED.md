# Email Issues - Action Items

## Issue 1: Verification Email Uses Supabase Default Template

### Problem
Users receive plain text verification emails from Supabase instead of our custom branded React Email template.

### Root Cause
Supabase SMTP is configured, so Supabase automatically sends its own emails for auth events. Our custom emails are ALSO being sent, resulting in duplicate emails.

### Solution Options

**Option A: Disable Supabase SMTP (Recommended)**
1. Go to Supabase Dashboard
2. Navigate to: Authentication > Email Templates
3. Disable "Send emails via SMTP"
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
5. Verify `RESEND_API_KEY` is set in Vercel

**Pros:**
- Only branded emails sent
- Full control over content
- Consistent branding

**Cons:**
- Requires both API keys to be set
- If keys are missing, NO emails sent

**Option B: Remove Custom Email Code**
1. Remove `sendVerificationEmail()` call from `lib/actions/auth.ts`
2. Remove `sendPasswordResetEmail()` call from `lib/actions/auth.ts`
3. Keep Supabase SMTP enabled

**Pros:**
- Simpler (less code)
- Works without extra API keys

**Cons:**
- Plain text emails (not branded)
- Limited customization

**Recommended:** Option A (Disable Supabase SMTP)

### Verification
After applying fix:
1. Create new account
2. Should receive ONLY ONE email
3. Email should have AnimateLabs branding
4. Link should work and redirect to dashboard

---

## Issue 2: Confirmation Link Redirects to Wrong Path

### Problem
Supabase redirects to `/auth/callback/auth/confirm` (404) instead of `/auth/callback`

### Status
**FIXED** - Auth callback route created

### What Was Done
1. Created `/app/auth/callback/route.ts` - primary callback handler
2. Updated `/app/auth/confirm/route.ts` - redirects to `/auth/callback`
3. Updated signup `emailRedirectTo` to use `/auth/callback`
4. Updated password reset `redirectTo` to use `/auth/callback`

### Verification
After deploying:
1. Click verification link from email
2. Should redirect to `/auth/callback?token_hash=...`
3. Should verify email successfully
4. Should redirect to dashboard
5. No 404 errors

---

## Issue 3: Video Completion Emails Not Sending

### Problem
No logs in Resend or Vercel when videos complete. Users don't receive "Your video is ready" emails.

### Possible Causes
1. Webhook not being called by n8n
2. RESEND_API_KEY not set in Vercel
3. Email function failing silently
4. Webhook conditions not met (wrong status, missing data)

### What Was Done
Added extensive logging to `/app/api/webhooks/video-status/route.ts`:
- Webhook invocation timestamp
- Request headers and payload
- Email trigger conditions
- Email success/failure messages

### Debug Steps

**Step 1: Verify Environment Variables**
```bash
# Check in Vercel dashboard or CLI
vercel env ls

# Required:
RESEND_API_KEY=re_xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
N8N_WEBHOOK_SECRET=xxxxx
```

**Step 2: Check Webhook Logs**
```bash
# View Vercel logs
vercel logs [deployment-url] --follow

# Look for:
=== VIDEO STATUS WEBHOOK CALLED ===
=== SENDING VIDEO READY EMAIL ===
=== VIDEO EMAIL SENT SUCCESSFULLY ===
```

**Step 3: Test Webhook Manually**
```bash
# Call webhook with test data
curl -X POST https://[your-domain]/api/webhooks/video-status \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d '{
    "videoId": "test-video-id",
    "status": "completed",
    "videoUrl": "https://example.com/video.mp4",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "brandName": "Test Brand",
    "n8nExecutionId": "test-execution"
  }'
```

**Step 4: Check n8n Workflow**
1. Open n8n workflow for video generation
2. Verify webhook node is configured
3. Check execution logs for errors
4. Verify webhook URL is correct
5. Verify webhook secret matches

**Step 5: Check Resend Dashboard**
1. Go to https://resend.com/emails
2. Check for recent sends
3. Look for errors or bounces

### Expected Log Output

**Successful webhook call:**
```
=== VIDEO STATUS WEBHOOK CALLED ===
Timestamp: 2026-02-03T12:00:00.000Z
Webhook headers: { ... }
Webhook payload: { ... }
Checking if should send email: { hasData: true, status: 'completed', shouldSend: true }
=== SENDING VIDEO READY EMAIL ===
Email trigger data: { videoId: '...', userId: '...', brandName: '...', ... }
sendVideoReadyEmail called: { ... }
Profile fetched successfully: { ... }
Video ready email sent successfully: { emailId: '...' }
=== VIDEO EMAIL SENT SUCCESSFULLY ===
=== WEBHOOK COMPLETED SUCCESSFULLY ===
```

**If webhook not called:**
- No logs at all
- Issue: n8n workflow not calling webhook
- Fix: Check n8n webhook configuration

**If email not triggered:**
```
Checking if should send email: { hasData: false, status: 'completed', shouldSend: false }
Email NOT sent - conditions not met
```
- Issue: Database update failed or returned no data
- Fix: Check video exists and update succeeds

**If email fails:**
```
=== VIDEO EMAIL FAILED ===
Failed to send video ready email: { error: '...' }
```
- Issue: Resend API error
- Fix: Check RESEND_API_KEY, domain verification

---

## Environment Variables Checklist

### Vercel Production

- [ ] `RESEND_API_KEY` - Get from https://resend.com/api-keys
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase dashboard > Settings > API
- [ ] `N8N_WEBHOOK_SECRET` - Shared secret with n8n workflow
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Already set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already set

### How to Set in Vercel

1. Go to https://vercel.com/[team]/animatelabs/settings/environment-variables
2. Add missing variables
3. Select "Production" environment
4. Redeploy to apply changes

---

## Testing Checklist

### Signup Flow
- [ ] Create new account
- [ ] Receive verification email (only one)
- [ ] Email has AnimateLabs branding
- [ ] Click verification link
- [ ] Redirected to /auth/callback (no 404)
- [ ] Email verified successfully
- [ ] Redirected to dashboard
- [ ] Receive welcome email

### Video Flow
- [ ] Create new video
- [ ] Check Vercel logs for webhook call
- [ ] Video status updates to 'completed'
- [ ] Email sent to user
- [ ] Email appears in Resend dashboard
- [ ] User receives email in inbox

### Password Reset
- [ ] Request password reset
- [ ] Receive reset email (only one)
- [ ] Email has AnimateLabs branding
- [ ] Click reset link
- [ ] Redirected to /auth/callback (no 404)
- [ ] Can set new password
- [ ] Redirected to login

---

## Summary of Changes

### Files Modified
1. `app/auth/callback/route.ts` - Created primary callback handler
2. `app/auth/confirm/route.ts` - Redirect to callback for compatibility
3. `lib/actions/auth.ts` - Updated emailRedirectTo URLs
4. `app/api/webhooks/video-status/route.ts` - Added extensive logging

### What Works Now
- Auth callback route handles all verification types
- Extensive logging for debugging
- Welcome email sent after verification

### What Still Needs Testing
1. Verify environment variables are set in Vercel
2. Test signup flow in production
3. Test video completion flow
4. Check if video emails are sent
5. Disable Supabase SMTP if duplicate emails occur

### Next Actions
1. Deploy to Vercel
2. Set missing environment variables
3. Test signup with new email
4. Create test video
5. Monitor logs and Resend dashboard
