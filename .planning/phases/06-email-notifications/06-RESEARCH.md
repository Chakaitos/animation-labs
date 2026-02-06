# Phase 6: Email Notifications - Research

**Researched:** 2026-02-02
**Domain:** Transactional email delivery with Next.js, Resend, and React Email
**Confidence:** HIGH

## Summary

Email notifications in Animation Labs deliver transactional messages for authentication (verification, password reset), video completion, and payment failures. The locked decisions from CONTEXT.md constrain this phase to use Resend as the email service provider, React Email for templates, HTML emails with full branding, and a retry strategy with exponential backoff.

The standard approach combines three layers: **Supabase Auth handles verification/password reset emails** (configured with Resend as custom SMTP), while **application code sends video completion and payment failure emails** using Resend's SDK with React Email templates. This separation ensures auth emails leverage Supabase's built-in security (token generation, rate limiting) while giving full control over transactional email design and delivery.

**Critical finding:** Supabase's default SMTP has severe production limitations (2 emails/hour, team-only addresses), making custom SMTP configuration mandatory, not optional. Resend provides a native Supabase integration that auto-configures SMTP settings, eliminating manual credential management.

**Primary recommendation:** Configure Resend as Supabase's custom SMTP provider first (handles auth emails automatically), then build React Email templates for video/payment notifications sent via Resend SDK from Server Actions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | ^4.x | Email delivery API | Official Resend SDK, Next.js native integration, co-created with React Email, 2 req/sec default rate limit |
| react-email | ^3.x | Email template engine | Type-safe React components, automatic inline CSS conversion, official preview server, Resend-recommended |
| @react-email/components | ^0.0.x | Pre-built email components | Production-tested across email clients, handles rendering inconsistencies, table-based layouts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| exponential-backoff | ^3.x | Retry logic with backoff | Failed email sends, API rate limits, transient errors (default: 5 retries, jitter enabled) |
| @react-email/tailwind | ^1.x | Tailwind in emails | Styling templates (converts rem→px, resolves CSS vars, inlines styles automatically) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | SendGrid, Postmark, AWS SES | More config overhead, no React Email integration, Resend chosen for dev experience + native Supabase support |
| React Email | MJML, Maizzle, Foundation for Emails | More opinionated templates, no React/TypeScript, harder to integrate with Next.js components |
| Custom retry | BullMQ/Redis queue | Adds infrastructure (Redis), overkill for transactional emails (use queues for >10K emails/day) |

**Installation:**
```bash
npm install resend react-email @react-email/components exponential-backoff
npm install --save-dev @react-email/tailwind
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── email/                    # Email sending logic
│   ├── client.ts            # Resend client instance (singleton)
│   ├── send.ts              # Send functions with retry logic
│   └── templates.tsx        # Template exports (re-export from emails/)
emails/                       # React Email templates
├── _components/             # Shared layout components (prefix _ to hide from preview)
│   ├── EmailLayout.tsx     # Wrapper with header/footer/branding
│   └── Button.tsx          # Styled CTA button component
├── verification.tsx         # NOT USED (Supabase sends via SMTP)
├── password-reset.tsx       # NOT USED (Supabase sends via SMTP)
├── video-ready.tsx          # Video completion notification
└── payment-failed.tsx       # Payment failure alert
```

**Note:** Auth emails (verification, password reset) are sent by Supabase Auth using its own templates, not React Email. Only application emails (video ready, payment failed) use this structure.

### Pattern 1: Two-Tier Email Strategy

**What:** Separate email delivery paths for authentication vs application emails

**When to use:** Always when using Supabase Auth with custom SMTP

**Architecture:**
```
Supabase Auth Emails (verification, password reset)
├── Sent by: Supabase Auth service
├── Templates: Supabase Go templates (configured in Dashboard)
├── Delivery: Resend SMTP (configured once)
└── Triggered: Automatically on signup/password reset request

Application Emails (video ready, payment failed)
├── Sent by: Next.js Server Actions
├── Templates: React Email components
├── Delivery: Resend SDK
└── Triggered: Your application code (webhook handlers, video completion)
```

