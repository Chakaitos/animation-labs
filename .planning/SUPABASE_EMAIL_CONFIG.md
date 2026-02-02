# Supabase Email Configuration Guide

## Overview

Supabase sends authentication emails (verification, password reset) by default using their SMTP service. This guide shows how to configure custom emails using your Resend account.

## Current Setup

**What's Working:**
- ✅ Video completion emails (sent via our custom `sendVideoReadyEmail`)
- ✅ Payment failed emails (sent via our custom `sendPaymentFailedEmail`)

**What's Using Supabase Default:**
- 🔄 Email verification (sent by Supabase)
- 🔄 Password reset (sent by Supabase)

**Goal:** Configure Supabase to use Resend for ALL emails, maintaining consistent branding.

## Configuration Options

### Option 1: Supabase SMTP with Resend (Recommended)

This approach lets Supabase send emails through Resend's SMTP server.

**Pros:**
- Centralized email delivery through Resend
- All emails appear in Resend dashboard
- Consistent deliverability and monitoring
- No code changes needed

**Cons:**
- Uses Supabase's email templates (less customization)
- Requires manual template editing in Supabase dashboard

**Setup Steps:**

1. **Get Resend SMTP credentials:**
   - Host: `smtp.resend.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Username: `resend`
   - Password: Your `RESEND_API_KEY` (starts with `re_...`)

2. **Configure Supabase SMTP:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to: **Settings** → **Auth** → **SMTP Settings**
   - Toggle **Enable Custom SMTP** to ON
   - Fill in the form:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: re_your_resend_api_key_here
     Sender Email: hello@animationlabs.ai
     Sender Name: Animation Labs
     ```
   - Click **Save**

3. **Verify SMTP connection:**
   - Test by triggering a password reset
   - Check Resend dashboard for the sent email
   - If fails, check Supabase logs: **Logs** → **Auth**

4. **Customize email templates:**
   - Navigate to: **Authentication** → **Email Templates**
   - Edit templates for:
     - Confirm signup
     - Invite user
     - Magic link
     - Change email address
     - Reset password
   - Use variables: `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`, `{{ .Token }}`

### Option 2: Disable Supabase Emails, Use Custom (Advanced)

This approach completely disables Supabase's built-in emails and handles everything in code.

**Pros:**
- Full control over email design (React Email templates)
- Consistent with existing video/payment emails
- Better personalization and branding

**Cons:**
- Requires code changes to auth flow
- More complexity
- Need to handle email generation timing

**Setup Steps:**

1. **Disable Supabase email confirmations:**
   - Go to: **Settings** → **Auth** → **Email**
   - Toggle **Enable email confirmations** to OFF
   - Users are immediately confirmed on signup

2. **Create custom welcome email:**
   ```typescript
   // emails/welcome.tsx
   import { Button, Html, Head, Body, Container, Section, Text } from '@react-email/components'

   interface WelcomeEmailProps {
     firstName: string
     loginUrl: string
   }

   export default function WelcomeEmail({ firstName, loginUrl }: WelcomeEmailProps) {
     return (
       <Html>
         <Head />
         <Body style={{ backgroundColor: '#f6f9fc' }}>
           <Container style={{ margin: '0 auto', padding: '20px' }}>
             <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
               Welcome to Animation Labs, {firstName}! 🎬
             </Text>
             <Text>
               You're all set! Your account is ready and you can start creating
               professional logo animations right away.
             </Text>
             <Section style={{ marginTop: '32px' }}>
               <Button
                 href={loginUrl}
                 style={{
                   backgroundColor: '#000',
                   color: '#fff',
                   padding: '12px 24px',
                   borderRadius: '6px',
                 }}
               >
                 Get Started
               </Button>
             </Section>
           </Container>
         </Body>
       </Html>
     )
   }
   ```

3. **Send welcome email after signup:**
   ```typescript
   // lib/email/send.ts
   export async function sendWelcomeEmail(
     email: string,
     firstName: string,
   ) {
     try {
       const { data, error } = await resend.emails.send({
         from: 'Animation Labs <hello@animationlabs.ai>',
         to: email,
         subject: 'Welcome to Animation Labs! 🎬',
         react: WelcomeEmail({
           firstName,
           loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
         }),
       })

       if (error) {
         console.error('Failed to send welcome email:', error)
         // Don't throw - signup should succeed even if email fails
       }

       return data
     } catch (error) {
       console.error('Welcome email error:', error)
     }
   }
   ```

4. **Trigger in signup Server Action:**
   ```typescript
   // app/(auth)/signup/actions.ts
   export async function signup(formData: FormData) {
     // ... existing signup logic ...

     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { first_name: firstName },
       },
     })

     if (error) throw error

     // Send welcome email (fire-and-forget)
     sendWelcomeEmail(email, firstName).catch(err => {
       console.error('Failed to send welcome email:', err)
     })

     return { success: true }
   }
   ```

