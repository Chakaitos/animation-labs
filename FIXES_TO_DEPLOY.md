# Fixes to Deploy

## Issues Fixed

1. ✅ **Webhook authentication error** - "Hook requires authorization token"
2. ✅ **Password reset verification failed** - Better error handling and logging

## Changes Made

### 1. Fixed Send Email Hook (`app/api/hooks/send-email/route.ts`)
- Removed incorrect `'use server'` directive
- Added comprehensive error logging
- Better authentication validation
- Returns proper status codes

### 2. Improved Auth Callback (`app/auth/callback/route.ts`)
- Better error handling for verification failures
- More detailed logging for debugging
- Handles Supabase error redirects
- Shows specific error messages

## Deployment Steps

### Step 1: Verify Environment Variable

**Check that `SUPABASE_WEBHOOK_SECRET` is set:**

```bash
# Local (should already be set from .env.local selection)
grep SUPABASE_WEBHOOK_SECRET .env.local

# Production - Add to Vercel
vercel env add SUPABASE_WEBHOOK_SECRET
```

**If you haven't generated a secret yet:**
```bash
openssl rand -hex 32
```

### Step 2: Deploy to Production

```bash
git add .
git commit -m "fix: webhook authentication and password reset verification"
git push origin main
```

### Step 3: Configure Supabase Send Email Hook

**After deployment completes:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **Hooks**
4. Under **Send Email Hook**:
   - Click **Enable Hook**
   - Hook URL: `https://animationlabs.ai/api/hooks/send-email`
   - Secrets: (paste your SUPABASE_WEBHOOK_SECRET value)
   - Click **Save**

### Step 4: Test Both Flows

**Test Signup:**
1. Sign up with a new test email
2. Should NOT see "Hook requires authorization token" error
3. Should receive ONE verification email (custom Resend one)
4. Click verification link
5. Should redirect to dashboard

**Test Password Reset:**
1. Go to forgot password page
2. Enter email address
3. Receive password reset email
4. Click reset link
5. Should NOT see "Verification failed" error
6. Should land on update password page
7. Set new password
8. Should redirect to login

### Step 5: Monitor Logs

**Check Vercel logs after testing:**
```bash
vercel logs --since 1h | grep "Send Email Hook"
vercel logs --since 1h | grep "Auth callback"
```

**Look for:**
- ✅ "Send Email Hook: Authenticated successfully"
- ✅ "Email verified successfully"
- ❌ Any errors or failures

## Troubleshooting

### If signup still shows "Hook requires authorization token"

**Check:**
1. `SUPABASE_WEBHOOK_SECRET` is set in Vercel environment variables
2. Secret in Vercel matches secret in Supabase dashboard exactly
3. Deployment completed successfully (check Vercel deployments page)
4. Clear your browser cache and try again

**Debug:**
```bash
# Check environment variable in production
vercel env ls | grep SUPABASE_WEBHOOK_SECRET

# View detailed logs
vercel logs --follow
```

### If password reset still fails

**Check logs for:**
```bash
vercel logs | grep "Auth callback invoked"
```

**Look for:**
- `error` parameter in URL
- `errorDescription` giving more details
- `type` should be "recovery" for password reset
- `hasTokenHash` should be true

**Common issues:**
- Token expired (links expire after 1 hour by default)
- User clicked old reset link
- Email wasn't actually sent (check Resend dashboard)

## Expected Behavior After Fix

### Signup Flow
```
1. User submits signup form
2. Supabase creates user
3. Supabase calls: POST /api/hooks/send-email
4. Webhook returns: 200 OK (suppresses Supabase email)
5. Your code sends custom Resend email ✅
6. User receives ONE email
7. Clicks verification link
8. Redirects to dashboard
9. Welcome email sent
```

### Password Reset Flow
```
1. User requests password reset
2. Custom Resend email sent
3. User clicks reset link
4. Link verified successfully
5. Redirects to /update-password
6. User sets new password
7. Redirects to login
```

## Rollback Plan

If issues persist:

1. **Disable the Send Email Hook** in Supabase dashboard
2. This will restore default behavior (duplicate emails)
3. Debug further in development environment

## Next Steps After Successful Deployment

- [ ] Test signup with real email
- [ ] Test password reset with real email
- [ ] Verify only ONE email received for each flow
- [ ] Check Resend dashboard for email deliverability
- [ ] Monitor Vercel logs for any errors
- [ ] Update `.planning/STATE.md` to mark email duplication as resolved