**Why this pattern:**
- Supabase Auth generates secure tokens/links (don't hand-roll)
- Auth templates rarely change (set-and-forget via Dashboard)
- Application emails need dynamic content (user data, video URLs, payment details)
- React Email gives full control over branding and personalization

### Pattern 2: Resend Client Singleton

**What:** Single Resend instance reused across all email sends

**Example:**
```typescript
// lib/email/client.ts
// Source: https://resend.com/docs/send-with-nextjs
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

**Why:** Resend SDK is stateless (just wraps HTTP client), creating multiple instances wastes memory.

### Pattern 3: Server Action with Retry

**What:** Email sending wrapped in exponential backoff retry logic

**Example:**
```typescript
// lib/email/send.ts
// Source: https://github.com/coveooss/exponential-backoff
import { backOff } from 'exponential-backoff';
import { resend } from './client';

export async function sendVideoReadyEmail(email: string, videoUrl: string, brandName: string) {
  'use server';

  return await backOff(
    async () => {
      const result = await resend.emails.send({
        from: 'Animation Labs <noreply@animationlabs.com>',
        to: email,
        subject: `Your ${brandName} video is ready!`,
        react: VideoReadyEmail({ videoUrl, brandName }),
      });

      // CRITICAL: Resend doesn't throw on errors, must check explicitly
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    {
      numOfAttempts: 3,
      startingDelay: 1000,  // 1 second
      timeMultiple: 5,       // 1s → 5s → 25s
      jitter: 'full',        // Randomize delays to avoid thundering herd
    }
  );
}
```

**Why this works:**
- 3 retries as specified in CONTEXT.md decisions
- Exponential backoff (1s, 5s, 25s) handles transient failures
- Jitter prevents multiple emails retrying simultaneously
- Explicit error checking (Resend returns `{ error }` instead of throwing)

### Pattern 4: Idempotency Key for Payment Emails

**What:** Prevent duplicate payment failure emails using unique identifiers

**Example:**
```typescript
// app/api/webhooks/stripe/route.ts
import { sendPaymentFailedEmail } from '@/lib/email/send';

// Track sent emails in-memory or database
const sentEmails = new Set<string>();

export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(/* ... */);

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const idempotencyKey = `payment_failed_${invoice.id}`;

    // Check if already sent
    if (sentEmails.has(idempotencyKey)) {
      return new Response('Already processed', { status: 200 });
    }

    await sendPaymentFailedEmail(invoice.customer_email, invoice.id);
    sentEmails.add(idempotencyKey);
  }

  return new Response('OK', { status: 200 });
}
```

**Why:** Stripe retries webhooks (3 days with exponential backoff). Without deduplication, users receive duplicate payment failure emails.

### Anti-Patterns to Avoid

- **Using Supabase's default SMTP for production:** Limits: 2 emails/hour, team-only addresses. Configure custom SMTP immediately.
- **Building custom email templates from scratch:** Use React Email components (`@react-email/components`). They handle email client quirks (Outlook table rendering, Gmail style stripping).
- **Ignoring Resend error responses:** SDK returns `{ error }` instead of throwing. Always check `result.error` explicitly.
- **Sending auth emails from application code:** Let Supabase Auth handle verification/password reset (secure token generation, rate limiting built-in).
- **Not adding jitter to retry logic:** Causes thundering herd when multiple requests fail simultaneously (e.g., Resend API downtime).
- **Embedding external stylesheets:** Email clients strip `<head>` and disable external CSS. React Email automatically inlines styles.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email rendering across clients | Custom HTML with media queries | React Email `@react-email/components` | Outlook uses Word rendering engine (no flexbox/grid), Gmail strips styles, 40+ email clients with different quirks |
| Secure password reset links | Custom token generation + expiry | Supabase Auth `resetPasswordForEmail()` | Handles token hashing, expiry (1 hour default), secure URL construction, rate limiting (30/hour SMTP default) |
| Email verification flow | Custom verification tokens | Supabase Auth email confirmation | Auto-sends on signup, integrates with RLS policies, handles token lifecycle |
| CSS inlining for emails | Manual inline styles or postcss plugins | React Email `Tailwind` component | Converts Tailwind classes to inline styles, resolves CSS vars, changes rem→px for compatibility |
| Retry logic with backoff | Custom setTimeout recursion | `exponential-backoff` npm package | Handles jitter, max delay caps, attempt limits, promise-based API |
| Email deliverability (SPF/DKIM/DMARC) | Manual DNS record management | Resend domain verification wizard | Auto-generates SPF/DKIM/DMARC records, validates setup, monitors reputation |

**Key insight:** Email is a 1990s technology with modern expectations. Every "simple" email feature (HTML rendering, authentication, deliverability) has decades of edge cases. Use battle-tested libraries and services that handle the complexity.

## Common Pitfalls

### Pitfall 1: Supabase Default SMTP in Production

**What goes wrong:** Emails fail to send to real users, rate limits trigger immediately, brand uses Supabase domain.

**Why it happens:** Supabase's default SMTP is intentionally crippled for development/testing:
- 2 emails per hour (not 30, documentation is inconsistent)
- Only sends to team member emails (addresses added to project dashboard)
- Sends from `noreply@mail.app.supabase.io` (no custom domain)
- No SLA or delivery guarantee

**How to avoid:** Configure custom SMTP immediately, even for development:
1. Create Resend account, verify domain (animationlabs.com)
2. Navigate to Supabase Dashboard → Integrations → Resend
3. Click "Connect" (auto-configures SMTP settings)
4. OR manually copy SMTP credentials from Resend to Supabase Auth settings

**Warning signs:**
- Error: "SMTP server is only configured to send to team members"
- Emails stuck in "pending" (visible in Resend dashboard but never sent)
- Rate limit errors after 2-3 emails

### Pitfall 2: Missing Name Field for Personalization

**What goes wrong:** CONTEXT.md specifies friendly personalized emails ("Hey there, [FirstName]!"), but `profiles` table only has `full_name`, and signup doesn't capture name.

**Why it happens:** Initial schema (Phase 1) created minimal profile structure. Email personalization requirement added in Phase 6 context.

**How to avoid:**
1. Add migration to create `first_name` column in `profiles` table
2. Update signup form to capture first name (required field)
3. Modify `handle_new_user()` trigger to populate `first_name` from `raw_user_meta_data`
4. Provide fallback in email templates: `{firstName || 'there'}`

**Warning signs:**
- Template references `firstName` prop but value is undefined
- Emails display "Hey there, !" (missing name)
- TypeScript error: Property 'first_name' does not exist on type 'Profile'

### Pitfall 3: Resend Rate Limit Errors Without Detection

**What goes wrong:** Resend returns `{ error: { message: 'rate_limit_exceeded' } }` but code doesn't check, email silently fails.

**Why it happens:** Resend SDK doesn't throw errors (returns `{ error }` object). Default rate limit is 2 requests/second. Developers assume success if no exception thrown.

**How to avoid:**
```typescript
const result = await resend.emails.send({ /* ... */ });

