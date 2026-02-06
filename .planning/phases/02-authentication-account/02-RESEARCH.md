# Phase 2: Authentication & Account - Research

**Researched:** 2026-01-27
**Domain:** Supabase Auth with Next.js App Router
**Confidence:** HIGH

## Summary

This phase implements user authentication using Supabase Auth with the `@supabase/ssr` package, which is already installed and configured in the project. The existing setup includes browser and server Supabase clients plus a proxy.ts file for session refresh. The project uses email/password authentication with email verification required before access, password reset via email link, and account settings for password changes.

The standard approach follows Supabase's PKCE flow for SSR applications, using `token_hash` verification via a callback endpoint instead of direct confirmation URLs. Forms use shadcn/ui with react-hook-form and zod for validation. Toast notifications use the sonner library (shadcn/ui's recommended toast solution) for validation feedback.

**Primary recommendation:** Leverage existing Supabase client setup, add react-hook-form + zod for forms, use sonner for toast notifications, and create Server Actions for all auth operations.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.8.0 | Server-side auth with cookies | Official Supabase SSR package, successor to deprecated auth-helpers |
| @supabase/supabase-js | ^2.93.1 | Supabase client library | Core Supabase SDK |
| Next.js | 16.1.5 | Framework | App Router with Server Actions |

### To Install
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.54.x | Form state management | All authentication forms |
| zod | ^3.24.x | Schema validation | Form validation, type inference |
| @hookform/resolvers | ^3.9.x | Connect zod to react-hook-form | Form setup with zodResolver |
| sonner | (via shadcn) | Toast notifications | Validation errors, success messages |

### shadcn/ui Components Needed
| Component | Purpose |
|-----------|---------|
| form | Form field wrappers (FormField, FormItem, FormControl, FormMessage) |
| input | Text/password inputs |
| label | Form labels |
| sonner | Toast notification system |
| dropdown-menu | User menu in navigation |
| avatar | User avatar in nav dropdown |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | formik | react-hook-form is lighter, better performance, shadcn/ui native |
| zod | yup | zod has better TypeScript inference, shadcn/ui examples use zod |
| sonner | react-hot-toast | sonner is shadcn/ui's official recommendation, more features |

**Installation:**
```bash
npm install react-hook-form zod @hookform/resolvers
npx shadcn@latest add form input label sonner dropdown-menu avatar
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (auth)/                    # Auth route group (no layout nesting)
│   ├── login/
│   │   └── page.tsx          # Login form page
│   ├── signup/
│   │   └── page.tsx          # Signup form page
│   ├── verify-email/
│   │   └── page.tsx          # "Check your email" page
│   ├── reset-password/
│   │   └── page.tsx          # Request password reset
│   └── update-password/
│       └── page.tsx          # Set new password (after reset link)
├── auth/
│   └── confirm/
│       └── route.ts          # Email verification callback endpoint
├── (protected)/              # Protected route group
│   └── account/
│       └── settings/
│           └── page.tsx      # Account settings page
├── layout.tsx                # Root layout with Toaster
└── page.tsx                  # Home page

components/
├── auth/
│   ├── login-form.tsx        # Login form component
│   ├── signup-form.tsx       # Signup form component
│   ├── reset-password-form.tsx
│   ├── update-password-form.tsx
│   └── change-password-form.tsx
├── navigation/
│   └── user-menu.tsx         # User dropdown menu
└── ui/                       # shadcn/ui components

lib/
├── supabase/
│   ├── client.ts             # Browser client (exists)
│   └── server.ts             # Server client (exists)
├── validations/
│   └── auth.ts               # Zod schemas for auth forms
└── actions/
    └── auth.ts               # Server Actions for auth
```

### Pattern 1: Server Actions for Auth Operations
**What:** All authentication operations (signup, login, logout, password reset) use Next.js Server Actions
**When to use:** Every auth operation that communicates with Supabase
**Example:**
```typescript
// Source: Supabase docs + Next.js Server Actions pattern
// lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/verify-email')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Pattern 2: Email Verification Callback Endpoint
**What:** Route handler that exchanges token_hash for session using verifyOtp
**When to use:** Email confirmation links (signup, password reset)
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// app/auth/confirm/route.ts
import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  // Prevent open redirect attacks
  const redirectTo = next.startsWith('/') ? next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Return to error page on failure
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
```

### Pattern 3: Form with react-hook-form + zod
**What:** Client component form with validation and toast feedback
**When to use:** All authentication forms
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
// components/auth/login-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await signIn(formData)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </Form>
  )
}
```

### Pattern 4: Protected Routes with getUser()
**What:** Server Component that verifies session using getUser()
**When to use:** Any page requiring authentication
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// app/(protected)/account/settings/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AccountSettingsPage() {
  const supabase = await createClient()

  // IMPORTANT: Always use getUser(), never getSession() on server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Account Settings</h1>
      <p>Email: {user.email}</p>
      {/* Password change form component */}
    </div>
  )
}
```

