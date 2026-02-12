# Claude Code Prompt: Build Animation Labs (Phase 2 - Self-Service Platform)

## Project Overview

I need you to help me build **Animation Labs** - a SaaS platform that generates professional logo animations using AI (Veo 3 API). This is a full-stack web application with authentication, payments, credit management, and integration with an existing n8n workflow for video generation.

I have already created a comprehensive Product Requirements Document (PRD) that details all features, user flows, database schemas, and API specifications. I'll provide that to you after this initial prompt.

## Your Role

Act as my senior full-stack developer and architect. I need you to:

1. **Plan the development** in logical, incremental phases
2. **Build the application** following best practices
3. **Set up the infrastructure** (database, auth, storage, payments)
4. **Create all necessary files** (components, API routes, database migrations, etc.)
5. **Test thoroughly** as we go
6. **Document** setup instructions and deployment steps

## Tech Stack (Already Decided)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context + React Query (TanStack Query)

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Payments:** Stripe (Subscriptions + Customer Portal)
- **Email:** Resend
- **Video Generation:** n8n webhook integration (I already have n8n running)

### Infrastructure
- **Hosting:** Vercel
- **Environment:** Node.js 18+
- **Package Manager:** pnpm (preferred) or npm

### Development Tools
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode
- **Git:** Version control with conventional commits

## Project Requirements (High-Level)

### Core Features to Build

**1. Public Landing Pages**
- Homepage with hero, pricing, and examples
- Examples gallery page
- Detailed pricing page
- Responsive and SEO-optimized
- Fast load times (<2 seconds)

**2. Authentication System**
- User registration with email verification
- Login/logout
- Password reset flow
- Session management (JWT)
- Protected routes

**3. User Dashboard**
- Display credit balance (subscription + overage)
- Show recent videos
- Quick actions (create video, manage subscription)
- Usage statistics

**4. Video Creation Flow**
- Multi-step form (4 steps):
  - Logo upload (REQUIRED - with auto color extraction)
  - Brand details (brand name REQUIRED, colors auto-populated from logo, user can override)
  - Video settings (duration default 8s, quality default standard - both REQUIRED)
  - Customization (ALL OPTIONAL: custom notes, text overlay)
- Auto-extract primary and secondary colors from uploaded logo
- File upload to Supabase Storage
- Credit validation before submission
- Webhook to n8n for video generation with intelligent prompt generation
- Processing status tracking
- Video preview and download when complete
- **AI handles minimal input**: If user only provides logo + brand name + defaults, n8n workflow generates intelligent prompt

**4. Credit Management System**
- Track subscription credits (reset monthly)
- Track overage credits (persist across months)
- Deduct credits on video creation
- Display balance and next reset date
- Transaction history

**5. Subscription Management (Stripe)**
- Plan selection (Starter $30, Professional $80)
- Stripe Checkout integration
- Subscription status display
- Plan upgrades/downgrades
- Cancellation flow
- Stripe Customer Portal integration
- Webhook handling for subscription events

**6. Video Library**
- List all user's videos
- Filter by status (processing, completed, failed)
- Search by brand name
- Video preview modal
- Download videos
- Delete videos (soft delete)

**7. Account Settings**
- Update email
- Change password
- Notification preferences
- Delete account

**8. Billing & Usage**
- Current plan details
- Usage statistics for current period
- Billing history
- Invoice downloads (via Stripe)
- Purchase additional credits

### Integration Points

**n8n Webhook Integration:**
- My n8n instance will receive video creation requests via webhook
- Endpoint: `POST https://n8n.mydomain.com/webhook/create-video`
- n8n will call back to update video status when complete
- You need to create API endpoints for both sending and receiving

