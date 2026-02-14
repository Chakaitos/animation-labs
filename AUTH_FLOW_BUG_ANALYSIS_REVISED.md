# Authentication Flow Bug Analysis - REVISED

## Critical Update

Next.js 16 renamed `middleware.ts` → `proxy.ts` automatically. The proxy **IS running**, but has logic bugs.

---

## Bug 1: New Signups Redirected to Password Reset

### Root Cause

`proxy.ts` lines 43-47:
```typescript
const updatedAt = new Date(user.updated_at || user.created_at)
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
const isRecentlyUpdated = updatedAt > fiveMinutesAgo
```

**The Problem:** For NEW SIGNUPS:
1. User signs up → email verification link
2. Clicks verification → account created
3. `user.created_at` = NOW (just created)
4. `user.updated_at` = NOW (just created)
5. Proxy checks: `updatedAt > fiveMinutesAgo`? **YES!** ✅
6. Proxy thinks: "Recent update = password reset!" **WRONG!** ❌
7. Redirects to `/update-password` **BUG!** 🐛

**The Fix:** Exclude brand new accounts from recovery detection:

```typescript
const createdAt = new Date(user.created_at)
const updatedAt = new Date(user.updated_at)
const now = Date.now()
const fiveMinutesAgo = now - 5 * 60 * 1000
const oneMinuteAgo = now - 60 * 1000

// Only flag as recovery if:
// 1. Updated recently AND
// 2. Account is NOT brand new (created > 1 min ago)
const isRecentlyUpdated = updatedAt.getTime() > fiveMinutesAgo &&
                         createdAt.getTime() < oneMinuteAgo
```

---

## Bug 2: Password Update Loop

### Root Cause

**Timeline after password reset:**

1. User clicks reset link → `/auth/callback?next=/update-password`
2. Proxy runs: `isRecoveryCallback = true` → **SKIPS entire enforcement block** (line 42)
3. Client handler sets session, redirects to `/update-password`
4. User on `/update-password` page, **but cookie never set!**
5. User updates password → `user.updated_at` = NOW
6. User signed out, redirects to `/login`
7. User logs in with new password
8. Proxy runs again:
   - `isRecentlyUpdated = true` (updated 1 min ago)
   - `hasRecoveryMarker = false` (cookie was deleted, never set properly)
   - `needsPasswordUpdate = true` (line 52)
   - Redirects to `/update-password` **LOOP!** 🐛

**The Problem:** Cookie is never set during recovery callback because the enforcement block is skipped entirely (line 42).

**Secondary Problem:** Even after successful password update + login, the `isRecentlyUpdated` check still triggers because `updated_at` is recent.

### The Fix

**Part 1:** Set the recovery cookie DURING callback (even though we skip enforcement):

```typescript
const isRecoveryCallback = request.nextUrl.pathname === '/auth/callback' &&
                           request.nextUrl.searchParams.get('next')?.includes('update-password')

// Set recovery marker cookie when recovery callback is detected
if (isRecoveryCallback && user) {
  console.log('Proxy: Recovery callback detected, setting marker cookie')
  supabaseResponse.cookies.set('password_recovery_pending', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  })
}

// Enforce password update for non-callback pages
if (user && !isRecoveryCallback) {
  // ... enforcement logic (rely ONLY on cookie, not updated_at)
}
```

**Part 2:** Only rely on the cookie for enforcement, not `updated_at` timing:

```typescript
// Check if there's a recovery marker in cookies
const hasRecoveryMarker = request.cookies.has('password_recovery_pending')

// Enforce ONLY based on cookie, not timestamp
if (hasRecoveryMarker &&
    request.nextUrl.pathname !== '/update-password' &&
    !request.nextUrl.pathname.startsWith('/auth/') &&
    !request.nextUrl.pathname.startsWith('/api/') &&
    !request.nextUrl.pathname.startsWith('/_next/')) {

  console.log('Proxy: Redirecting to password update (recovery cookie found)')
  return NextResponse.redirect(new URL('/update-password', request.url))
}
```

This way:
- ✅ Cookie set during recovery callback
- ✅ User can't navigate away (cookie enforces it)
- ✅ After password update, cookie deleted, no loop
- ✅ New signups not affected (no cookie)

---

## Complete Fix

```typescript
// proxy.ts
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Password recovery enforcement
  if (user) {
    const isRecoveryCallback = request.nextUrl.pathname === '/auth/callback' &&
                               request.nextUrl.searchParams.get('next')?.includes('update-password')

    // Set recovery marker cookie when recovery callback is detected
    if (isRecoveryCallback) {
      console.log('Proxy: Recovery callback detected, setting marker cookie')
      supabaseResponse.cookies.set('password_recovery_pending', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
        path: '/',
      })
    }

    // Enforce password update for non-callback pages
    if (!isRecoveryCallback) {
      // Check if there's a recovery marker in cookies
      const hasRecoveryMarker = request.cookies.has('password_recovery_pending')

      // Enforce ONLY based on cookie (not timestamp)
      // This prevents false positives from new signups and post-update loops
      if (hasRecoveryMarker &&
          request.nextUrl.pathname !== '/update-password' &&
          !request.nextUrl.pathname.startsWith('/auth/') &&
          !request.nextUrl.pathname.startsWith('/api/') &&
          !request.nextUrl.pathname.startsWith('/_next/')) {

        console.log('Proxy: Redirecting to password update (recovery marker found)')
        return NextResponse.redirect(new URL('/update-password', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Key Changes

1. **Set cookie during recovery callback** (lines 36-43)
   - Runs even when skipping enforcement
   - Ensures cookie exists before user lands on `/update-password`

2. **Remove `isRecentlyUpdated` check** (simplified)
   - No longer check `user.updated_at` timestamp
   - Rely ONLY on cookie presence
   - Prevents new signup false positives
   - Prevents post-update loop

3. **Enforcement is cookie-only** (lines 50-58)
   - Simple, reliable state tracking
   - Cookie set → can't escape
   - Cookie deleted → free to navigate

## Testing Plan

### Test 1: Signup Flow
```
1. Sign up with new email
2. Check email, click verification link
3. EXPECT: Redirect to /dashboard ✅
4. EXPECT: NO redirect to /update-password ✅
5. VERIFY: Can access all pages ✅
```

### Test 2: Password Reset Flow
```
1. Request password reset
2. Click reset link in email
3. EXPECT: Redirect to /update-password ✅
4. Try to navigate to /dashboard
5. EXPECT: Redirected back to /update-password ✅
6. Update password
7. EXPECT: Signed out, sent to /login ✅
8. Log in with NEW password
9. EXPECT: Access /dashboard normally ✅
10. VERIFY: No loop back to /update-password ✅
```

### Test 3: Edge Cases
```
1. Try clicking reset link twice
2. Try old password after reset → Should fail
3. Try navigating during reset → Should block
4. Check cookie expires after 15 min
```