### Pattern 5: Password Change with Global Sign Out
**What:** Change password and sign out all devices
**When to use:** Account settings password change (per user decision)
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-updateuser
// lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  const newPassword = formData.get('newPassword') as string

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  // Sign out all sessions (global scope is default)
  // This forces re-login on all devices
  await supabase.auth.signOut()

  redirect('/login?message=password-changed')
}
```

### Anti-Patterns to Avoid
- **Using getSession() on server:** Never trust getSession() in Server Components or Server Actions. It doesn't revalidate the token. Always use getUser() which validates with Supabase Auth server.
- **Mixing client types:** Never import browser client in Server Components or server client in Client Components. Causes hydration errors.
- **Direct confirmation URLs in emails:** For SSR, use token_hash approach with verifyOtp, not direct ConfirmationURL.
- **Revealing email existence on reset:** Always show "If an account exists, we've sent an email" to prevent enumeration.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom cookie handling | @supabase/ssr + proxy.ts | Token refresh, cookie security, SSR support |
| Password hashing | bcrypt/argon2 | Supabase Auth | Handles all password security server-side |
| Email sending | Custom SMTP | Supabase Auth emails | Templates, rate limiting, deliverability |
| Token generation | UUID/crypto | Supabase Auth | Secure token_hash, proper expiry |
| Form validation | Manual if/else | zod + react-hook-form | Type inference, declarative, consistent |
| Toast UI | Custom div | sonner | Accessibility, animations, queuing |
| Password strength | Regex patterns | zod .min() + UI feedback | Consistent, type-safe |

**Key insight:** Supabase Auth handles all the cryptographic complexity (password hashing, token generation, secure session management). The only auth code you write is API calls and UI.

## Common Pitfalls

### Pitfall 1: Using getSession() Instead of getUser() on Server
**What goes wrong:** Session data can be tampered with on the client and isn't revalidated
**Why it happens:** getSession() is faster (no network call), developers assume it's equivalent
**How to avoid:** Always use `supabase.auth.getUser()` in Server Components, Server Actions, and Route Handlers
**Warning signs:** Authentication bypasses in security testing, stale user data

### Pitfall 2: Middleware Running on Every Request
**What goes wrong:** Performance degradation, 400 errors on prefetched links
**Why it happens:** Next.js prefetches links, middleware runs 9+ times per page load
**How to avoid:** Use a strict matcher in proxy.ts config that excludes static assets
**Warning signs:** Slow page loads, network tab showing many auth requests

### Pitfall 3: Wrong Redirect URL Configuration
**What goes wrong:** Email confirmation links fail, OAuth returns to wrong page
**Why it happens:** Redirect URLs not configured in Supabase dashboard, mismatch between environments
**How to avoid:** Add all allowed redirect URLs in Supabase Auth settings, use wildcards for dynamic paths
**Warning signs:** "Invalid redirect URL" errors, users stuck on verification

### Pitfall 4: Email Template Not Updated for SSR
**What goes wrong:** Email links use ConfirmationURL which doesn't work with PKCE flow
**Why it happens:** Default templates use implicit flow pattern
**How to avoid:** Update email templates to use token_hash: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
**Warning signs:** Email verification doesn't work, users can't confirm accounts

### Pitfall 5: Not Handling Unverified Users
**What goes wrong:** Users sign up but can't access app because email not verified
**Why it happens:** Default Supabase hosted projects require email verification
**How to avoid:** Create clear /verify-email page, handle case where user tries to sign in before verifying
**Warning signs:** Users complain they can't log in after signup

### Pitfall 6: Password Reset Security Leak
**What goes wrong:** Revealing whether email exists in system
**Why it happens:** Different responses for "email sent" vs "no account"
**How to avoid:** Always respond with generic message: "If an account exists, we've sent a reset email"
**Warning signs:** Security audit flags email enumeration vulnerability

## Code Examples

Verified patterns from official sources:

### Zod Validation Schemas
```typescript
// Source: zod documentation + shadcn/ui patterns
// lib/validations/auth.ts
import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
})
```

### Password Reset Request (Server Action)
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
// lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Note: resetPasswordForEmail doesn't error if email doesn't exist
  // This is good - prevents email enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  // Always return success message (per user decision)
  return { success: true }
}
```