// ALWAYS check for errors
if (result.error) {
  // Log error with context
  console.error('Resend error:', result.error.message, { emailType: 'video_ready' });

  // Check for rate limit specifically
  if (result.error.message.includes('rate_limit_exceeded')) {
    // Retry with longer delay or queue for later
    throw new Error('Rate limit exceeded, will retry');
  }

  throw new Error(result.error.message);
}
```

**Warning signs:**
- Resend dashboard shows "failed" status but no errors in application logs
- Users report not receiving emails but code shows success
- Multiple concurrent email sends (e.g., 5 videos complete simultaneously)

### Pitfall 4: Email Client CSS Compatibility Assumptions

**What goes wrong:** Emails look perfect in browser preview but broken in Outlook/Gmail. Flexbox layouts collapse, colors wrong, buttons misaligned.

**Why it happens:** Email clients don't use modern browsers:
- **Outlook (Windows):** Uses Word rendering engine (no flexbox, grid, CSS variables)
- **Gmail:** Strips `<style>` blocks, disables external CSS
- **Apple Mail:** Best support but still quirky with some CSS3 features
- **Tailwind units:** Default rem units unsupported, need px conversion

**How to avoid:**
- Use React Email `@react-email/components` for all layout (pre-tested across clients)
- Wrap styles with `<Tailwind>` component (auto-converts to inline px-based styles)
- Avoid: flexbox, grid, position: absolute, CSS variables, external fonts
- Use: tables for layout, inline styles, web-safe fonts, solid colors

**Warning signs:**
- Preview looks good but test emails in Gmail/Outlook are broken
- Buttons are tiny or invisible in some clients
- Layout stacks vertically instead of side-by-side

### Pitfall 5: Auth Email Customization Confusion

**What goes wrong:** Developers build React Email templates for verification/password reset, but emails still use default Supabase templates.

**Why it happens:** Supabase Auth has its own email sending system. When you call `signUp()` or `resetPasswordForEmail()`, Supabase sends the email directly via configured SMTP using Go templates (not React Email).

**How to avoid:**
1. **For auth emails (verification, password reset):** Customize via Supabase Dashboard → Authentication → Email Templates
2. **For application emails (video ready, payment failed):** Use React Email + Resend SDK in Server Actions
3. **Alternative (advanced):** Use Supabase Auth Hooks ("Send Email Hook") to intercept auth emails and send via custom system, but this adds complexity

**Warning signs:**
- Created `verification.tsx` React Email template but never receives it
- Supabase still sends generic verification email despite code changes
- Error: "Cannot find module 'emails/verification'" (template never called)

### Pitfall 6: Duplicate Video Completion Emails

**What goes wrong:** User receives 2-3 "Your video is ready!" emails for single video.

**Why it happens:** n8n webhook retries on timeout/error. If email sending is slow (5+ seconds), n8n times out and retries, triggering duplicate sends.

**How to avoid:**
```typescript
// app/api/webhooks/n8n/route.ts
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { videoId, status } = await req.json();

  if (status !== 'completed') return;

  const supabase = createClient();

  // Update video status atomically
  const { data, error } = await supabase
    .from('videos')
    .update({
      status: 'completed',
      video_url: videoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId)
    .eq('status', 'processing')  // Only update if still processing
    .select('user_id, brand_name')
    .single();

  // If no rows updated, video already marked complete (duplicate webhook)
  if (!data) {
    console.log('Video already completed, skipping email');
    return new Response('Already processed', { status: 200 });
  }

  // Safe to send email (guaranteed first time)
  await sendVideoReadyEmail(data.user_id, videoUrl, data.brand_name);

  return new Response('OK', { status: 200 });
}
```

**Warning signs:**
- Users report receiving multiple completion emails
- Database shows video updated multiple times with same status
- n8n logs show multiple webhook deliveries for same execution

## Code Examples

Verified patterns from official sources:

### Configure Resend as Supabase Custom SMTP

```bash
# Source: https://resend.com/docs/send-with-supabase-smtp
# Two options:

