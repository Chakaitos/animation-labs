# Supabase Send Email Hook Authentication Issue

## What I'm Trying to Do

I'm trying to set up a Send Email Hook to intercept Supabase's authentication emails (signup verification, password reset) so I can send custom branded emails via Resend instead.

## Current Setup

### Supabase Dashboard Configuration
- **Hook Type:** Send Email Hook
- **Status:** ENABLED ✅
- **Endpoint:** `https://animationlabs.ai/api/hooks/send-email`
- **Secret:** Configured (32 character hex string generated with `openssl rand -hex 32`)
- **HTTP Headers:** None added (left empty as documentation says Supabase adds Authorization automatically)

### Environment Variables (Vercel)
```bash
SUPABASE_WEBHOOK_SECRET=<my-secret-here>  # Same value as in Supabase dashboard
```

### Webhook Endpoint Code (Next.js 15 API Route)
```typescript
// app/api/hooks/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET

  if (!authHeader) {
    console.error('Send Email Hook: No authorization header')
    return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
  }

  // Expecting: Authorization: Bearer <something>
  // But authHeader is undefined/null

  // ... rest of verification code
}
```

## The Problem

### Error in Logs
```
Send Email Hook: No authorization header
```

### What's Happening
1. User signs up on my app
2. Supabase calls my webhook: `POST https://animationlabs.ai/api/hooks/send-email`
3. My webhook receives the request but `request.headers.get('authorization')` returns `null`
4. Webhook returns 401 Unauthorized
5. Supabase shows error in logs
6. User sees error toast: "Hook requires authorization token"

### Verified Facts
✅ Webhook endpoint is reachable (receives POST requests)
✅ Secret is configured in both Supabase dashboard and Vercel
✅ Hook is ENABLED in dashboard
✅ No "Bearer" prefix in the secret field
✅ No custom HTTP headers added
✅ Secret matches exactly (no trailing spaces, newlines, etc.)

## What I've Tried

### Attempt 1: Simple String Comparison
```typescript
const expectedSecret = `Bearer ${webhookSecret}`
if (authHeader !== expectedSecret) {
  return 401
}
```
**Result:** Still getting "No authorization header" - authHeader is null

### Attempt 2: JWT Verification (thinking Supabase signs a JWT)
```typescript
import * as jose from 'jose'
const token = authHeader.replace('Bearer ', '')
await jose.jwtVerify(token, secret, { issuer: 'supabase' })
```
**Result:** Still getting "No authorization header" - authHeader is null before we even get to JWT verification

### Attempt 3: Log All Headers
```typescript
const headers: Record<string, string> = {}
request.headers.forEach((value, key) => {
  headers[key] = value
})
console.log('All headers:', headers)
```
**Result:** Need to test this, but based on error message, Authorization header is not present

## Questions for Supabase AI

1. **Does Supabase Send Email Hook actually send an Authorization header?**
   - Documentation says it does, but we're not receiving it
   - Is there a configuration step I'm missing?

2. **What is the exact format of the Authorization header?**
   - Is it `Authorization: Bearer <raw-secret>`?
   - Is it `Authorization: Bearer <jwt-signed-with-secret>`?
   - Is it some other format?

3. **Could this be a Supabase dashboard bug?**
   - The hook is enabled and configured
   - But the header isn't being sent
   - Is there a known issue with Send Email Hook?

4. **Is there a different way to authenticate the webhook?**
   - Should I check a different header?
   - Is there a request signature I should verify instead?
   - Should I use the hook secret differently?

5. **How can I debug this?**
   - Is there a way to see the exact HTTP request Supabase sends?
   - Can I test the hook from Supabase dashboard?
   - Are there logs in Supabase that show what's being sent?

6. **Is the secret field the right place for the webhook secret?**
   - Or should it go somewhere else?
   - Is there a specific format required (base64, hex, plain text)?

## Expected Behavior

According to Supabase documentation:
1. I configure a Send Email Hook with URL and secret
2. When Supabase wants to send an email, it POSTs to my webhook
3. Request includes `Authorization: Bearer <token>` header
4. I verify the token using my secret
5. I return 200 OK to suppress Supabase's email
6. I send my custom email instead

## Actual Behavior

1. ✅ Hook is configured
2. ✅ Supabase POSTs to my webhook
3. ❌ No Authorization header in request
4. ❌ Webhook returns 401 Unauthorized
5. ❌ Supabase shows error, user sees error message
6. ❌ Neither Supabase nor custom email is sent

## Additional Context

- **Framework:** Next.js 15 (App Router)
- **Hosting:** Vercel
- **Runtime:** Edge Runtime (Vercel Edge Functions)
- **Supabase Plan:** Pro (paid plan)
- **Hook Type:** Send Email Hook (not a custom Edge Function hook)
- **Working Directory:** Using Vercel's standard Next.js deployment

## What I Need

Help understanding:
1. Why the Authorization header is not being sent
2. What the correct configuration should be
3. How to properly authenticate Send Email Hook requests

Any guidance would be greatly appreciated! Thank you!