### Update Password After Reset (Page + Action)
```typescript
// Source: https://supabase.com/docs/guides/auth/passwords
// app/(auth)/update-password/page.tsx
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-2xl font-bold text-center">Set New Password</h1>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}

// lib/actions/auth.ts
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=password-updated')
}
```

### User Menu Component
```typescript
// Source: shadcn/ui dropdown-menu + avatar patterns
// components/navigation/user-menu.tsx
'use client'

import { User } from '@supabase/supabase-js'
import { signOut } from '@/lib/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar>
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Adding Toaster to Root Layout
```typescript
// Source: https://ui.shadcn.com/docs/components/sonner
// app/layout.tsx
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Deprecated package, migrate to @supabase/ssr |
| middleware.ts | proxy.ts | Next.js 16 | New convention name, same functionality |
| ConfirmationURL in emails | token_hash + verifyOtp | PKCE flow | Required for SSR apps |
| getSession() for auth check | getUser() for auth check | Always | Security: getSession() not revalidated |
| toast from radix | sonner | 2024 | shadcn/ui deprecated original toast |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated, use `@supabase/ssr`
- `@supabase/auth-ui-react`: Pre-built UI components exist but custom is recommended for control
- Original shadcn/ui toast: Replaced by sonner integration

## Open Questions

Things that couldn't be fully resolved:

1. **Current password verification for password change**
   - What we know: updateUser() changes password without verifying current password
   - What's unclear: How to verify current password first (re-authentication)
   - Recommendation: Use signInWithPassword() to verify current password before allowing updateUser(), or use Supabase's reauthentication feature if available

2. **7-day session duration configuration**
   - What we know: Session duration is configurable in Supabase dashboard
   - What's unclear: Exact dashboard location for this setting
   - Recommendation: Configure in Supabase Dashboard > Authentication > Settings

3. **1-hour password reset link expiry**
   - What we know: Default Supabase OTP/link expiry is 24 hours
   - What's unclear: How to customize to 1 hour (per user decision)
   - Recommendation: Check Supabase Dashboard > Authentication > Email Templates settings, may require custom email provider

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR setup, client creation, middleware
- [Supabase Password-Based Auth](https://supabase.com/docs/guides/auth/passwords) - signUp, signIn, password reset flow
- [Supabase resetPasswordForEmail API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) - Password reset implementation
- [Supabase signOut API](https://supabase.com/docs/reference/javascript/auth-signout) - Sign out with scope options
- [Supabase verifyOtp API](https://supabase.com/docs/reference/javascript/auth-verifyotp) - Email verification callback
- [Supabase updateUser API](https://supabase.com/docs/reference/javascript/auth-updateuser) - Password change
- [Supabase Sessions](https://supabase.com/docs/guides/auth/sessions) - Session configuration, password change behavior
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form) - Form component patterns
- [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/sonner) - Toast notifications

### Secondary (MEDIUM confidence)
- [shadcn/ui react-hook-form](https://ui.shadcn.com/docs/forms/react-hook-form) - Form setup with zod
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Template customization
- [Supabase Troubleshooting Next.js Auth](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV) - Common issues

### Tertiary (LOW confidence)
- WebSearch results for best practices and common pitfalls - cross-referenced with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase and shadcn/ui documentation verified
- Architecture: HIGH - Based on official Supabase Next.js patterns and existing project setup
- Pitfalls: HIGH - From official troubleshooting docs and multiple verified sources

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - Supabase Auth is stable)

---

## CONTEXT.md Alignment

Per user decisions in `/Users/chakaitos/Animation Labs/.planning/phases/02-authentication-account/02-CONTEXT.md`:

| Decision | How Research Addresses It |
|----------|---------------------------|
| Email verification required before access | verifyOtp pattern with redirect to /verify-email page |
| Validation errors via toast notifications | sonner integration in all form components |
| 7-day session duration | Configurable in Supabase dashboard (noted in Open Questions) |
| Reset links expire after 1 hour | Requires Supabase configuration (noted in Open Questions) |
| Always show "Email sent" on reset | resetPasswordForEmail doesn't error on missing email, return success always |
| Email display only, no editing | Account settings page shows email as read-only |
| Force re-login on password change | signOut() after updateUser() with global scope |
| User menu in top-right corner | UserMenu component with dropdown pattern |

**Claude's Discretion items addressed:**
- Password requirements: Moderate strength (8 chars, uppercase, lowercase, number) - balanced security without frustration
- Post-signup: Redirect to /verify-email page with clear instructions
- Login redirect: Dashboard by default (simple, predictable)
- Failed login: Generic "Invalid credentials" message via toast (security + usability)
- Post-password-reset: Manual login with success message
- Invalid reset link: Redirect to /auth/error with message
- Account settings layout: Single page with sections (simple for v1)
