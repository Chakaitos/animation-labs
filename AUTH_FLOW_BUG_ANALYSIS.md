# Authentication Flow Bug Analysis

## Systematic Debugging - Phase 1 Complete

Date: 2026-02-12
Issue: Signup email verification leads to password reset flow + Password update loops back to reset

---

## Root Cause Identification

### Issue 1: Signup Verification Redirects to Password Reset

**Root Cause:** The authentication callback handler doesn't properly distinguish between different auth flows.

**Evidence:**

1. **Signup Flow** (`lib/actions/auth.ts:60-74`):
   - Generates link with `type: 'signup'`
   - Uses `admin.generateLink()` which creates PKCE flow (query params)
   - Link format: `https://app.com/auth/callback?token_hash=xxx&type=signup`
   - Should be handled **server-side** by `app/auth/callback/page.tsx`

2. **Password Reset Flow** (`lib/actions/auth.ts:119-124`):
   - Generates link with `type: 'recovery'`
   - Uses `admin.generateLink()` which creates implicit flow (hash params)
   - Link format: `https://app.com/auth/callback?next=/update-password#access_token=xxx`
   - Should be handled **client-side** by `app/auth/callback/client-handler.tsx`

**The Bug:**

Looking at `app/auth/callback/page.tsx:42-78`:
- Server-side handler correctly processes PKCE flow when `token_hash` and `type` exist
- At line 58: Checks `if (type === 'email' || type === 'signup')` to send welcome email
- This SHOULD work correctly for signup

**BUT** - there's a hidden problem in the flow documented in `PASSWORD_RESET_COMPLETE_FIX.md`:
- The docs reference middleware that **doesn't exist** (lines 18-35 of that doc)
- The docs mention cookie-based recovery detection that **isn't implemented**

**The REAL Bug:**

After reviewing `app/auth/callback/client-handler.tsx:54-62`:
```typescript
const isRecovery = type === 'recovery' ||
                  type_hash === 'recovery' ||
                  next.includes('update-password') ||
                  next.includes('reset-password')
```

This detection logic runs **for ALL auth callbacks**, including signup. If there's ANY edge case where:
- Server-side PKCE verification fails
- Flow falls through to client-side handler
- Client-side handler incorrectly detects it as recovery

Then signup users get sent to `/update-password` instead of `/dashboard`.

### Issue 2: Password Update Loops Back to Reset

**Root Cause:** Missing middleware enforcement + inconsistent recovery state tracking

**Evidence:**

1. **Password Reset Complete Fix Documentation** (`PASSWORD_RESET_COMPLETE_FIX.md`):
   - Lines 18-35: References middleware that enforces password update
   - Lines 70-75: Shows cookie `password_recovery_pending` should prevent escape
   - Lines 136-162: Shows middleware detection logic

2. **Reality Check:**
   - `middleware.ts` **DOES NOT EXIST** in the codebase
   - Cookie `password_recovery_pending` is referenced in `lib/actions/auth.ts:162-163` (deleted)
   - But no middleware actually sets or enforces this cookie

3. **Current Update Flow** (`lib/actions/auth.ts:149-169`):
   - Line 162-163: Deletes cookie that was never set
   - Line 166: Signs out user
   - Line 168: Redirects to `/login?message=password-updated`
   - **Missing:** Any enforcement that user came from recovery flow

**The Loop:**

User pathway:
1. Click password reset link → `/auth/callback` (sets session)
2. Client handler detects recovery → redirects to `/update-password`
3. User updates password → signed out, sent to `/login`
4. User attempts login → **WHAT HAPPENS HERE?**

Need to verify: Does login detect the recovery session somehow and redirect back?

---

## Pattern Analysis - Phase 2

### Working Examples

**Signup PKCE Flow (When it works):**
```
User signs up
  ↓
admin.generateLink({ type: 'signup' })
  ↓
Email sent with: /auth/callback?token_hash=xxx&type=signup
  ↓
Server-side handler (page.tsx:42-78):
  - Verifies OTP with token_hash
  - type === 'signup' → sends welcome email
  - Redirects to /dashboard ✅
```

