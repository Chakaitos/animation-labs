# Phase 6: Email Notifications - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

User communication system that sends transactional emails for key lifecycle events: account verification after signup, password reset requests, video completion notifications, and payment failure alerts. This phase focuses on reliable email delivery infrastructure, not marketing campaigns or promotional emails.

</domain>

<decisions>
## Implementation Decisions

### Email design & branding
- HTML emails with full branding (logo, colors, styled buttons)
- Animation Labs logo displayed prominently in header of every email
- Color scheme matches website theme colors for consistent brand experience
- Call-to-action links styled as prominent buttons (not plain text links)

### Content & tone
- Friendly & conversational writing style (e.g., "Hey there! Welcome to Animation Labs")
- Personalization uses first name — requires adding name field to profiles schema
- Moderate email length with short paragraph + relevant details (brand name, timestamp, next steps)

### Sending behavior
- Retry 3 times with exponential backoff on email sending failures (immediate, 1min, 5min)
- Track delivery only (no open/click tracking) — privacy-friendly approach
- Rate limiting relies on Resend's default limits (no additional application-level limits)

### Email templates
- React Email as template system (type-safe, integrates with Next.js, Resend-recommended)
- React Email preview server for template development and testing

### Claude's Discretion
- CTA button wording (action-oriented vs benefit-focused based on email type)
- Send timing per email type (immediate for verification, flexible for less urgent)
- Template component organization (shared layout vs composable primitives)
- Template location in project structure (emails/, lib/emails/, or app/emails/)

</decisions>

<specifics>
## Specific Ideas

- Friendly tone example: "Hey there! Welcome to Animation Labs" (not "Dear User, Thank you for registering")
- Email types: verification (after signup), password reset (with secure link), video ready (with download button), payment failed (with retry action)
- Name field needed: Update profiles table and signup flow to capture first name for personalization

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-email-notifications*
*Context gathered: 2026-02-02*