# Option 1: Native Integration (recommended)
# 1. Go to Supabase Dashboard → Integrations → Resend
# 2. Click "Connect" → Authorize
# 3. SMTP settings auto-configured

# Option 2: Manual SMTP Configuration
# 1. Get SMTP credentials from Resend Dashboard → Settings → SMTP
# 2. Go to Supabase Dashboard → Authentication → SMTP Settings
# 3. Enter:
#    - Host: smtp.resend.com
#    - Port: 465 or 587
#    - Username: resend
#    - Password: [Your Resend API Key]
#    - Sender email: noreply@animationlabs.com
#    - Sender name: Animation Labs
```

### React Email Template with Branding

```typescript
// emails/video-ready.tsx
// Source: https://react.email/docs/components/tailwind
import { Html, Head, Body, Container, Heading, Text, Button, Img, Tailwind } from '@react-email/components';

interface VideoReadyEmailProps {
  firstName: string;
  brandName: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function VideoReadyEmail({
  firstName = 'there',
  brandName,
  videoUrl,
  thumbnailUrl,
}: VideoReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            {/* Header with logo */}
            <Img
              src="https://animationlabs.com/logo.svg"
              alt="Animation Labs"
              width="150"
              height="40"
              className="mb-6"
            />

            {/* Main content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Heading className="text-2xl font-bold text-gray-900 mb-4">
                Hey there, {firstName}!
              </Heading>

              <Text className="text-gray-700 mb-4">
                Your <strong>{brandName}</strong> logo animation is ready to download.
              </Text>

              {/* Video thumbnail */}
              <Img
                src={thumbnailUrl}
                alt={`${brandName} video thumbnail`}
                width="600"
                height="338"
                className="rounded mb-4"
              />

              {/* CTA Button */}
              <Button
                href={videoUrl}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold"
              >
                Download Your Video
              </Button>

              <Text className="text-gray-500 text-sm mt-6">
                Video created: {new Date().toLocaleDateString()}
              </Text>
            </div>

            {/* Footer */}
            <Text className="text-gray-400 text-xs mt-6 text-center">
              Animation Labs - Professional logo animations in minutes
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

### Send Email with Retry from Server Action

```typescript
// lib/email/send.ts
// Source: https://www.npmjs.com/package/exponential-backoff
'use server';

import { backOff } from 'exponential-backoff';
import { resend } from './client';
import { createClient } from '@/lib/supabase/server';
import VideoReadyEmail from '@/emails/video-ready';

export async function sendVideoReadyEmail(userId: string, videoUrl: string, brandName: string) {
  // Get user data
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('User not found');

  // Send with retry
  return await backOff(
    async () => {
      const result = await resend.emails.send({
        from: 'Animation Labs <noreply@animationlabs.com>',
        to: profile.email,
        subject: `Your ${brandName} video is ready!`,
        react: VideoReadyEmail({
          firstName: profile.first_name || 'there',
          brandName,
          videoUrl,
          thumbnailUrl: `${videoUrl}/thumbnail.jpg`,
        }),
      });

      // CRITICAL: Check for errors (Resend doesn't throw)
      if (result.error) {
        console.error('Resend error:', result.error);
        throw new Error(result.error.message);
      }

      console.log('Email sent:', result.data.id);
      return result;
    },
    {
      numOfAttempts: 3,
      startingDelay: 1000,   // 1 second (immediate retry per CONTEXT.md)
      timeMultiple: 5,        // 1s → 5s → 25s (exponential backoff)
      jitter: 'full',         // Randomize to avoid thundering herd
      retry: (error, attemptNumber) => {
        console.log(`Email send attempt ${attemptNumber} failed:`, error.message);

        // Don't retry on permanent errors
        if (error.message.includes('invalid_email') || error.message.includes('domain_not_verified')) {
          return false;
        }

        return true; // Retry on transient errors
      },
    }
  );
}
```

### React Email Development Server Setup

```json
// package.json
// Source: https://react.email/docs/cli
{
  "scripts": {
    "dev": "next dev",
    "email:dev": "email dev --dir emails --port 3001"
  }
}
```

```bash
# Start email preview server
npm run email:dev

# Preview at http://localhost:3001
# Hot-reload on file changes
# Test emails across different clients in browser
```

### Payment Failed Email from Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts
// Source: https://docs.stripe.com/billing/subscriptions/webhooks
import { stripe } from '@/lib/stripe';
import { sendPaymentFailedEmail } from '@/lib/email/send';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;

    // Update subscription status
    await updateSubscriptionStatus(invoice.subscription, 'past_due');

    // Send email notification
    await sendPaymentFailedEmail({
      email: invoice.customer_email,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due / 100, // Convert cents to dollars
      retryUrl: invoice.hosted_invoice_url,
    });
  }