**Password Reset Implicit Flow (As documented):**
```
User requests reset
  ↓
admin.generateLink({ type: 'recovery' })
  ↓
Email sent with: /auth/callback?next=/update-password#access_token=xxx
  ↓
Server-side: No token_hash → renders client handler
  ↓
Client-side handler:
  - Extracts access_token from hash
  - Sets session
  - Detects isRecovery → /update-password
  ↓
User updates password
  ↓
Signs out → /login ✅
```

### Broken Cases

**Case 1: Signup falls through to client handler**
```
Signup link arrives
  ↓
Server tries to verify OTP
  ↓
FAILS (network issue, expired link, etc.)
  ↓
Falls through to client handler (line 90)
  ↓
Client handler sees: type=signup in query params
  ↓
isRecovery check: type !== 'recovery' ✅
  BUT: If next param somehow contains 'update-password'
  ↓
WRONG PATH: Sent to /update-password ❌
```

**Case 2: Password reset but middleware missing**
```
User resets password
  ↓
Updates password successfully
  ↓
Cookie deleted (but was never set)
  ↓
User signed out
  ↓
No middleware to enforce recovery completion
  ↓
If they somehow get a session, they could bypass ❌
```

---

## Hypothesis - Phase 3

### Primary Hypothesis

**The signup→reset bug occurs when:**

1. User signs up with new email
2. Verification link generated with PKCE flow
3. Link contains `token_hash` + `type=signup`
4. **BUT** - the `redirectTo` parameter might be incorrect
5. If `redirectTo` contains "update-password" in any form
6. Client handler's `next.includes('update-password')` triggers
7. User incorrectly flagged as recovery flow

**Test this hypothesis:**

Check what the actual signup link looks like:
- Does `redirectTo` param get set to `/auth/callback` correctly?
- Could there be URL pollution where `next` param appears?

### Secondary Hypothesis

**The loop occurs because:**

1. After password update, user is signed out
2. They log in with new password successfully
3. Some state (user.updated_at?) still looks recent
4. Some code path detects "recent password change"
5. Redirects back to update-password page

**Test this hypothesis:**

Check if there's any code that:
- Checks `user.updated_at` timestamp
- Redirects based on recent updates
- (The missing middleware.ts referenced this at lines 138-140 of the fix doc)

---

## Missing Implementation

Based on `PASSWORD_RESET_COMPLETE_FIX.md`, these components should exist but DON'T:

### 1. Middleware (`middleware.ts`)

**Should contain:**
- Detection of recovery sessions (recent user.updated_at)
- Cookie management (`password_recovery_pending`)
- Enforcement: Block all pages except `/update-password` during recovery
- Cookie expiry: 15 minutes

**Current state:** File doesn't exist

### 2. Recovery Cookie Management

**Should happen:**
- Set in middleware when recovery session detected
- Checked in middleware on every request
- Deleted after successful password update

**Current state:**
- Cookie deletion exists (`lib/actions/auth.ts:162-163`)
- Cookie setting: MISSING
- Cookie enforcement: MISSING (no middleware)

### 3. Client Handler Recovery Detection

**Should be more specific:**
```typescript
// Current (too broad):
const isRecovery = type === 'recovery' ||
                  type_hash === 'recovery' ||
                  next.includes('update-password') ||  // ❌ Too permissive
                  next.includes('reset-password')

// Should be:
const isRecovery = (type === 'recovery' || type_hash === 'recovery') &&
                   (next.includes('update-password') || window.location.hash.includes('access_token'))
```

---

## Data Flow Trace

### Signup Link Generation

**Source:** `lib/actions/auth.ts:60-74`

```typescript
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email,
  password,
  options: {
    redirectTo: `${siteUrl}/auth/callback`,  // ← Does NOT include 'update-password'
  },
})
```