**Stripe Integration:**
- Products already created in Stripe (I'll provide IDs)
- Need webhook endpoint for: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`

**Supabase Storage:**
- S3-compatible storage
- I'll provide credentials (access key, secret key, bucket name, endpoint)
- Need to upload logos and store final videos

## Database Schema (Already Designed)

The PRD includes complete SQL schemas for:
- `users` table (auth, profile data)
- `subscriptions` table (Stripe subscription tracking)
- `videos` table (video orders and metadata)
- `user_credit_balance` table (credit tracking)
- `credit_transactions` table (credit history)
- `invoices` table (Stripe invoice cache)

**All schemas are in the PRD document.**

## Development Approach

### Week 1: Foundation & Public Pages
1. Initialize Next.js project with TypeScript and Tailwind
2. Set up Supabase project and tables
3. Implement authentication (register, login, email verification, password reset)
4. Create basic layout and navigation
5. Build landing page with pricing and examples
6. Set up environment variables and configuration

### Week 2: Core Features
1. Build dashboard with credit display
2. Create video creation form (multi-step with auto-color extraction)
3. Implement file upload to Supabase Storage
4. Set up n8n webhook integration with intelligent prompt generation
5. Build video status tracking and display

### Week 3: Payments & Credits
1. Stripe Checkout integration
2. Subscription plan selection
3. Webhook handlers for subscription events
4. Credit granting on subscription creation/renewal
5. Credit deduction logic
6. Stripe Customer Portal integration

### Week 4: User Features & Polish
1. Video library with filters and search
2. Account settings pages
3. Billing history and invoices
4. Usage statistics
5. Email notifications (video ready, payment issues, etc.)
6. Error handling and edge cases
7. Loading states and animations

### Week 5: Testing & Deployment
1. Manual testing of all flows
2. Responsive design improvements
3. Performance optimization
4. Production environment setup
5. Deploy to Vercel
6. Configure production webhooks
7. Launch preparation

## Development Guidelines

### Code Quality
- Write TypeScript with strict mode enabled
- Use functional components with hooks
- Implement proper error handling (try-catch, error boundaries)
- Add loading states for all async operations
- Validate all user inputs (client and server)
- Follow RESTful API conventions

### Security
- Never expose API keys or secrets in client code
- Validate and sanitize all user inputs
- Use Supabase RLS (Row Level Security) policies
- Implement rate limiting on API routes
- Use HTTPS only (Vercel handles this)
- Hash passwords with Supabase Auth (automatic)
- Validate file uploads (type, size, content)

### Performance
- Use React Server Components where appropriate
- Implement code splitting and lazy loading
- Optimize images with Next.js Image component
- Cache API responses where appropriate
- Use database indexes on frequently queried columns

### User Experience
- Show loading indicators for all async actions
- Display clear error messages
- Implement optimistic UI updates where safe
- Make forms accessible (ARIA labels, keyboard navigation)
- Ensure mobile responsiveness
- Add success confirmations for important actions

## File Structure

Use this recommended structure:
```
animation-labs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── videos/
│   │   │   ├── create/
│   │   │   ├── account/
│   │   │   └── billing/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── videos/
│   │   │   ├── credits/
│   │   │   ├── subscription/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   └── n8n/
│   │   ├── layout.tsx
│   │   └── page.tsx (landing/home)
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── stripe/
│   │   ├── r2/
│   │   ├── email/
│   │   └── utils/
│   ├── types/
│   ├── hooks/
│   └── styles/
├── public/
├── supabase/
│   └── migrations/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Environment Variables Needed

I will provide these values, but you should set up the structure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PROFESSIONAL_PRICE_ID=

# n8n
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@animationlabs.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## API Endpoints to Build

Refer to the PRD for complete API specifications. Key endpoints:

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Users:**
- GET /api/users/me
- PATCH /api/users/me
- POST /api/users/me/change-password
- DELETE /api/users/me

**Videos:**
- POST /api/videos (create new video)
- GET /api/videos (list user's videos)
- GET /api/videos/:id (get single video)
- PATCH /api/videos/:id (update status - called by n8n)
- DELETE /api/videos/:id (soft delete)

**Credits:**
- GET /api/credits/balance
- GET /api/credits/transactions
- POST /api/credits/purchase

**Subscription:**
- GET /api/subscription
- POST /api/subscription/create (create Stripe Checkout)
- PATCH /api/subscription/change-plan
- POST /api/subscription/cancel
- GET /api/subscription/portal (get Stripe Customer Portal URL)

**Webhooks:**
- POST /api/webhooks/stripe (handle Stripe events)
- POST /api/webhooks/n8n (handle video completion from n8n)

## Data Flow Examples

### Video Creation Flow:
1. User fills out form on frontend
2. Frontend uploads logo to Supabase Storage
3. Frontend calls POST /api/videos with form data + logo URL
4. Backend validates user credits
5. Backend deducts credits from user balance
6. Backend creates video record in DB with status "processing"
7. Backend triggers n8n webhook with video data
8. Backend returns video_id to frontend
9. Frontend redirects to processing page
10. Frontend polls GET /api/videos/:id for status updates
11. n8n completes video, uploads to R2, calls PATCH /api/videos/:id
12. Backend updates video status to "completed" and video_url
13. Backend sends email notification to user
14. Frontend detects status change, shows download button

### Subscription Flow:
1. User selects plan on frontend
2. Frontend calls POST /api/subscription/create
3. Backend creates Stripe Checkout Session
4. Backend returns checkout URL
5. Frontend redirects to Stripe Checkout
6. User completes payment on Stripe
7. Stripe calls POST /api/webhooks/stripe with checkout.session.completed
8. Backend creates subscription record
9. Backend grants monthly credits to user
10. Backend sends welcome email
11. Stripe redirects user back to app
12. Frontend shows success message

## Critical Implementation Notes

### Credit System Logic:
```typescript
// When creating video, deduct credits in this order:
1. Check if user has enough total credits (subscription + overage)
2. If insufficient, return error
3. Deduct from subscription_credits first
4. If subscription_credits insufficient, deduct remainder from overage_credits
5. Log transaction in credit_transactions table
6. Update user_credit_balance table
```

### Monthly Credit Reset:
```typescript
// Stripe webhook: invoice.paid (subscription renewal)
1. Verify subscription is active
2. Reset subscription_credits to plan amount (30 for Professional, 10 for Starter)
3. Keep overage_credits unchanged
4. Update last_reset_at and next_reset_at timestamps
5. Log transaction
```

### File Upload Security:
```typescript
// When user uploads logo:
1. Validate file type (PNG, JPG, JPEG, SVG only)
2. Validate file size (max 10MB)
3. Generate unique filename: logo_{uuid}.{ext}
4. Upload to Supabase Storage /logos/ directory
5. Return signed URL or public URL
6. Store URL in database
```

### Error Handling Strategy:
```typescript
// All API routes should:
try {
  // Validate input
  // Check authentication
  // Perform operation
  // Return success response
} catch (error) {
  console.error('Error in [operation]:', error);
  
  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  if (error instanceof AuthError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Log to error tracking service (future: Sentry)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Testing Requirements

### Manual Testing Checklist:
- [ ] User can register and receive verification email
- [ ] User can login with correct credentials
- [ ] User cannot access dashboard without logging in
- [ ] User can reset password via email
- [ ] User can create video with valid inputs
- [ ] User cannot create video with insufficient credits
- [ ] Video status updates correctly when n8n completes
- [ ] User receives email when video is ready
- [ ] User can download completed videos
- [ ] User can subscribe to a plan via Stripe
- [ ] Credits are granted immediately on subscription
- [ ] User can view billing history
- [ ] User can cancel subscription
- [ ] Credits reset correctly on monthly renewal
- [ ] Failed payments are handled gracefully
- [ ] User can update account settings
- [ ] File uploads work correctly to R2
- [ ] Forms validate inputs properly
- [ ] Error messages are clear and helpful
- [ ] Mobile responsiveness works on key pages

### Edge Cases to Handle:
- User creates video, leaves page, comes back (show status)
- Payment fails mid-checkout (graceful error)
- n8n webhook fails (retry mechanism or manual intervention)
- User runs out of credits mid-creation (validate before submission)
- File upload fails (show error, don't charge credits)
- User tries to access other user's videos (403 Forbidden)
- Database connection fails (graceful error, retry)
- Stripe webhook signature invalid (reject, log)

## Deployment Checklist

### Before First Deploy:
- [ ] Set all environment variables in Vercel
- [ ] Run database migrations in Supabase
- [ ] Test Stripe in test mode first
- [ ] Set up Stripe webhook endpoint in Stripe dashboard
- [ ] Configure Supabase Storage CORS for your domain
- [ ] Set up email service (Resend/SendGrid) and verify domain
- [ ] Test n8n webhook connectivity
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure custom domain (if ready)
- [ ] Enable Vercel analytics (optional)

### Post-Deploy Verification:
- [ ] Test complete signup → video creation → payment flow
- [ ] Verify all webhooks are receiving events
- [ ] Check error logs for any issues
- [ ] Test on mobile devices
- [ ] Verify emails are sending correctly
- [ ] Test all payment flows (subscribe, cancel, upgrade)

## Questions for Me (If Needed)

As you develop, feel free to ask me:
- Specific design/UX decisions not covered in PRD
- Business logic clarifications
- Integration credentials (I'll provide)
- Priority of features if time is tight
- Testing scenarios you're unsure about

## Getting Started

**Your first steps should be:**

1. **Review the PRD thoroughly** - I'll provide this document which has all detailed specs, database schemas, and API documentation

2. **Create a development plan** - Break down the work into logical, testable increments. Show me your plan before starting implementation.

3. **Set up the project** - Initialize Next.js, install dependencies, configure TypeScript and Tailwind

4. **Create database schema** - Set up Supabase and run migrations

5. **Build authentication** - This is the foundation for everything else

6. **Implement incrementally** - Build one feature at a time, test thoroughly, then move to next

7. **Keep me updated** - Let me know when you complete major milestones or encounter blockers

## Success Criteria

The project is complete when:
- ✅ Users can register, login, and manage their account
- ✅ Users can create videos through the multi-step form
- ✅ Videos are processed by n8n and status updates correctly
- ✅ Users can subscribe to plans via Stripe
- ✅ Credit system works correctly (deduction, reset, tracking)
- ✅ Users can view their video library and download videos
- ✅ All webhooks are functional (Stripe, n8n)
- ✅ Application is deployed to Vercel and accessible
- ✅ All critical flows are tested and working
- ✅ Code is clean, documented, and maintainable

## Ready to Start?

Once I provide you with the PRD document and any additional clarifications, please:

1. **Confirm you understand the requirements**
2. **Create a detailed development plan** with estimated timeline
3. **Ask any questions** about unclear aspects
4. **Begin implementation** in the order we agree upon

Let's build this! 🚀
