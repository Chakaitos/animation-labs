# Phase 2: Authentication & Account - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

User registration, login, session management, and password handling. Users can create accounts, verify email, log in, log out, and reset forgotten passwords. Account settings allow viewing email and changing password. Subscription features and credit system are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Sign-up flow & validation
- Email verification required **before any access** — user must verify email before logging in
- Validation errors shown via **toast notifications** (floating messages)
- Password requirements: Claude's discretion
- Post-signup flow: Claude's discretion

### Login experience
- Session duration: **7 days** by default
- Remember me checkbox: Claude's discretion
- Login redirect destination: Claude's discretion
- Failed login handling: Claude's discretion

### Password reset flow
- Reset links expire after **1 hour**
- Reset request response: **Always show "Email sent"** even if email doesn't exist (prevents email enumeration)
- Post-reset flow: Claude's discretion
- Invalid/expired link handling: Claude's discretion

### Account settings UI
- Page structure: Claude's discretion
- Editable fields: **Email display only** (no editing in v1; keep minimal)
- Password change behavior: **Force re-login on all devices** when password is changed
- Navigation: **User menu in top-right corner** (avatar/name dropdown with Settings option)

### Claude's Discretion
- Password strength requirements (standard/moderate/strong)
- Post-signup UX (redirect to check email page vs inline message vs login redirect)
- Remember me checkbox (extend sessions or fixed duration)
- Login redirect logic (always dashboard vs smart redirect to previous page)
- Failed login error messages (generic vs specific, with/without lockout)
- Post-password-reset flow (auto-login vs manual login vs success page)
- Invalid reset link handling (error page vs redirect with message)
- Account settings page layout (single page vs tabs vs sidebar navigation)

</decisions>

<specifics>
## Specific Ideas

No specific product references or "like X" moments — open to standard SaaS authentication patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-authentication-account*
*Context gathered: 2026-01-27*