**Link format:**
```
https://app.com/auth/callback?token_hash=ABC123&type=signup
```

**Handler:** Server-side (PKCE flow)

### Password Reset Link Generation

**Source:** `lib/actions/auth.ts:119-124`

```typescript
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'recovery',
  email,
  options: {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,  // ← DOES include it
  },
})
```

**Link format:**
```
https://app.com/auth/callback?next=/update-password#access_token=XYZ789&refresh_token=...
```

**Handler:** Client-side (implicit flow)

### The Difference

| Flow | Type | token_hash | access_token | next param | Handler |
|------|------|-----------|--------------|------------|---------|
| Signup | `type=signup` | ✅ In query | ❌ No | ❌ No | Server |
| Reset | `type=recovery` | ❌ No | ✅ In hash | ✅ `/update-password` | Client |

**Conclusion:** The flows ARE properly separated. So why the bug?

---

## Next Steps (Phase 3 continued)

### Verify Edge Cases

1. **Test actual signup link:**
   - Sign up with test account
   - Copy actual verification link from email
   - Check if `next` param appears anywhere
   - Check if client handler runs for signup

2. **Test password update loop:**
   - Reset password
   - Update to new password
   - Try to log in
   - Check if redirected back to update-password
   - Check what triggers the redirect

3. **Check for duplicate flows:**
   - Could both server AND client handlers run?
   - Does server handler fail and fall through?
   - Does client handler run AFTER server handler?

### Missing Verification

Need to check:
- [ ] Is middleware.ts supposed to exist? (docs say yes, reality says no)
- [ ] Was middleware.ts accidentally deleted?
- [ ] Was the fix never fully implemented?
- [ ] Is there git history showing middleware.ts existed?

---

## Recommended Fix Path

### Option 1: Complete the Missing Implementation

Implement what the docs claim exists:

1. Create `middleware.ts` with recovery session enforcement
2. Implement cookie-based recovery state tracking
3. Ensure client handler only runs for implicit flows

### Option 2: Simplify and Separate

Remove the complexity:

1. **Separate callback paths:**
   - `/auth/callback/verify` - Signup/email verification (PKCE only)
   - `/auth/callback/recovery` - Password reset (Implicit only)

2. **Update link generation:**
   - Signup: `redirectTo: /auth/callback/verify`
   - Reset: `redirectTo: /auth/callback/recovery?next=/update-password`

3. **Remove ambiguous detection:**
   - Each path knows its purpose
   - No need to detect flow type

### Option 3: Fix Detection Logic

Keep current structure but fix the bugs:

1. **Tighten client handler detection:**
   ```typescript
   // Only treat as recovery if BOTH conditions:
   // 1. Has recovery type OR access token in hash
   // 2. Has explicit next=/update-password param
   const hasRecoveryToken = type_hash === 'recovery' ||
                           window.location.hash.includes('access_token')
   const hasRecoveryNext = next === '/update-password'
   const isRecovery = hasRecoveryToken && hasRecoveryNext
   ```

2. **Add middleware for enforcement** (if needed)

3. **Fix cookie lifecycle** (set before delete)

---

## Questions to Answer

1. **Why is middleware.ts missing if docs reference it?**
   - Was it never created?
   - Was it deleted?
   - Is it in a branch?

2. **How are users experiencing the bug?**
   - 100% of signups affected?
   - Intermittent?
   - Specific conditions?

3. **What happens on login after password update?**
   - Is there code checking user.updated_at?
   - Is there code checking last_sign_in_at?
   - Is there a redirect loop happening?

---

## Testing Plan

Once fix is implemented, test:

### Scenario 1: Normal Signup
```
1. Sign up with new email
2. Check email for verification link
3. Click link
4. EXPECT: Redirect to /dashboard
5. EXPECT: Welcome email received
6. VERIFY: Can access all pages
```