5. **Handle password reset emails:**
   ```typescript
   // app/(auth)/forgot-password/actions.ts
   export async function resetPassword(formData: FormData) {
     const email = formData.get('email') as string

     // Get user's first name from profile
     const { data: profile } = await supabase
       .from('profiles')
       .select('first_name')
       .eq('email', email)
       .single()

     // Generate reset link via Supabase
     const { error } = await supabase.auth.resetPasswordForEmail(email, {
       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
     })

     if (error) throw error

     // Send custom branded email
     if (profile?.first_name) {
       await sendPasswordResetEmail(email, profile.first_name, resetUrl)
     }

     return { success: true }
   }
   ```

### Option 3: Hybrid Approach (Current)

Keep using Supabase's default emails but customize the templates.

**Best for:** Quick setup, good enough for v1

**Setup:**
1. Keep **Enable Custom SMTP** OFF (use Supabase's service)
2. Customize templates in: **Authentication** → **Email Templates**
3. Add branding, adjust copy, improve design
4. Later migrate to Option 1 or 2 when needed

## Email Template Variables

Supabase provides these variables for email templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Email verification link | Used in confirm signup |
| `{{ .Token }}` | OTP code | For magic link |
| `{{ .TokenHash }}` | Token hash | Internal use |
| `{{ .SiteURL }}` | Your app URL | From Supabase config |
| `{{ .RedirectTo }}` | Redirect destination | From auth request |

**Example template:**
```html
<h2>Welcome to Animation Labs!</h2>
<p>Click the link below to verify your email address:</p>
<a href="{{ .ConfirmationURL }}">Verify Email</a>
<p>This link expires in 24 hours.</p>
```

## Domain Configuration

For best deliverability, configure these DNS records for `animationlabs.ai`:

### SPF Record
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM Record (get from Resend dashboard)
```
Type: TXT
Host: resend._domainkey
Value: [provided by Resend]
```

### DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@animationlabs.ai
```

**Verify DNS:**
```bash
# Check SPF
dig TXT animationlabs.ai | grep spf

# Check DKIM
dig TXT resend._domainkey.animationlabs.ai

# Check DMARC
dig TXT _dmarc.animationlabs.ai
```

## Environment Variables

Required for all approaches:

```bash
# Resend API Key (required)
RESEND_API_KEY=re_...

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://animatelabs.ai

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Verify in production:**
```bash
vercel env ls
```

**Add missing vars:**
```bash
vercel env add RESEND_API_KEY
# Paste value when prompted
```

## Testing Email Configuration

### Test Verification Email
```bash
# Trigger via signup page
curl -X POST https://your-app.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Check logs
vercel logs | grep "verification"
```

### Test Password Reset Email
```bash
# Trigger via forgot password page
curl -X POST https://your-app.com/api/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs
vercel logs | grep "password-reset"
```

### Check Resend Dashboard
1. Go to [Resend Emails](https://resend.com/emails)
2. Filter by date/recipient
3. Check delivery status
4. View email preview
5. Check bounce/complaint rates

## Troubleshooting

### SMTP Connection Failed

**Error:** "SMTP connection timeout" or "Authentication failed"

**Fixes:**
- Verify `RESEND_API_KEY` is correct
- Check port (use 587 with STARTTLS)
- Ensure firewall allows outbound SMTP
- Try alternative port (465 with SSL)

### Emails Not Customized

**Error:** Still seeing default Supabase emails

**Fixes:**
- Clear Supabase cache (save templates again)
- Check "Enable Custom SMTP" is ON
- Verify sender email matches Resend verified domain
- Wait a few minutes for changes to propagate

### Domain Not Verified

**Error:** "Domain not verified" in Resend

**Fixes:**
- Add all DNS records (SPF, DKIM, DMARC)
- Wait up to 48 hours for DNS propagation
- Use `dig` to verify records are published
- Use Resend's test domain temporarily: `onboarding@resend.dev`

## Recommended Approach

**For immediate production use:**
→ **Option 1** (SMTP with Resend)

**Why:**
- Quick setup (5 minutes)
- Centralized email monitoring
- No code changes
- Good enough for v1

**For future enhancement:**
→ **Option 2** (Custom emails)

**When:**
- After validating market fit
- When branding becomes critical
- When you need advanced personalization
- When you want full email control

## Next Steps

1. Choose your configuration option (recommend Option 1)
2. Follow setup steps above
3. Configure DNS records for domain
4. Test all email flows
5. Monitor Resend dashboard for first week
6. Set up alerts for email failures
7. Consider Option 2 for future iteration

## Support

- **Resend Docs:** https://resend.com/docs/send-with-smtp
- **Supabase SMTP Guide:** https://supabase.com/docs/guides/auth/auth-smtp
- **DNS Propagation Check:** https://dnschecker.org
