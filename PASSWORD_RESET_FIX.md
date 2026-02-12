# Password Reset Fix - Implicit Flow Support

## Issue Fixed

Password reset was failing with "Authentication Error - missing params" because:

1. **Problem**: Supabase sends password reset links using **implicit flow**
2. **Implicit flow**: Returns `access_token` in URL **hash** (`#access_token=...`)
3. **Server can't see hash**: URL fragments (#) are not sent to the server
4. **Old code**: Only handled PKCE flow (query params like `?token_hash=...`)

## Solution Implemented

Created a **hybrid callback handler** that supports both flows:

### Server-Side (PKCE Flow)
- Handles signup verification: `?token_hash=xxx&type=signup`
- Processes query parameters
- Works for email verification

### Client-Side (Implicit Flow)
- Handles password reset: `#access_token=xxx&refresh_token=xxx`
- Processes hash parameters (only visible to browser)
- Works for password reset links

## Files Changed

### 1. `/app/auth/callback/page.tsx` (New)
- Server Component that handles PKCE flow
- Renders loading state for client-side processing
- Replaces the old route.ts approach

### 2. `/app/auth/callback/client-handler.tsx` (New)
- Client Component that processes hash tokens
- Sets session using `setSession()`
- Redirects to intended destination

### 3. `/app/api/hooks/send-email/route.ts` (Fixed)
- Removed incorrect `'use server'` directive
- Better error logging
- Proper authentication validation

## How It Works Now

### Password Reset Flow
```
1. User requests password reset
2. Custom email sent with reset link
3. Link format: https://yourapp.com/auth/callback?next=/update-password#access_token=xxx
4. Browser loads /auth/callback page
5. Server Component: No token_hash → renders loading page
6. Client Component: Extracts access_token from hash
7. Sets session with tokens
8. Redirects to /update-password
9. User sets new password
```

### Signup Verification Flow
```
1. User signs up
2. Custom email sent with verification link
3. Link format: https://yourapp.com/auth/callback?token_hash=xxx&type=signup
4. Browser loads /auth/callback page
5. Server Component: Has token_hash → verifies OTP
6. Sends welcome email
7. Redirects to /dashboard
```

## Deployment

```bash
# Commit the changes
git add .
git commit -m "fix: support implicit flow for password reset"
git push origin main
```

## Testing

### Test Password Reset:
1. Go to forgot password page
2. Enter your email
3. Check email inbox
4. Click "Reset Password" link
5. **Expected**: Redirects to /update-password page ✅
6. Set new password
7. **Expected**: Redirects to login ✅

### Test Signup:
1. Sign up with new email
2. Check email inbox
3. Click verification link
4. **Expected**: Redirects to /dashboard ✅
5. Receive welcome email ✅

## Why This Happened

Supabase's `admin.generateLink()` can generate two types of links:

| Link Type | URL Format | Use Case | Handler |
|-----------|-----------|----------|---------|
| **PKCE** | `?token_hash=xxx&type=signup` | Email verification, magic links | Server-side |
| **Implicit** | `#access_token=xxx` | Password reset, OAuth | Client-side |

Our old code only handled PKCE flow, so password reset (implicit) failed.

## Technical Details

### Why Hash Parameters Are Client-Only

```
URL: https://example.com/callback?query=1#hash=2

Server receives: https://example.com/callback?query=1
Client sees:     https://example.com/callback?query=1#hash=2
                                                      ^
                                                      |
                                    Hash part (#) never sent to server
```

### Server Component vs Client Component

```typescript
// Server Component (page.tsx)
// - Can access searchParams (query)
// - Cannot access hash
// - Runs on server
export default async function Page({ searchParams }) {
  const token_hash = searchParams.token_hash // ✅ Works
  const access_token = searchParams.access_token // ❌ Not in hash
}

// Client Component (client-handler.tsx)
// - Cannot access searchParams
// - CAN access window.location.hash
// - Runs in browser
'use client'
export function Handler() {
  const hash = window.location.hash // ✅ Can see #access_token
}
```

## Troubleshooting

### If password reset still fails:

**Check browser console:**
```javascript
// Should see:
"Client: Processing implicit flow tokens from hash"
"Client: Session set successfully, redirecting to: /update-password"
```

**Check server logs:**
```bash
vercel logs | grep "Auth callback"

# Should see:
"Server: No auth data, rendering client-side handler"
```

### If you see "missing params" error:

1. **Check the email link**: Should contain `#access_token=`
2. **Check JavaScript is enabled**: Client component needs JS
3. **Check browser console** for errors
4. **Verify Supabase client is configured** in `lib/supabase/client.ts`

## Next Steps

After successful deployment:

- [ ] Test password reset end-to-end
- [ ] Test signup verification end-to-end
- [ ] Verify both flows work correctly
- [ ] Check that only ONE email is sent for each action
- [ ] Monitor logs for any errors

## Rollback

If issues persist:

1. Restore the old route.ts:
   ```bash
   git revert HEAD
   ```

2. Debug with detailed logging:
   - Check what parameters the reset link contains
   - Check if client-side handler is running
   - Check if setSession succeeds

## Related Files

- `app/auth/callback/page.tsx` - Main callback handler (server)
- `app/auth/callback/client-handler.tsx` - Hash token processor (client)
- `lib/actions/auth.ts` - Password reset action
- `app/(auth)/update-password/page.tsx` - Password update form
