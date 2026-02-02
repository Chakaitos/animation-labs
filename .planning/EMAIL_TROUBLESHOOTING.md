# Email Troubleshooting Guide

## Overview

AnimateLabs uses Resend for transactional emails. This guide helps debug email delivery issues.

## Common Issues Checklist

### 1. Environment Variables Missing

**Symptom:** "RESEND_API_KEY environment variable is not set" error in logs

**Check:**
```bash
# Local development
cat .env.local | grep RESEND_API_KEY

# Vercel production
vercel env ls
# Or check Vercel Dashboard -> Settings -> Environment Variables
```

**Fix:**
- Local: Add `RESEND_API_KEY=re_...` to `.env.local`
- Vercel: `vercel env add RESEND_API_KEY` or add via dashboard
- **Important:** After adding env vars in Vercel, redeploy the project

### 2. Domain Not Verified in Resend

**Symptom:** Email fails with "domain_not_verified" error

**Check:**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Verify `animationlabs.ai` domain is verified (green checkmark)
3. Check DNS records are properly configured

**Fix:**
- Add required DNS records (SPF, DKIM, DMARC)
- Wait for verification (can take up to 48 hours)
- Until verified, use Resend's test domain (`onboarding@resend.dev`)

### 3. Video Completion Email Not Sent

**Symptom:** Video completed in production but no email received

**Diagnostic Steps:**

1. **Check webhook was called:**
   ```bash
   # View Vercel logs
   vercel logs --since 24h | grep "video-status"
   ```
   Look for: "Video status update" or "Already processed"

2. **Check email function was triggered:**
   ```bash
   vercel logs --since 24h | grep "video-ready"
   ```
   Look for:
   - "Video ready email sent successfully" = ✅ Email sent
   - "Failed to send video ready email" = ❌ Email failed
   - Nothing = 🚨 Email function not called

3. **Check Resend dashboard:**
   - Go to [Resend Emails](https://resend.com/emails)
   - Filter by recipient email
   - Check status: Sent / Bounced / Failed

**Common Causes:**

| Issue | Symptoms | Fix |
|-------|----------|-----|
| Webhook never called | No logs at all | Check n8n workflow sends status webhook |
| Email silently fails | No logs about email | Error swallowed - check webhook code |
| User profile not found | "User profile not found" error | Profile creation issue during signup |
| Invalid recipient email | "invalid_email" error | Check user's email in `profiles` table |
| Rate limit exceeded | "rate_limit_exceeded" error | Wait or upgrade Resend plan |

### 4. Verification/Password Reset Emails

**Symptom:** User doesn't receive verification or password reset emails

**Current Limitation:**
These emails are sent by **Supabase**, not our custom templates (yet).

**Check Supabase Configuration:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Verify SMTP is configured OR using Supabase's default email service
3. Check "Enable Email Confirmations" is ON

**For custom templates:** See `SUPABASE_EMAIL_CONFIG.md`

### 5. Emails Going to Spam

**Symptom:** Emails delivered but in spam folder

**Fixes:**
1. **Verify domain** - See issue #2 above
2. **Add DMARC record** - Improves deliverability
3. **Warm up domain** - Send gradually increasing volume
4. **Check content** - Avoid spam trigger words
5. **Use consistent sender** - Don't change "From" address frequently

### 6. Development Testing

**Test emails locally:**

```bash
# 1. Start email preview server
npm run email:dev

# 2. Open http://localhost:3000
# 3. Navigate to email template
# 4. Verify design and content
```

**Send test email:**
```typescript
// In any Server Action or API route
import { sendVideoReadyEmail } from '@/lib/email/send'

await sendVideoReadyEmail(
  'user-id-here',
  'https://example.com/video.mp4',
  'Test Brand',
  'https://example.com/thumb.jpg'
)
```

## Logging Deep Dive

### Where to Find Logs

**Local Development:**
- Console output in terminal where `npm run dev` is running
- Look for logs prefixed with email type: `video-ready`, `payment-failed`, etc.

**Production (Vercel):**
```bash
# View recent logs
vercel logs

# Filter by function
vercel logs --since 24h | grep "video-status"

# Follow real-time
vercel logs --follow
```

**Resend Dashboard:**
- [Resend Emails](https://resend.com/emails) - All sent emails
- [Resend Logs](https://resend.com/logs) - API request logs

### Log Patterns

**Successful email flow:**
```
Video status update: completed for video-id-123
Video ready email sent successfully: { emailType: 'video-ready', userId: '...', emailId: '...' }
```

**Failed email flow:**
```
Failed to send video ready email: Error: domain_not_verified
```

**Swallowed error flow (bad):**
```
Video status update: completed for video-id-123
# Nothing else - error caught but not logged
```

## Verification Checklist

Use this checklist when debugging email issues:

- [ ] `RESEND_API_KEY` set in environment (Vercel or `.env.local`)
- [ ] Domain verified in Resend dashboard
- [ ] DNS records (SPF, DKIM, DMARC) configured
- [ ] Webhook endpoint receiving status updates from n8n
- [ ] User profile exists with valid email address
- [ ] Email sent log appears in Vercel logs
- [ ] Email appears in Resend dashboard
- [ ] Email received (check spam folder)
- [ ] Email template renders correctly

## Quick Debug Script

Add this to any Server Action to test email delivery:

```typescript
'use server'

import { sendVideoReadyEmail } from '@/lib/email/send'
import { createClient } from '@/lib/supabase/server'

export async function testVideoEmail() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  try {
    await sendVideoReadyEmail(
      user.id,
      'https://example.com/test-video.mp4',
      'Test Brand',
      'https://example.com/test-thumb.jpg'
    )
    console.log('✅ Test email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Test email failed:', error)
    return { success: false, error }
  }
}
```

## Support Resources

- **Resend Docs:** https://resend.com/docs
- **Resend Status:** https://status.resend.com
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Vercel Logs:** https://vercel.com/docs/observability/logs

## Next Steps

If none of these steps resolve the issue:

1. Check Resend status page for outages
2. Review Resend dashboard for detailed error messages
3. Enable debug logging in webhook and email functions
4. Contact Resend support with email ID from logs