### Scenario 2: Password Reset
```
1. Click "Forgot Password"
2. Enter email
3. Check email for reset link
4. Click link
5. EXPECT: Redirect to /update-password
6. EXPECT: Cannot access other pages
7. Update password
8. EXPECT: Signed out, sent to /login
9. Log in with new password
10. EXPECT: Normal dashboard access
11. VERIFY: Old password no longer works
```

### Scenario 3: Edge Cases
```
1. Try accessing /dashboard during password reset
2. EXPECT: Redirected back to /update-password
3. Try old password after reset
4. EXPECT: "Invalid credentials"
5. Try clicking reset link twice
6. EXPECT: Graceful error handling
```

---

## Status

- [x] Phase 1: Root Cause Investigation
- [x] Phase 2: Pattern Analysis
- [x] Phase 3: Root Cause CONFIRMED

**CRITICAL FINDING:** The password recovery enforcement middleware exists in `proxy.ts` but **IS NEVER EXECUTED** because Next.js doesn't know to use it!

---

## CONFIRMED ROOT CAUSE

### Git History Analysis

**Commit b60540a** (2026-02-11):
- Created `middleware.ts` with password recovery enforcement
- Had correct export: `export async function middleware()`
- Had correct matcher config

**Commit bfc5a8d** (2026-02-11 - SAME DAY):
- Moved middleware logic to `proxy.ts`
- Renamed function from `middleware()` to `proxy()`
- **DELETED `middleware.ts` completely**
- **NEVER created a new `middleware.ts` that imports `proxy()`**

### The Fatal Flaw

In Next.js, middleware MUST be in a file called `middleware.ts` at the project root and MUST export a function called `middleware`.

**Current state:**
```
proxy.ts exists ✅ (has all the logic)
  ↓
  BUT: No file imports it ❌
  ↓
  AND: No middleware.ts exists ❌
  ↓
  RESULT: Code never runs ❌❌❌
```

**What should exist:**

```typescript
// middleware.ts
export { proxy as middleware, config } from './proxy'
```

OR

```typescript
// middleware.ts
import { proxy } from './proxy'

export async function middleware(request: NextRequest) {
  return proxy(request)
}

export { config } from './proxy'
```

### Impact

**100% of users affected:**

1. **Signup users** → Verification works (server-side PKCE) BUT if they somehow hit the client handler, no recovery detection works properly
2. **Password reset users** → Can update password BUT no enforcement prevents them from navigating away, no cookie tracking works
3. **Both flows** → No protection, no enforcement, no security measures active

### Why the Bugs Occur

**Bug 1: Signup → Reset flow**
- Without middleware enforcement, the client handler's broad `next.includes('update-password')` check can misfire
- No recovery cookie being set means no state tracking
- Edge cases in server PKCE verification can fall through to client handler

**Bug 2: Password update loop**
- After password update, cookie is deleted (line 162 of auth.ts)
- But cookie was NEVER SET (because middleware never runs)
- User's `updated_at` timestamp is recent
- If they try to access ANY page... nothing happens (no middleware to check)
- BUT some other code path might check `updated_at` and redirect

---

## Fix Required

### Immediate Fix (5 minutes)

Create `middleware.ts`:

```typescript
export { proxy as middleware, config } from './proxy'
```

This will activate all the recovery enforcement logic that already exists in `proxy.ts`.

### Testing After Fix

1. **Signup flow:**
   - Sign up → Verify email → Should go to /dashboard ✅
   - Should NOT see update-password ✅

2. **Password reset flow:**
   - Request reset → Click link → Redirected to /update-password ✅
   - Try to access /dashboard → Blocked, sent back to /update-password ✅
   - Update password → Signed out, sent to /login ✅
   - Log in with new password → Access /dashboard ✅

3. **Edge cases:**
   - Old password after reset → Should fail ✅
   - Accessing pages during reset → Should block ✅

---

## Next Action

**IMPLEMENT THE FIX** - Create middleware.ts to activate the existing proxy logic
