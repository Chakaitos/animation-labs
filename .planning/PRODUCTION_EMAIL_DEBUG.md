# Production Email Debug - Quick Reference

## Reported Issue

**Symptom:** Video completed in production but completion email not received

**Date:** 2026-02-02

## Immediate Checks

### 1. Verify Environment Variables in Vercel

```bash
# Check all env vars are set
vercel env ls

# Required variables:
✓ RESEND_API_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ SUPABASE_SERVICE_ROLE_KEY
✓ N8N_WEBHOOK_SECRET
```

**If missing:** `vercel env add RESEND_API_KEY` then redeploy

### 2. Check Recent Vercel Logs

```bash
# View last 24 hours
vercel logs --since 24h

# Filter for video completion
vercel logs --since 24h | grep "completed"

# Filter for email sending
vercel logs --since 24h | grep "video-ready"
```

**What to look for:**
- ✅ "Triggering video ready email" = Webhook called email function
- ✅ "Profile fetched successfully" = User profile found
- ✅ "Video ready email sent successfully" = Email sent to Resend
- ❌ "Failed to send video ready email" = Email failed
- ❌ "User profile not found" = Profile issue
- ⚠️ Nothing = Webhook might not have been called

### 3. Check Resend Dashboard

**URL:** https://resend.com/emails

**Steps:**
1. Go to Resend dashboard
2. Filter by recipient email (user who didn't receive email)
3. Check status:
   - **Sent** = Email delivered successfully (check spam)
   - **Bounced** = Invalid email or mailbox full
   - **Failed** = Permanent error (check logs)
   - **Not found** = Email never sent to Resend (check logs)

### 4. Check Supabase Database

**Verify video status:**
```sql
SELECT
  id,
  user_id,
  brand_name,
  status,
  video_url,
  thumbnail_url,
  created_at,
  updated_at
FROM videos
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 5;
```

**Verify user profile:**
```sql
SELECT
  id,
  email,
  first_name
FROM profiles
WHERE id = 'user-id-here';
```

**Check if profile email is valid:**
- Must not be null
- Must be a valid email format
- Must match the expected recipient

## Common Issues & Fixes

### Issue 1: RESEND_API_KEY Not Set

**Logs:** "RESEND_API_KEY environment variable is not set"

**Fix:**
```bash
# Add via CLI
vercel env add RESEND_API_KEY
# Or via Dashboard: Settings → Environment Variables → Add

# Then redeploy
vercel --prod
```

### Issue 2: Domain Not Verified

**Logs:** "domain_not_verified" or "permanent email error"

**Fix:**
1. Go to https://resend.com/domains
2. Verify `animationlabs.ai` has green checkmark
3. If not verified:
   - Check DNS records (SPF, DKIM, DMARC)
   - Wait up to 48 hours for propagation
   - Use test domain temporarily: `onboarding@resend.dev`

### Issue 3: User Profile Missing

**Logs:** "User profile not found" or "Failed to fetch user profile"

**Fix:**
1. Check if profile exists in database (query above)
2. If missing, profile trigger may have failed during signup
3. Manually create profile:
   ```sql
   INSERT INTO profiles (id, email, first_name)
   VALUES ('user-id', 'user@example.com', 'FirstName');
   ```

### Issue 4: Webhook Not Called

**Logs:** No logs about email at all

**Possible causes:**
- n8n workflow not sending status webhook
- Webhook secret mismatch
- Network connectivity issue

**Debug:**
1. Check n8n workflow logs
2. Verify webhook URL is correct
3. Test webhook manually:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhooks/video-status \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: your-secret" \
     -d '{
       "videoId": "test-video-id",
       "status": "completed",
       "videoUrl": "https://example.com/video.mp4",
       "thumbnailUrl": "https://example.com/thumb.jpg"
     }'
   ```

### Issue 5: Rate Limit Exceeded

**Logs:** "rate_limit_exceeded" in Resend response

**Fix:**
- Wait for rate limit to reset (usually 1 hour)
- Check Resend plan limits
- Upgrade Resend plan if needed
- Consider implementing rate limiting on app side

## Enhanced Logging (Added in 06-03)

**New logs to look for:**

1. **Webhook trigger:**
   ```
   Triggering video ready email: {
     videoId: '...',
     userId: '...',
     brandName: '...',
     hasVideoUrl: true,
     hasThumbnailUrl: true
   }
   ```

2. **Email function entry:**
   ```
   sendVideoReadyEmail called: {
     userId: '...',
     brandName: '...',
     hasVideoUrl: true,
     hasThumbnailUrl: true
   }
   ```

3. **Profile fetch success:**
   ```
   Profile fetched successfully: {
     userId: '...',
     email: 'user@example.com',
     hasFirstName: true
   }
   ```

4. **Enhanced error:**
   ```
   Failed to send video ready email: {
     videoId: '...',
     userId: '...',
     brandName: '...',
     error: 'Error message',
     stack: 'Stack trace...'
   }
   ```

## Testing Email Flow End-to-End

### Option 1: Create Test Video

1. Go to https://your-app.vercel.app/create-video
2. Upload a test logo
3. Submit the form
4. Wait for n8n workflow to complete (~10-15 min)
5. Check logs and Resend dashboard

### Option 2: Trigger Webhook Manually

```bash
# Get a real video ID from database
VIDEO_ID="your-video-id-here"
USER_ID="your-user-id-here"

# Trigger webhook
curl -X POST https://your-app.vercel.app/api/webhooks/video-status \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $N8N_WEBHOOK_SECRET" \
  -d "{
    \"videoId\": \"$VIDEO_ID\",
    \"status\": \"completed\",
    \"videoUrl\": \"https://example.com/video.mp4\",
    \"thumbnailUrl\": \"https://example.com/thumb.jpg\"
  }"

# Check Vercel logs immediately after
vercel logs --since 5m | grep "video-ready"
```

### Option 3: Call Email Function Directly

Create a temporary API route for testing:

```typescript
// app/api/test-email/route.ts
import { NextResponse } from 'next/server'
import { sendVideoReadyEmail } from '@/lib/email/send'

export async function POST(request: Request) {
  const { userId, email } = await request.json()

  try {
    await sendVideoReadyEmail(
      userId,
      'https://example.com/test-video.mp4',
      'Test Brand',
      'https://example.com/test-thumb.jpg'
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

```bash
# Test it
curl -X POST https://your-app.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "email": "test@example.com"}'
```

## Checklist for User Report

When user reports missing email:

- [ ] Get user email address
- [ ] Get approximate time of video creation
- [ ] Check Vercel logs for that timeframe
- [ ] Check Resend dashboard for email attempts
- [ ] Verify RESEND_API_KEY is set in production
- [ ] Verify domain is verified in Resend
- [ ] Check user profile exists in database
- [ ] Check video status is "completed" in database
- [ ] Check spam folder (ask user)
- [ ] Verify email address is correct in profile

## Next Steps After Diagnosis

**If email was never sent:**
→ Check webhook logs and n8n workflow

**If email was sent but not received:**
→ Check Resend dashboard for bounce/spam issues

**If environment issue:**
→ Fix env vars and redeploy

**If user profile issue:**
→ Manually create/fix profile in database

**If systematic issue:**
→ Review code changes and rollback if needed

## Support Links

- **Vercel Logs:** `vercel logs` or https://vercel.com/your-project/logs
- **Resend Dashboard:** https://resend.com/emails
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Full Troubleshooting:** `.planning/EMAIL_TROUBLESHOOTING.md`
- **Configuration Guide:** `.planning/SUPABASE_EMAIL_CONFIG.md`
