# Logo Animation Pro - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Phase 1 & 2 Specification  
**Product Owner:** [Your Name]

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas](#3-user-personas)
4. [System Architecture](#4-system-architecture)
5. [Phase 1: Manual MVP](#5-phase-1-manual-mvp)
6. [Phase 2: Self-Service Platform](#6-phase-2-self-service-platform)
7. [Data Models](#7-data-models)
8. [API Specifications](#8-api-specifications)
9. [Integration Requirements](#9-integration-requirements)
10. [Security & Compliance](#10-security--compliance)
11. [Performance Requirements](#11-performance-requirements)
12. [Success Metrics](#12-success-metrics)
13. [Future Considerations](#13-future-considerations)

---

## 1. Executive Summary

### 1.1 Product Overview
Logo Animation Pro is a SaaS platform that generates professional logo animations using AI (Veo 3 API). Users upload their logo, select style preferences, and receive high-quality animated videos in minutes.

### 1.2 Target Market
- Small business owners
- Marketing agencies
- Freelance designers
- Social media managers
- Brand consultants

### 1.3 Core Value Proposition
Professional logo animations at $3-5 per video (vs $100-500 from freelancers) with 15-minute turnaround time.

### 1.4 Business Model
Tiered subscription with credit-based system:
- **Pay-as-you-go:** $5 per video
- **Starter:** $30/month (10 credits)
- **Professional:** $80/month (30 credits)
- **Enterprise:** $200/month (100 credits)

1 credit = 1 video (veo3_fast) or 0.5 video (veo3_quality)

---

## 2. Product Vision & Goals

### 2.1 Launch Goals (First 3 Months)
- Achieve 50+ paying customers
- Reach $2,000+ MRR
- Create 200+ videos successfully
- Maintain <5% refund rate
- Gather user feedback for improvements

### 2.2 Growth Goals (Months 4-6)
- Scale to 150+ customers
- Achieve $8,000+ MRR
- Process 1,000+ videos
- Add advanced features based on feedback
- Expand to additional video types (social ads)

### 2.3 Success Criteria
- **Month 1:** 20 customers, 50 videos created, $800 MRR
- **Month 3:** 50 customers, 200+ videos created, $2,000 MRR
- **Month 6:** 150 customers, 1,000+ videos created, $8,000 MRR, <3% refund rate

---

## 3. User Personas

### 3.1 Primary Persona: "Agency Amy"
- **Role:** Marketing Agency Owner
- **Age:** 32-45
- **Tech Savvy:** Medium-High
- **Needs:** 
  - Quick turnaround for client deliverables
  - Professional quality at scale
  - Easy billing/subscription management
- **Pain Points:** 
  - Freelancers are expensive and slow
  - Client demands last-minute changes
  - Needs consistent quality across multiple clients

### 3.2 Secondary Persona: "Small Business Sam"
- **Role:** Small Business Owner
- **Age:** 28-55
- **Tech Savvy:** Low-Medium
- **Needs:** 
  - One-off logo animation for website/social media
  - Simple, fast process
  - Affordable pricing
- **Pain Points:** 
  - Can't afford agency rates
  - Doesn't know how to create animations
  - Limited time to learn new tools

### 3.3 Tertiary Persona: "Freelance Fran"
- **Role:** Freelance Designer/Marketer
- **Age:** 25-40
- **Tech Savvy:** High
- **Needs:** 
  - White-label solution for client projects
  - Reliable, repeatable results
  - Volume pricing
- **Pain Points:** 
  - Needs to differentiate from competitors
  - Client budgets are tight
  - Time is money

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Landing Page │  │ Order Form   │  │ User Portal  │     │
│  │  (Phase 1)   │  │  (Phase 1)   │  │  (Phase 2)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Phase 2: Web Application                 │  │
│  │  - Authentication (Supabase Auth)                     │  │
│  │  - Dashboard UI (Next.js/React)                       │  │
│  │  - Credit Management                                  │  │
│  │  - Payment Processing (Stripe)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     AUTOMATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   n8n Workflows                       │  │
│  │  - Video Generation Orchestration                     │  │
│  │  - Prompt Engineering                                 │  │
│  │  - Veo API Integration                                │  │
│  │  - File Processing & Storage                          │  │
│  │  - Email Notifications                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA & STORAGE LAYER                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Supabase   │  │ Cloudflare  │  │  Stripe          │   │
│  │  PostgreSQL │  │  R2 Storage │  │  (Payments)      │   │
│  │  (User Data)│  │  (Videos)   │  │                  │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Veo API   │  │   Resend  │  │  Typeform        │   │
│  │ (Video Gen) │  │   (Email)   │  │  (Phase 1 Forms) │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

**Frontend:**
- Framework: Next.js 14+ with TypeScript
- UI Library: React
- Styling: Tailwind CSS
- Components: shadcn/ui
- Form Management: React Hook Form + Zod validation

**Backend:**
- API: Next.js API Routes (serverless)
- Automation: n8n (existing VPS, webhook triggered)

**Database & Services:**
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Payments: Stripe (Subscriptions + Customer Portal)
- Email: Resend
- Video Generation: Veo 3 API (via n8n)

**Infrastructure:**
- Hosting: Vercel
- Environment: Node.js 18+
- Package Manager: pnpm (preferred) or npm

**Development Tools:**
- Linting: ESLint
- Formatting: Prettier
- Type Checking: TypeScript strict mode
- Version Control: Git with conventional commits

---

## 5. User Flows & Features

### 5.0 Public Landing Page

**Purpose:** Convert visitors into registered users and paying customers

**Pages Required:**

#### 5.0.1 Homepage
```
┌─────────────────────────────────────────────────────────┐
│  ANIMATION LABS                    [Login] [Get Started]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│        Professional Logo Animations in Minutes          │
│               Starting at $3 per video                  │
│                                                         │
│              [Get Started Free] [See Examples]          │
│                                                         │
│        🎬 [Autoplay Example Video Loop]                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  How It Works                                           │
│                                                         │
│  1️⃣ Upload Logo    2️⃣ Choose Style    3️⃣ Get Video     │
│  2 minutes         AI-powered        Download now       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Pricing                                                │
│                                                         │
│  [Starter]      [Professional]     [Enterprise]         │
│  $30/month      $80/month          $200/month          │
│  10 videos      30 videos          100 videos          │
│  $3 each        $2.67 each         $2 each             │
│                                                         │
│  [Get Started] [Get Started]  [Get Started]            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Examples Gallery                                       │
│                                                         │
│  [Video 1] [Video 2] [Video 3] [Video 4] [Video 5]     │
│  [See More Examples →]                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Hero section with clear value proposition
- Autoplay example video showcasing quality
- "How It Works" 3-step visual guide
- Pricing comparison table
- Video examples gallery
- Trust signals (testimonials when available)
- Clear CTAs throughout

#### 5.0.2 Examples Page
- Grid of example videos (9-12 videos)
- Filter by style (Cinematic, Modern, Tech, etc.)
- Video player modal on click
- CTA: "Create your own" after viewing

#### 5.0.3 Pricing Page
- Detailed tier comparison table
- FAQ section
- Feature checklist per tier
- "Try it free" or "Start with pay-as-you-go" CTA

**Technical Requirements:**
- Fast page load (<2 seconds LCP)
- Mobile responsive
- SEO optimized (meta tags, structured data)
- Analytics tracking (Vercel Analytics or similar)
- A/B testing ready (feature flags)

---

### 5.1 Overview
Animation Labs is a self-service web application where users can create accounts, manage credits, create videos autonomously, and track their order history. The platform handles everything from user registration through video delivery automatically.

### 5.2 User Flows

#### 5.2.1 New User Registration Flow

```
1. Land on homepage
   ↓
2. Click "Get Started" or "Sign Up"
   ↓
3. Registration Form:
   - Email
   - Password
   - Confirm Password
   - [ ] Agree to Terms & Privacy Policy
   ↓
4. Email Verification
   - Send verification email
   - User clicks link
   ↓
5. Welcome Screen:
   - "Welcome to Logo Animation Pro!"
   - "Choose your plan to get started"
   ↓
6. Plan Selection (if not already chosen)
   - Pay-as-you-go (default - no subscription)
   - Starter - $30/month
   - Professional - $80/month
   ↓
7. Payment (if subscription selected)
   - Stripe Checkout
   ↓
8. Dashboard
   - Credits displayed
   - "Create Your First Video" CTA
```

#### 5.2.2 Returning User Login Flow

```
1. Land on homepage
   ↓
2. Click "Login"
   ↓
3. Login Form:
   - Email
   - Password
   - [ ] Remember me
   - "Forgot password?" link
   ↓
4. Dashboard
```

#### 5.2.3 Create Video Flow

```
1. Click "Create New Video" from dashboard
   ↓
2. Form - Step 1: Logo Upload
   - Drag & drop or browse
   - Preview uploaded logo
   - [ ] My logo contains text
   ↓
3. Form - Step 2: Brand Details
   - Brand name (auto-filled if saved)
   - Primary color (auto-detect or manual)
   - Secondary color (optional)
   ↓
4. Form - Step 3: Video Settings
   - Duration: 4s / 6s / 8s
   - Quality: Fast (1 credit) / Premium (2 credits)
   - Style preset dropdown
   ↓
5. Form - Step 4: Customization (optional)
   - Custom direction text area
   - Text overlay input
   - Text placement selection
   ↓
6. Review & Submit
   - Preview all selections
   - Credit cost displayed
   - "Create Video" button
   ↓
7. Processing Screen
   - "Your video is being created..."
   - Estimated time: ~15 minutes
   - Progress indicator
   - "We'll email you when it's ready"
   - Option to stay on page
   ↓
8. Completion
   - Video player preview
   - Download button
   - Share options
   - "Create Another Video" button
```

#### 5.2.4 Credit Management Flow

```
Dashboard displays:
- Current credit balance
- Progress bar visual
- "Top Up Credits" or "Upgrade Plan" buttons

If credits insufficient:
1. User tries to create video
   ↓
2. Modal: "Insufficient Credits"
   - You need X credits
   - You have Y credits
   - Options:
     a) Buy credits ($5/credit pay-as-you-go)
     b) Upgrade to Starter/Pro
   ↓
3. Payment/Upgrade flow
   ↓
4. Return to create video flow
```

---

### 5.3 Feature Requirements

#### 5.3.1 Authentication & User Management

**Registration:**
- Email + password authentication
- Email verification required
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, 1 number
- OAuth (optional for Phase 2.1):
  - Google Sign-In
  - GitHub Sign-In

**Login:**
- Email + password
- "Remember me" option (30-day session)
- Rate limiting: 5 failed attempts → 15-minute lockout

**Password Reset:**
- "Forgot password" link
- Send reset email with token (1-hour expiry)
- Reset password form
- Confirmation email after reset

**Session Management:**
- JWT tokens stored in httpOnly cookies
- 7-day session expiry (or 30 days with "remember me")
- Automatic logout on expiry with redirect to login

**User Profile:**
- View/edit email
- Change password
- Delete account (with confirmation + 30-day grace period)

---

#### 5.3.2 Dashboard

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Logo Animation Pro            [user@email.com ▼]       │
│  Dashboard | Videos | Account | Billing        [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Welcome back, [First Name]! 👋                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Credits Remaining: 28 / 30                       │ │
│  │  [████████████████████░░░░]  93%                 │ │
│  │                                                   │ │
│  │  Plan: Professional ($80/month)                   │ │
│  │  Next billing: February 15, 2026                  │ │
│  │                                                   │ │
│  │  [+ Create New Video]      [Manage Subscription]  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Recent Videos                          [View All →]    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Thumbnail] Client Logo A        Jan 20, 2026   │   │
│  │             6s • Cinematic Bold • Fast          │   │
│  │             [⬇ Download] [👁 Preview] [🗑 Delete]│   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Thumbnail] Holiday Promo        Jan 19, 2026   │   │
│  │             8s • Modern Minimal • Premium       │   │
│  │             [⬇ Download] [👁 Preview] [🗑 Delete]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Quick Stats (optional)                                 │
│  Videos created this month: 12                          │
│  Total videos: 45                                       │
│  Credits used this month: 12 / 30                       │
└─────────────────────────────────────────────────────────┘
```

**Key Components:**

1. **Credit Display**
   - Current balance / Total credits
   - Visual progress bar
   - Resets date
   - Warning if <3 credits remaining

2. **Quick Actions**
   - Create New Video (primary CTA)
   - Manage Subscription link

3. **Recent Videos**
   - Last 3 videos
   - Thumbnail preview
   - Download button
   - Preview in modal
   - Delete (with confirmation)

4. **Stats (Optional for Phase 2)**
   - Videos created this month
   - Total videos all-time
   - Average video duration

---

#### 5.3.3 Create Video Form

**Multi-step Form (4 steps)**

**Step 1: Upload Logo**

```
┌─────────────────────────────────────────────────┐
│  Create New Video - Step 1 of 4                 │
│  Upload Your Logo                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │   📁 Drag & drop your logo here         │   │
│  │        or click to browse               │   │
│  │                                         │   │
│  │   Accepted: PNG, JPG, SVG (max 10MB)    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Uploaded: logo.png (2.3 MB)]                  │
│  [Preview thumbnail]                            │
│                                                 │
│  ✨ Analyzing colors...                         │
│  ✓ Primary color detected: #FF5733              │
│  ✓ Secondary color detected: #33FF57            │
│                                                 │
│  [← Back]                    [Continue →]       │
└─────────────────────────────────────────────────┘
```

**Validation:**
- File size ≤ 10MB
- File type: PNG, JPG, JPEG, SVG
- Image dimensions: min 500x500px, max 4000x4000px

**Auto-Detection:**
- Extract primary and secondary colors automatically
- Use color extraction library (e.g., vibrant.js, color-thief)
- Show detected colors to user
- Allow manual override in next step

**Step 2: Brand Details**

```
┌─────────────────────────────────────────────────┐
│  Create New Video - Step 2 of 4                 │
│  Brand Details                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Brand Name * (Required)                         │
│  [________________________]                      │
│                                                 │
│  Primary Color (Auto-detected)                   │
│  [🎨 #FF5733] ✓ Detected from your logo         │
│  [Use Different Color] (optional)               │
│                                                 │
│  Secondary Color (Auto-detected, optional)       │
│  [🎨 #33FF57] ✓ Detected from your logo         │
│  [Use Different Color] [Skip]                   │
│                                                 │
│  💡 Colors were automatically extracted from     │
│     your logo. You can change them if needed.   │
│                                                 │
│  [← Back]                    [Continue →]       │
└─────────────────────────────────────────────────┘
```

**Validation:**
- Brand name: 1-50 characters, **REQUIRED**
- Colors: Valid hex codes (auto-populated, user can override)

**Defaults:**
- Primary color: Auto-extracted from logo (dominant color)
- Secondary color: Auto-extracted from logo (accent color) or null if not detected
- Both colors editable by user

**Step 3: Video Settings**

```
┌─────────────────────────────────────────────────┐
│  Create New Video - Step 3 of 4                 │
│  Video Settings                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Duration * (Required)                           │
│  ○ 4 seconds (Quick & punchy)                   │
│  ○ 6 seconds (Balanced)                         │
│  ● 8 seconds (Detailed - Recommended)           │
│                                                 │
│  Quality * (Required)                            │
│  ● Standard (1 credit) - Great for most uses    │
│  ○ Premium (2 credits) - Best quality           │
│                                                 │
│  Style (Optional - AI will choose if not set)   │
│  [Let AI choose automatically ▼]                │
│    • Let AI choose automatically (Recommended)  │
│    • Cinematic Bold                             │
│    • Modern Minimal                             │
│    • Energetic Tech                             │
│    • Elegant Luxury                             │
│    • Playful                                    │
│    • Retro                                      │
│                                                 │
│  💡 Our AI will create an amazing video even    │
│     with just your logo and brand name!         │
│                                                 │
│  [← Back]                    [Continue →]       │
└─────────────────────────────────────────────────┘
```

**Defaults:**
- Duration: **8 seconds** (pre-selected)
- Quality: **Standard** (pre-selected)
- Style: **Auto** (AI determines best style based on logo)

**Validation:**
- Duration: Must select one option
- Quality: Must select one option
- Style: Optional, defaults to "auto"

**Step 4: Customization (All Optional)**

```
┌─────────────────────────────────────────────────┐
│  Create New Video - Step 4 of 4                 │
│  Customization (All Optional)                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Custom Creative Direction (Optional)            │
│  [________________________________________]      │
│  [________________________________________]      │
│  [________________________________________]      │
│  0 / 200 characters                             │
│                                                 │
│  Examples:                                       │
│  • "Emphasize the swoosh, keep minimal"         │
│  • "Add energetic motion, tech-focused"         │
│  • "Slow, elegant reveal with luxury feel"      │
│                                                 │
│  Text Overlay (Optional)                         │
│  [________________________]                      │
│  Example: "Innovation Delivered" or "Est. 2020" │
│                                                 │
│  Display text: (Only if text overlay provided)   │
│  ○ At the end (last 2 seconds)                  │
│  ○ Throughout the video                         │
│                                                 │
│  💡 Skip this step and our AI will create an    │
│     amazing video based on your logo!           │
│                                                 │
│  [← Back]    [Skip & Review]    [Review Order →]│
└─────────────────────────────────────────────────┘
```

**Validation:**
- Custom direction: Max 200 characters (optional)
- Text overlay: Max 40 characters (optional)
- Text placement: Only required if text overlay is provided

**Note:** If user provides minimal info (just logo + brand name + defaults), the n8n workflow and prompt generation should intelligently create a great video by analyzing the logo and using sensible defaults.

**Review & Submit**

```
┌─────────────────────────────────────────────────┐
│  Review Your Order                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Logo Preview Thumbnail]                       │
│                                                 │
│  Brand: Acme Corporation                         │
│  Duration: 6 seconds                            │
│  Style: Cinematic Bold                          │
│  Quality: Premium                               │
│  Colors: #FF5733, #33FF57                       │
│  Text Overlay: "Innovation Delivered" (at end)  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Cost: 2 credits                        │   │
│  │  Your balance: 28 credits               │   │
│  │  New balance: 26 credits                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ⚠️ Estimated processing time: 10-15 minutes    │
│  We'll email you when your video is ready.      │
│                                                 │
│  [← Edit]          [Create Video (2 credits)]   │
└─────────────────────────────────────────────────┘
```

**On Submit:**
1. Deduct credits from user balance
2. Create database record with status "processing"
3. Trigger n8n webhook with all parameters
4. Redirect to processing screen

---

#### 5.3.4 Video Processing Screen

```
┌─────────────────────────────────────────────────┐
│  Creating Your Video... 🎬                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Animated spinner/progress animation]          │
│                                                 │
│  Your video is being created!                    │
│  Estimated time: 10-15 minutes                   │
│                                                 │
│  What's happening:                              │
│  ✓ Logo uploaded                                │
│  ✓ Prompt generated                             │
│  ⏳ AI generating video...                      │
│  ⏸ Quality check                                │
│  ⏸ Ready for download                           │
│                                                 │
│  We'll send you an email when it's ready.       │
│  You can close this page safely.                │
│                                                 │
│  [Go to Dashboard]       [Stay on This Page]    │
└─────────────────────────────────────────────────┘
```

**Technical Implementation:**
- WebSocket or polling every 30 seconds to check status
- Update progress indicators based on n8n workflow progress
- Auto-redirect to video page when complete

**Status Updates from n8n:**
```json
{
  "video_id": "vid_xxx",
  "status": "processing | completed | failed",
  "progress": {
    "upload": "completed",
    "prompt_generation": "completed",
    "ai_rendering": "in_progress",
    "quality_check": "pending",
    "ready": "pending"
  },
  "estimated_completion": "2026-01-23T11:45:00Z",
  "video_url": null // populated when ready
}
```

---

#### 5.3.5 Video Library (Videos Page)

```
┌─────────────────────────────────────────────────────────┐
│  Logo Animation Pro                     [user@email.com]│
│  Dashboard | Videos | Account | Billing        [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Videos                        [+ Create New Video]│
│                                                         │
│  Filters: [All ▼] [This Month ▼] [Completed ▼]        │
│  Search: [_________________] 🔍                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Thumbnail]  Acme Logo - Cinematic     Jan 20   │   │
│  │              6s • Premium • 2 credits           │   │
│  │              Status: ✅ Completed               │   │
│  │              [👁 Preview] [⬇ Download] [🗑]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Thumbnail]  TechCo Logo - Modern      Jan 19   │   │
│  │              8s • Fast • 1 credit               │   │
│  │              Status: ⏳ Processing (12 min left)│   │
│  │              [View Progress]                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Thumbnail]  RetailCo Logo - Playful   Jan 18   │   │
│  │              4s • Fast • 1 credit               │   │
│  │              Status: ❌ Failed                  │   │
│  │              Reason: API timeout                │   │
│  │              [🔄 Retry] [Contact Support]       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Load More]                          Showing 1-3 of 45 │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Grid/list view toggle
- Filter by:
  - Status (All, Completed, Processing, Failed)
  - Date range (Today, This Week, This Month, Custom)
  - Style
  - Duration
- Search by brand name
- Bulk actions (future):
  - Download multiple
  - Delete multiple

**Video Actions:**
1. **Preview:** Opens modal with video player
2. **Download:** Direct download link (or copy link)
3. **Delete:** Confirmation modal → soft delete (30-day retention)
4. **Retry (if failed):** Re-submit to n8n without charging credits

---

#### 5.3.6 Account Settings

```
┌─────────────────────────────────────────────────────────┐
│  Logo Animation Pro                     [user@email.com]│
│  Dashboard | Videos | Account | Billing        [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Account Settings                                        │
│                                                         │
│  ┌─ Profile ─────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Email                                            │ │
│  │  user@example.com                 [Change Email] │ │
│  │                                                   │ │
│  │  Password                                         │ │
│  │  ••••••••••••                     [Change Password]│ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Notifications ───────────────────────────────────┐ │
│  │                                                   │ │
│  │  ☑ Email me when video is ready                  │ │
│  │  ☑ Weekly usage summary                          │ │
│  │  ☐ Product updates & tips                        │ │
│  │  ☐ Promotional emails                            │ │
│  │                                                   │ │
│  │  [Save Preferences]                               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Brand Kit (Optional - Phase 2.1) ───────────────┐ │
│  │                                                   │ │
│  │  Save default settings for faster video creation │ │
│  │                                                   │ │
│  │  Default Logo: [Upload]                          │ │
│  │  Default Colors: [#FF5733] [#33FF57]             │ │
│  │  Preferred Style: [Modern Minimal ▼]             │ │
│  │  Preferred Duration: [6 seconds ▼]               │ │
│  │                                                   │ │
│  │  [Save Brand Kit]                                 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Danger Zone ─────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Delete Account                                   │ │
│  │  Permanently delete your account and all videos.  │ │
│  │  [Delete My Account]                              │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Features:**

1. **Profile Management**
   - Change email (requires verification)
   - Change password (requires current password)
   - Display user since date

2. **Notification Preferences**
   - Video completion emails
   - Usage summaries
   - Product updates
   - Promotional content

3. **Brand Kit (Optional)**
   - Save default logo
   - Save default colors
   - Save preferred style/duration
   - One-click video creation with saved defaults

4. **Account Deletion**
   - Requires confirmation
   - 30-day grace period before permanent deletion
   - Export data option (GDPR compliance)

---

#### 5.3.7 Billing & Subscription Management

```
┌─────────────────────────────────────────────────────────┐
│  Logo Animation Pro                     [user@email.com]│
│  Dashboard | Videos | Account | Billing        [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Billing & Subscription                                  │
│                                                         │
│  ┌─ Current Plan ────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Professional Plan                    $80/month   │ │
│  │  30 credits per month                             │ │
│  │                                                   │ │
│  │  Next billing date: February 15, 2026             │ │
│  │  Payment method: •••• 4242                        │ │
│  │                                                   │ │
│  │  [Change Plan] [Update Payment Method] [Cancel]   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Usage This Period ───────────────────────────────┐ │
│  │                                                   │ │
│  │  Credits used: 12 / 30                            │ │
│  │  [████████░░░░░░░░░░░░░░░░░] 40%                │ │
│  │                                                   │ │
│  │  Videos created: 10                               │ │
│  │  • Fast quality: 8 (8 credits)                    │ │
│  │  • Premium quality: 2 (4 credits)                 │ │
│  │                                                   │ │
│  │  Billing period: Jan 15 - Feb 15, 2026            │ │
│  │  Resets in: 23 days                               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Overage Credits ─────────────────────────────────┐ │
│  │                                                   │ │
│  │  No overage credits used this period              │ │
│  │                                                   │ │
│  │  Need more credits?                               │ │
│  │  [Buy 10 Credits - $25] [Upgrade Plan]            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Billing History ─────────────────────────────────┐ │
│  │                                                   │ │
│  │  Jan 15, 2026  Subscription   $80.00  [Receipt]  │ │
│  │  Dec 15, 2025  Subscription   $80.00  [Receipt]  │ │
│  │  Nov 20, 2025  Extra Credits  $25.00  [Receipt]  │ │
│  │  Nov 15, 2025  Subscription   $80.00  [Receipt]  │ │
│  │                                                   │ │
│  │  [View All Invoices]                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Stripe Integration:**

1. **Subscription Management**
   - Use Stripe Customer Portal for:
     - Update payment method
     - Cancel subscription
     - Download invoices
   - Custom UI for:
     - Change plan (upgrade/downgrade)
     - View usage

2. **Plan Changes**
   - **Upgrade (Starter → Pro):**
     - Immediate access to new credit balance
     - Prorated charge for remainder of billing cycle
   - **Downgrade (Pro → Starter):**
     - Takes effect next billing cycle
     - Keep current credits until renewal
     - Warning if current usage > new tier limit

3. **Cancellation**
   - Subscription active until end of current period
   - Credits usable until expiry
   - Option to reactivate before expiry
   - Data retained for 90 days

4. **Payment Failures**
   - Retry 3 times over 7 days (Stripe automatic)
   - Email notifications on each failure
   - Account downgraded to pay-as-you-go after final failure
   - Credits frozen (can't create new videos)
   - 15-day grace period to update payment

---

#### 5.3.8 Credit System Implementation

**Database Schema (credits table):**

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for additions, negative for deductions
  transaction_type VARCHAR(50) NOT NULL, -- 'subscription_grant', 'video_creation', 'overage_purchase', 'refund', 'adjustment'
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_credit_balance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_credits INTEGER DEFAULT 0, -- monthly allocation
  overage_credits INTEGER DEFAULT 0, -- purchased credits
  total_credits INTEGER GENERATED ALWAYS AS (subscription_credits + overage_credits) STORED,
  last_reset_at TIMESTAMP,
  next_reset_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Credit Logic:**

1. **Monthly Reset (Subscription Users)**
   - Triggered by cron job or Stripe webhook on billing cycle
   - Reset subscription_credits to plan amount
   - Overage credits persist (don't reset)
   - Update last_reset_at and next_reset_at

2. **Video Creation Deduction**
   - Check if user has sufficient credits (subscription + overage)
   - Deduct from subscription_credits first
   - If insufficient, deduct from overage_credits
   - If still insufficient, reject and prompt upgrade/purchase

3. **Overage Purchase**
   - Add to overage_credits
   - Never expires
   - Can be used across billing cycles

4. **Refunds/Adjustments**
   - Manual credit additions by admin
   - Logged in credit_transactions table

**Credit Check API:**

```typescript
async function checkAndDeductCredits(userId: string, creditsRequired: number): Promise<boolean> {
  const balance = await getUserCreditBalance(userId);
  
  if (balance.total_credits < creditsRequired) {
    return false; // Insufficient credits
  }
  
  let remaining = creditsRequired;
  
  // Deduct from subscription credits first
  if (balance.subscription_credits > 0) {
    const deduction = Math.min(balance.subscription_credits, remaining);
    await updateCredits(userId, { subscription_credits: -deduction });
    remaining -= deduction;
  }
  
  // Deduct remainder from overage credits
  if (remaining > 0) {
    await updateCredits(userId, { overage_credits: -remaining });
  }
  
  // Log transaction
  await logCreditTransaction(userId, -creditsRequired, 'video_creation');
  
  return true;
}
```

---

### 5.4 n8n Webhook Integration

**Webhook Endpoint:** `POST https://n8n.yourdomain.com/webhook/create-video`

**Request Payload:**

```json
{
  "video_id": "vid_abc123xyz",
  "user_id": "usr_xyz789abc",
  "user_email": "user@example.com",
  "brand_name": "Acme Corporation",
  "logo_url": "https://storage.supabase.com/logos/logo_abc123.png",
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "duration": 8,
  "quality": "standard",
  "style": "auto",
  "custom_notes": null,
  "text_overlay": null,
  "text_placement": null
}
```

**Intelligent Prompt Generation:**

When user provides minimal information (just logo + brand name + defaults), the n8n workflow should:

1. **Analyze the logo:**
   - Detect if logo contains text
   - Identify dominant shapes (geometric, organic, abstract)
   - Determine color palette complexity
   - Assess overall style (modern, vintage, playful, corporate)

2. **Generate appropriate prompt:**
   ```
   Minimal input: 
   - Brand: "Acme Corp"
   - Logo: [uploaded file]
   - Colors: Auto-detected
   - Duration: 8s
   - Style: Auto
   
   Generated prompt should include:
   - Professional, modern animation
   - Emphasize detected dominant elements
   - Use detected colors effectively
   - Match brand industry if detectable
   - Add suitable motion for logo type
   - Include appropriate transitions
   ```

3. **Style Selection Logic:**
   - If `style === "auto"`: Analyze logo and choose best style
   - Geometric logos → Modern Minimal or Cinematic Bold
   - Colorful logos → Energetic Tech or Playful
   - Monochrome logos → Elegant Luxury or Modern Minimal
   - Text-heavy logos → Cinematic Bold with text emphasis

4. **Fallback Prompt Template:**
   ```
   When ALL optional fields are empty:
   "Create a professional {duration}-second logo animation for {brand_name}.
   The logo features {color_description}. Style should be modern and clean,
   with smooth transitions and professional motion. Emphasize the main
   elements of the logo with dynamic camera movement and subtle effects.
   Background should be {background_color}. Keep it elegant and impactful."
   ```

**n8n Workflow Steps:**

1. **Webhook Trigger**
   - Receive request
   - Validate payload
   - Respond immediately with 200 OK

2. **Update Video Status**
   - Call app API: `PATCH /api/videos/{video_id}` with status "processing"

3. **Download Logo**
   - Fetch logo from Supabase Storage URL
   - Save to local temp directory

4. **Analyze Logo (if style === "auto" or minimal input)**
   - Extract colors (if not provided)
   - Detect text presence
   - Identify logo style characteristics
   - Determine optimal animation approach

5. **Generate Prompt**
   - Use style template if style is specified
   - Generate intelligent prompt if style is "auto"
   - Inject brand name, colors, duration
   - Add custom notes if provided
   - Add text overlay instructions if provided

6. **Call Veo API**
   - Submit prompt
   - Quality tier: veo3_fast (standard) or veo3_quality (premium)
   - Poll for completion or use webhook

7. **Quality Check**
   - Basic validation:
     - Video file integrity
     - Duration matches request
     - File size reasonable

8. **Upload to Storage**
   - Upload rendered video to Supabase Storage
   - Upload thumbnail to Supabase Storage
   - Generate public URLs

9. **Update Database**
   - Call app API: `PATCH /api/videos/{video_id}` with:
     - status: "completed"
     - video_url: storage URL
     - thumbnail_url: thumbnail storage URL
     - completed_at: timestamp

10. **Send Email Notification**
    - Use Resend
    - Template: "Your video is ready!"
    - Include download link

**Error Handling:**

If any step fails:
1. Update video status to "failed"
2. Log error details
3. Send notification to user with:
   - Explanation of failure
   - Credits refunded automatically
   - Option to retry or contact support
4. Alert product owner

**Retry Logic:**
- API failures: 3 retries with exponential backoff
- Temporary failures: Queue for manual review
- Permanent failures: Refund credits, notify user

---

### 5.5 Phase 2 API Endpoints

**Base URL:** `https://api.logoanimationpro.com/v1`

#### 5.5.1 Authentication

**POST /auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}

Response (201):
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "created_at": "2026-01-23T10:00:00Z"
  },
  "message": "Verification email sent"
}
```

**POST /auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}

Response (200):
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "dGhpcyBp..."
}
```

**POST /auth/logout**
```json
Response (200):
{
  "message": "Logged out successfully"
}
```

**POST /auth/forgot-password**
```json
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset email sent"
}
```

**POST /auth/reset-password**
```json
Request:
{
  "token": "reset_token_xyz",
  "new_password": "NewSecureP@ss123"
}

Response (200):
{
  "message": "Password reset successful"
}
```

---

#### 5.5.2 User Management

**GET /users/me**
```json
Response (200):
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "subscription": {
    "plan": "professional",
    "status": "active",
    "credits": {
      "subscription": 28,
      "overage": 5,
      "total": 33
    },
    "next_billing_date": "2026-02-15",
    "next_reset_date": "2026-02-15"
  },
  "created_at": "2025-10-01T09:00:00Z"
}
```

**PATCH /users/me**
```json
Request:
{
  "email": "newemail@example.com"
}

Response (200):
{
  "message": "Verification email sent to newemail@example.com"
}
```

**POST /users/me/change-password**
```json
Request:
{
  "current_password": "OldP@ss123",
  "new_password": "NewP@ss123"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

**DELETE /users/me**
```json
Response (200):
{
  "message": "Account deletion scheduled. You have 30 days to cancel."
}
```

---

#### 5.5.3 Videos

**POST /videos**
```json
Request (multipart/form-data):
{
  "logo": [File],
  "brand_name": "Acme Corp",
  "logo_has_text": true,
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "duration": 6,
  "quality": "premium",
  "style": "cinematic_bold",
  "custom_notes": "Keep it professional",
  "text_overlay": "Innovation Delivered",
  "text_placement": "end"
}

Response (201):
{
  "video": {
    "id": "vid_abc123",
    "status": "processing",
    "estimated_completion": "2026-01-23T11:15:00Z",
    "credits_used": 2
  },
  "user": {
    "credits_remaining": 26
  }
}
```

**GET /videos**
```json
Query Params:
?status=completed&limit=10&offset=0

Response (200):
{
  "videos": [
    {
      "id": "vid_abc123",
      "brand_name": "Acme Corp",
      "duration": 6,
      "quality": "premium",
      "style": "cinematic_bold",
      "status": "completed",
      "video_url": "https://storage.example.com/videos/vid_abc123.mp4",
      "thumbnail_url": "https://storage.example.com/thumbnails/vid_abc123.jpg",
      "credits_used": 2,
      "created_at": "2026-01-20T10:30:00Z",
      "completed_at": "2026-01-20T10:45:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

**GET /videos/:id**
```json
Response (200):
{
  "id": "vid_abc123",
  "brand_name": "Acme Corp",
  "logo_url": "https://storage.example.com/logos/logo_abc123.png",
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "duration": 6,
  "quality": "premium",
  "style": "cinematic_bold",
  "custom_notes": "Keep it professional",
  "text_overlay": "Innovation Delivered",
  "text_placement": "end",
  "status": "completed",
  "video_url": "https://storage.example.com/videos/vid_abc123.mp4",
  "thumbnail_url": "https://storage.example.com/thumbnails/vid_abc123.jpg",
  "credits_used": 2,
  "created_at": "2026-01-20T10:30:00Z",
  "completed_at": "2026-01-20T10:45:00Z"
}
```

**PATCH /videos/:id** (Internal - called by n8n)
```json
Request:
{
  "status": "completed",
  "video_url": "https://storage.example.com/videos/vid_abc123.mp4",
  "completed_at": "2026-01-20T10:45:00Z"
}

Response (200):
{
  "message": "Video updated successfully"
}
```

**DELETE /videos/:id**
```json
Response (200):
{
  "message": "Video deleted successfully"
}
```

---

#### 5.5.4 Credits

**GET /credits/balance**
```json
Response (200):
{
  "subscription_credits": 28,
  "overage_credits": 5,
  "total_credits": 33,
  "next_reset_date": "2026-02-15T00:00:00Z"
}
```

**GET /credits/transactions**
```json
Query Params:
?limit=20&offset=0

Response (200):
{
  "transactions": [
    {
      "id": "txn_abc123",
      "amount": -2,
      "type": "video_creation",
      "description": "Video created: Acme Corp - Cinematic Bold",
      "video_id": "vid_abc123",
      "created_at": "2026-01-20T10:30:00Z"
    },
    {
      "id": "txn_xyz789",
      "amount": 30,
      "type": "subscription_grant",
      "description": "Monthly credit allocation - Professional plan",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 85,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**POST /credits/purchase**
```json
Request:
{
  "amount": 10
}

Response (200):
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_xxx",
  "amount": 10,
  "price": 25.00
}
```

---

#### 5.5.5 Subscription

**GET /subscription**
```json
Response (200):
{
  "plan": "professional",
  "status": "active",
  "credits_per_month": 30,
  "price": 80.00,
  "currency": "USD",
  "billing_cycle": "monthly",
  "current_period_start": "2026-01-15T00:00:00Z",
  "current_period_end": "2026-02-15T00:00:00Z",
  "cancel_at_period_end": false,
  "payment_method": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2028
  }
}
```

**POST /subscription/create**
```json
Request:
{
  "plan": "professional"
}

Response (200):
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

**PATCH /subscription/change-plan**
```json
Request:
{
  "new_plan": "starter"
}

Response (200):
{
  "message": "Plan change will take effect on 2026-02-15",
  "new_plan": "starter",
  "effective_date": "2026-02-15T00:00:00Z"
}
```

**POST /subscription/cancel**
```json
Response (200):
{
  "message": "Subscription will cancel on 2026-02-15",
  "cancel_at": "2026-02-15T00:00:00Z"
}
```

**GET /subscription/portal**
```json
Response (200):
{
  "portal_url": "https://billing.stripe.com/p/session/xxx"
}
```

---

## 7. Data Models

### 7.1 Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  stripe_customer_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
```

### 7.2 Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(50) NOT NULL, -- 'starter', 'professional', 'enterprise'
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

### 7.3 Videos Table

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name VARCHAR(100) NOT NULL,
  logo_url TEXT NOT NULL,
  logo_has_text BOOLEAN DEFAULT FALSE,
  primary_color VARCHAR(7), -- hex color
  secondary_color VARCHAR(7),
  duration INTEGER NOT NULL, -- 4, 6, or 8 seconds
  quality VARCHAR(20) NOT NULL, -- 'fast', 'premium'
  style VARCHAR(50) NOT NULL,
  custom_notes TEXT,
  text_overlay VARCHAR(100),
  text_placement VARCHAR(20), -- 'end', 'throughout'
  status VARCHAR(50) NOT NULL, -- 'processing', 'completed', 'failed'
  video_url TEXT,
  thumbnail_url TEXT,
  credits_used INTEGER NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  deleted_at TIMESTAMP NULL -- Soft delete
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

### 7.4 Credit Balance Table

```sql
CREATE TABLE user_credit_balance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_credits INTEGER DEFAULT 0,
  overage_credits INTEGER DEFAULT 0,
  total_credits INTEGER GENERATED ALWAYS AS (subscription_credits + overage_credits) STORED,
  last_reset_at TIMESTAMP,
  next_reset_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.5 Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

### 7.6 Invoices Table (Stripe Data Cache)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- 'paid', 'open', 'void', 'uncollectible'
  invoice_pdf TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);
```

---

## 8. API Specifications

### 8.1 Authentication Flow

```
1. User submits email/password
   ↓
2. Verify credentials against database
   ↓
3. Generate JWT access token (15 min expiry)
4. Generate JWT refresh token (7 day expiry)
   ↓
5. Return tokens to client
   ↓
6. Client stores tokens in httpOnly cookies
   ↓
7. Client includes access token in Authorization header for API requests
   ↓
8. When access token expires:
   - Client calls /auth/refresh with refresh token
   - Get new access token
   - Continue requests
```

### 8.2 File Upload Flow

```
1. Client selects file
   ↓
2. Validate file client-side:
   - File type (PNG, JPG, SVG)
   - File size (max 10MB)
   - Image dimensions (min 500x500)
   ↓
3. POST /videos with multipart/form-data
   ↓
4. Server validates file server-side
   ↓
5. Generate unique filename: logo_{uuid}.{ext}
   ↓
6. Upload to Supabase Storage /logos/ directory
   ↓
7. Store logo_url in database
   ↓
8. Return logo_url to client
```

### 8.3 Video Creation Flow

```
1. User submits video creation form
   ↓
2. Client validates all required fields
   ↓
3. POST /videos with form data + logo file
   ↓
4. Server:
   a. Validates user authentication
   b. Checks credit balance
   c. Deducts credits
   d. Uploads logo to storage
   e. Creates video record in DB with status "processing"
   f. Triggers n8n webhook
   ↓
5. Return video_id and status to client
   ↓
6. Client redirects to processing screen
   ↓
7. Client polls GET /videos/:id every 30 seconds
   ↓
8. n8n workflow:
   a. Generates prompt
   b. Calls Veo API
   c. Uploads rendered video
   d. Updates DB via PATCH /videos/:id
   e. Sends email notification
   ↓
9. When status changes to "completed":
   - Client displays video player
   - Provides download link
```

### 8.4 Subscription Flow

```
1. User selects plan on frontend
   ↓
2. POST /subscription/create with plan
   ↓
3. Server creates Stripe Checkout Session
   ↓
4. Return checkout_url to client
   ↓
5. Client redirects to Stripe Checkout
   ↓
6. User completes payment on Stripe
   ↓
7. Stripe webhook: checkout.session.completed
   ↓
8. Server:
   a. Creates subscription record
   b. Grants credits to user
   c. Sends welcome email
   ↓
9. Stripe redirects user back to app
   ↓
10. Client shows success message + credits
```

---

## 9. Integration Requirements

### 9.1 Stripe Integration

**Required Webhooks:**

1. `checkout.session.completed`
   - Trigger: New subscription purchased
   - Action: Create subscription record, grant credits

2. `invoice.paid`
   - Trigger: Subscription renewed
   - Action: Grant monthly credits, update subscription record

3. `invoice.payment_failed`
   - Trigger: Payment declined
   - Action: Send notification, retry payment, freeze credits

4. `customer.subscription.updated`
   - Trigger: Plan changed
   - Action: Update subscription tier, adjust credits

5. `customer.subscription.deleted`
   - Trigger: Subscription canceled
   - Action: Mark subscription as canceled, set expiry date

**Stripe Products to Create:**

- **Starter Plan:** $30/month recurring
- **Professional Plan:** $80/month recurring
- **Enterprise Plan:** $200/month recurring
- **Credit Pack (10 credits):** $25 one-time

**Stripe Customer Portal:**
- Enable for payment method updates
- Enable for subscription cancellation
- Enable for invoice downloads

---

### 9.2 Email Service (Resend)

**Email Templates:**

1. **Welcome Email** (on registration)
   - Subject: Welcome to Animation Labs!
   - Content: Getting started guide, example videos, CTA to create first video

2. **Email Verification**
   - Subject: Verify your email address
   - Content: Verification link with token

3. **Password Reset**
   - Subject: Reset your password
   - Content: Reset link with token (1-hour expiry)

4. **Video Completed**
   - Subject: Your logo animation is ready! 🎬
   - Content: Download link, preview thumbnail, CTA to create another

5. **Video Failed**
   - Subject: Issue with your video creation
   - Content: Explanation, credits refunded, option to retry or contact support

6. **Low Credits Warning**
   - Subject: You're running low on credits
   - Content: Current balance, CTA to purchase more or upgrade

7. **Subscription Renewal**
   - Subject: Your subscription has renewed
   - Content: Invoice link, new credit balance, next billing date

8. **Payment Failed**
   - Subject: Payment issue with your subscription
   - Content: Update payment method link, retry information

9. **Subscription Canceled**
   - Subject: Your subscription has been canceled
   - Content: Access until end date, option to reactivate

10. **Monthly Usage Summary** (optional)
    - Subject: Your Animation Labs monthly summary
    - Content: Videos created, credits used, top styles

**Implementation:**
- Use Resend API (https://resend.com)
- Create React Email templates for all emails
- Store templates in `/emails` directory
- Use environment variable: `RESEND_API_KEY`

---

### 9.3 File Storage (Supabase Storage)

**Bucket Structure:**

```
logo-animation-pro/
├── logos/
│   ├── logo_uuid1.png
│   ├── logo_uuid2.jpg
│   └── logo_uuid3.svg
├── videos/
│   ├── vid_uuid1.mp4
│   ├── vid_uuid2.mp4
│   └── vid_uuid3.mp4
└── thumbnails/
    ├── vid_uuid1.jpg
    ├── vid_uuid2.jpg
    └── vid_uuid3.jpg
```

**Access Control:**
- Public read access for videos and thumbnails
- Private access for logos (user-specific with RLS policies)
- Signed URLs for temporary access (24-hour expiry)
- Row Level Security (RLS) policies control access

**Storage Configuration:**
- Supabase Storage with built-in CDN
- Enable caching for videos and thumbnails
- Max file size: 10MB for logos, 100MB for videos
- Automatic file type validation

---

### 9.4 Veo API Integration (via n8n)

**API Call Structure:**

```javascript
// Example n8n HTTP Request node
{
  "method": "POST",
  "url": "https://api.veo.example.com/v1/generate",
  "headers": {
    "Authorization": "Bearer YOUR_VEO_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "prompt": generatedPrompt,
    "duration": 6,
    "quality": "veo3_fast", // or "veo3_quality"
    "aspect_ratio": "16:9",
    "webhook_url": "https://n8n.yourdomain.com/webhook/veo-callback"
  }
}
```

**Callback Handling:**
- Veo API calls webhook when rendering complete
- n8n receives callback
- Downloads video from Veo's storage
- Uploads to Supabase Storage
- Updates database via app API

**Error Scenarios:**
- API rate limit exceeded → Queue and retry
- Rendering timeout (>30 min) → Mark as failed, refund credits
- Invalid prompt → Mark as failed, send detailed error to user

---

## 10. Security & Compliance

### 10.1 Authentication & Authorization

**Password Security:**
- bcrypt hashing with 10 rounds
- Minimum password requirements enforced
- Rate limiting on login attempts

**Session Management:**
- JWT tokens with short expiry (15 min access, 7 day refresh)
- httpOnly cookies to prevent XSS
- CSRF protection on state-changing operations

**Authorization:**
- Users can only access their own videos
- Users can only modify their own account
- Admin endpoints require admin role

### 10.2 Data Protection

**Encryption:**
- TLS 1.3 for all API communication
- Encrypt sensitive data at rest (passwords, tokens)
- Signed URLs for file access with expiry

**GDPR Compliance:**
- Users can export all their data
- Users can delete their account and all data
- 30-day grace period before permanent deletion
- Clear privacy policy and data usage disclosure

**Data Retention:**
- Videos: 90 days after user deletion
- Logs: 30 days
- Invoices: 7 years (tax compliance)

### 10.3 Rate Limiting

**API Endpoints:**
- Authentication: 5 attempts per 15 minutes per IP
- Video creation: 10 requests per hour per user
- File uploads: 50 requests per hour per user
- General API: 1000 requests per hour per user

**n8n Webhooks:**
- Rate limit per user based on subscription tier
- Prevent abuse from automated scripts

---

## 11. Performance Requirements

### 11.1 Response Times

- Page load: <2 seconds (LCP)
- API responses: <500ms (p95)
- Video creation submission: <1 second
- Video rendering: 10-15 minutes average

### 11.2 Scalability

**Target Capacity (Phase 2):**
- 100 concurrent users
- 500 videos created per day
- 10,000 API requests per hour

**Database:**
- Optimized indexes on frequently queried columns
- Connection pooling (max 20 connections)
- Query optimization (<100ms for 95% of queries)

**File Storage:**
- Supabase Storage handles unlimited storage
- CDN caching for fast global delivery

**n8n Workflows:**
- Horizontal scaling with worker nodes if needed
- Queue system for high-volume periods

---

## 12. Success Metrics

### 12.1 Launch Metrics (First Month)

**Validation Metrics:**
- [ ] 20+ registered users
- [ ] 10+ paying customers
- [ ] 30+ videos created
- [ ] $400+ MRR
- [ ] <10% refund rate

**Product Metrics:**
- Registration completion rate: >60%
- Video creation completion rate: >80%
- Payment success rate: >95%
- Video quality success rate: >90%
- Average time to video delivery: <20 minutes
- Customer satisfaction: >4.0/5.0

### 12.2 Growth Metrics (Months 2-6)

**Business Metrics:**
- [ ] 150+ total users
- [ ] 75+ paying customers
- [ ] 500+ videos created
- [ ] $3,000+ MRR
- [ ] 50% of users on subscription plans
- [ ] 15% month-over-month growth

**Engagement Metrics:**
- Daily active users: 15%
- Weekly active users: 35%
- Monthly active users: 75%
- Average videos per user per month: 4
- Subscription retention: >80% after 3 months

**Technical Metrics:**
- API uptime: >99.5%
- Average API response time: <500ms
- Video rendering success rate: >95%
- Page load time: <2 seconds
- Mobile usage: >40% of traffic

**Financial Metrics:**
- Customer acquisition cost (CAC): <$50
- Lifetime value (LTV): >$250
- LTV:CAC ratio: >5:1
- Gross margin: >85%
- Monthly churn rate: <5%

### 12.3 Key Performance Indicators (KPIs)

**Weekly Tracking:**
- New user signups
- Videos created
- Revenue (MRR + one-time)
- Active paying subscribers
- Average video completion time

**Monthly Tracking:**
- MRR growth rate
- User retention rate
- Credit utilization rate (how many credits users use)
- Upgrade rate (free to paid)
- Referral rate

**Quarterly Tracking:**
- Customer lifetime value
- Customer acquisition cost
- Net promoter score (NPS)
- Feature adoption rates
- Platform stability metrics

---

## 13. Future Considerations

### 13.1 Phase 3 Features (After Product-Market Fit)

**Product Expansion:**
- [ ] Social media ad videos
- [ ] Product demo videos
- [ ] Explainer videos
- [ ] Multi-format export (1:1, 9:16, 4:5)
- [ ] Video editing (trim, add music, adjust speed)

**Platform Features:**
- [ ] Team accounts (agencies with multiple users)
- [ ] White-label portal
- [ ] API access for developers
- [ ] Webhook notifications (Slack, Discord)
- [ ] Brand kit library (save multiple logos/presets)
- [ ] Revision request system

**AI Improvements:**
- [ ] Auto-style selection based on logo analysis
- [ ] A/B testing different styles before rendering
- [ ] Background music library
- [ ] Voice-over generation

**Business Features:**
- [ ] Affiliate program
- [ ] Referral credits
- [ ] Annual subscription discounts
- [ ] Custom enterprise plans
- [ ] Volume discounts

### 13.2 Technical Debt to Address

- Migrate from manual n8n triggers to fully automated webhooks
- Implement comprehensive logging and monitoring (Sentry, LogRocket)
- Add analytics dashboard (Mixpanel, PostHog)
- Optimize database queries with caching (Redis)
- Implement CDN for API responses
- Add automated testing (unit, integration, e2e)

### 13.3 Scaling Considerations

**When to Scale Infrastructure:**
- 500+ users
- 5,000+ videos per month
- $20,000+ MRR

**Scaling Plan:**
- Move database to managed PostgreSQL (AWS RDS, Neon)
- Implement caching layer (Redis)
- Add queue system (BullMQ, RabbitMQ)
- Horizontal scaling for n8n workers
- Implement CDN for API (Cloudflare Workers)
- Add monitoring and alerting (DataDog, New Relic)

---

## Appendix

### A. Style Presets

**Cinematic Bold:**
```json
{
  "overall_style": "Cinematic, bold, dramatic. Moody lighting and deep shadows. Emphasis on strength and impact.",
  "camera_movement": "Slow dolly-in, dynamic arc rotation",
  "scene_elements": ["dramatic lighting", "shadow play", "metallic textures"],
  "music": "orchestral pulse with percussion",
  "intensity": 70
}
```

**Modern Minimal:**
```json
{
  "overall_style": "Clean, minimal, contemporary. Bright lighting and simple backgrounds. Emphasis on clarity and precision.",
  "camera_movement": "Smooth linear push, subtle rotation",
  "scene_elements": ["clean lines", "soft shadows", "geometric shapes"],
  "music": "ambient electronic minimalism",
  "intensity": 40
}
```

**Energetic Tech:**
```json
{
  "overall_style": "Dynamic, tech-forward, vibrant. Neon accents and digital effects. Emphasis on innovation and speed.",
  "camera_movement": "Fast zoom, quick rotation, glitch transitions",
  "scene_elements": ["neon glows", "circuit patterns", "particle effects"],
  "music": "upbeat electronic with synthetic bass",
  "intensity": 85
}
```

**Elegant Luxury:**
```json
{
  "overall_style": "Sophisticated, refined, luxurious. Soft lighting and elegant textures. Emphasis on quality and prestige.",
  "camera_movement": "Graceful arc, slow reveal",
  "scene_elements": ["golden accents", "subtle sparkles", "silk textures"],
  "music": "classical strings with piano",
  "intensity": 35
}
```

**Playful:**
```json
{
  "overall_style": "Fun, energetic, approachable. Bright colors and bouncy motion. Emphasis on joy and creativity.",
  "camera_movement": "Bouncy zoom, playful rotation",
  "scene_elements": ["confetti", "bright colors", "bouncing motion"],
  "music": "upbeat pop with whistles",
  "intensity": 75
}
```

**Retro:**
```json
{
  "overall_style": "Vintage, nostalgic, warm. Film grain and retro color grading. Emphasis on timelessness and heritage.",
  "camera_movement": "Gentle pan, subtle zoom",
  "scene_elements": ["film grain", "vintage textures", "warm color wash"],
  "music": "retro synth or jazz",
  "intensity": 50
}
```

---

### B. Development Timeline Estimate

**Phase 1 (Manual MVP):**
- Week 1: Landing page + order form setup (20 hours)
- Week 2: n8n workflow refinement + testing (15 hours)
- Week 3-8: Launch, marketing, manual fulfillment (ongoing)

**Phase 2 (Self-Service Platform):**
- Week 1-2: Database schema + API endpoints (40 hours)
- Week 3-4: Authentication + user management (30 hours)
- Week 5-6: Dashboard + video creation UI (40 hours)
- Week 7: Stripe integration + billing (20 hours)
- Week 8: n8n webhook integration + testing (20 hours)
- Week 9: Email templates + notifications (15 hours)
- Week 10: Bug fixes + polish (25 hours)

**Total Development Time: ~225 hours**

**Recommended Team:**
- 1 Full-stack developer (Next.js, PostgreSQL, Stripe)
- 1 Designer (UI/UX for landing page and app)
- Product owner (you) for workflow management and QA

**Cost Estimate:**
- DIY: 225 hours of your time
- Freelancer: $10,000-$20,000 (at $50-$100/hour)
- Agency: $25,000-$40,000

---

### C. Technology Alternatives

**Frontend Alternatives:**
- Next.js (Recommended) ✅
- Remix
- SvelteKit
- Astro + React

**Database Alternatives:**
- Supabase PostgreSQL (Recommended) ✅
- Neon PostgreSQL
- PlanetScale MySQL
- AWS RDS

**Auth Alternatives:**
- Supabase Auth (Recommended) ✅
- NextAuth.js
- Clerk
- Auth0

**File Storage Alternatives:**
- Supabase Storage (Recommended) ✅
- AWS S3
- Supabase Storage
- DigitalOcean Spaces

**Payment Alternatives:**
- Stripe (Recommended) ✅
- Paddle
- LemonSqueezy

**Email Alternatives:**
- Resend (Recommended) ✅
- Resend
- Postmark
- AWS SES

---

## End of PRD

**Document Owner:** [Your Name]  
**Last Updated:** January 23, 2026  
**Version:** 1.0  

For questions or clarifications, contact: [your email]