  return new Response('OK', { status: 200 });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MJML for email templates | React Email with TypeScript | 2023 | Type-safe templates, Next.js integration, component reuse |
| Nodemailer + raw SMTP | Resend SDK | 2024 | Simpler API, built-in retry, better deliverability monitoring |
| CSS-in-JS with manual inlining | React Email `<Tailwind>` component | 2024 | Auto-inline, rem→px conversion, CSS var resolution |
| Gmail/Yahoo optional auth | SPF/DKIM/DMARC mandatory | Feb 2024 | Permanent rejections without auth (Gmail requirement for bulk senders) |
| Manual SMTP configuration | Resend-Supabase native integration | 2024 | One-click setup, auto-configures SMTP credentials |
| Synchronous Server Actions | Async-only Server Actions | Next.js 16 (2025) | Breaking change, all Server Actions must use async/await |

**Deprecated/outdated:**
- **Supabase default SMTP for production:** Now explicitly documented as "testing only" with 2/hour limit
- **React Email v1:** v2 released in 2024 with 5x faster preview server (40s → 7s), workspace support
- **Mailgun/SendGrid for Next.js:** Resend now recommended (built by Vercel ecosystem, better DX)
- **Custom email HTML without frameworks:** Email client diversity (40+ clients) makes hand-coding impractical

## Open Questions

Things that couldn't be fully resolved:

1. **First Name Field Schema Migration**
   - What we know: CONTEXT.md requires personalization with first name, current `profiles` has only `full_name`
   - What's unclear: Should we split existing `full_name` into `first_name`/`last_name`, or add new field and leave `full_name` for display?
   - Recommendation: Add separate `first_name` column, update signup to capture it, keep `full_name` for backward compatibility. Migration can parse existing `full_name` (split on first space) with fallback to empty string.

2. **Email Template Location Preference**
   - What we know: React Email works with any folder (`emails/`, `lib/emails/`, `app/emails/`)
   - What's unclear: Next.js convention for non-route, non-component files (email templates don't fit existing categories)
   - Recommendation: Use root-level `emails/` folder (matches React Email docs, separate from app logic, easy to find). Claude's discretion per CONTEXT.md.

3. **Rate Limit Monitoring Strategy**
   - What we know: Resend default 2 req/sec, can request increase, returns headers with quota info
   - What's unclear: Whether to implement proactive rate limit monitoring or rely on retry logic
   - Recommendation: Start with retry-only (exponential backoff handles transient rate limits). Add monitoring if exceeding 100 emails/day (check response headers, log warnings at 80% quota).

4. **Dead Letter Queue for Failed Emails**
   - What we know: After 3 retries, email send permanently fails. No built-in mechanism to retry later.
   - What's unclear: Should failed emails be logged to database for manual retry, or accept permanent failure?
   - Recommendation: For MVP, log error and move on (transactional emails are time-sensitive). Add database logging if >5% failure rate observed in production. Queue system (BullMQ) overkill for <10K emails/day.

## Sources

### Primary (HIGH confidence)
- [Resend Next.js Integration](https://resend.com/docs/send-with-nextjs) - Official setup guide, Server Actions pattern
- [Resend Supabase SMTP Guide](https://resend.com/docs/send-with-supabase-smtp) - Custom SMTP configuration
- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Template variables, Go template syntax
- [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) - SMTP providers, rate limits, configuration
- [React Email Tailwind Component](https://react.email/docs/components/tailwind) - CSS conversion, inline styles
- [React Email CLI](https://react.email/docs/cli) - Preview server setup (via npm package page)
- [exponential-backoff npm](https://www.npmjs.com/package/exponential-backoff) - Retry configuration, jitter options
- [Resend Rate Limits](https://resend.com/docs/api-reference/rate-limit) - API quotas, error codes

### Secondary (MEDIUM confidence)
- [Next.js 16 Release](https://nextjs.org/blog/next-16) - Async-only Server Actions requirement
- [Email Deliverability 2026](https://www.egenconsulting.com/blog/email-deliverability-2026.html) - SPF/DKIM/DMARC mandatory (Gmail/Yahoo)
- [Mastering Email Rate Limits - Resend API](https://dalenguyen.medium.com/mastering-email-rate-limits-a-deep-dive-into-resend-api-and-cloud-run-debugging-f1b97c995904) - Critical error checking pattern
- [Resend + Supabase Integration Announcement](https://supabase.com/partners/integrations/resend) - Native integration availability
- [React Email 2.0 Release](https://resend.com/blog/react-email-2) - Performance improvements, workspace support

### Tertiary (LOW confidence - flagged for validation)
- [Next.js Email Sending Tutorial](https://mailtrap.io/blog/nextjs-send-email/) - General patterns, not Resend-specific
- [Email CSS Best Practices](https://designmodo.com/html-css-emails/) - Community article, not official React Email docs
- [Transactional Email Anti-patterns](https://microservices.io/patterns/communication-style/idempotent-consumer.html) - General distributed systems, not email-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Resend + React Email officially documented for Next.js, native Supabase integration confirmed
- Architecture: HIGH - Two-tier strategy (Supabase Auth + App emails) verified in official docs, retry pattern from official SDK examples
- Pitfalls: MEDIUM - Common issues identified from community sources and documentation warnings, but not all tested in Animation Labs context
- Email client compatibility: MEDIUM - React Email component testing verified, but Tailwind limitations based on community reports

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days - stable domain, established libraries)
