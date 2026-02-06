# UX Specification: Animation Labs Logo Animation Platform

## Pass 1: Mental Model

**Primary user intent:** "I want a professional logo animation video as easily as ordering a product online — upload my logo, pick a style, and get a finished video in minutes."

**Likely misconceptions:**
- "I can preview the animation before committing credits" — Reality: No real-time preview; user sees final result after processing (5-10 min)
- "I can edit the video after it's created" — Reality: No post-creation editing; must create a new video if changes needed
- "I need video editing skills" — Reality: Zero editing knowledge required; it's a form-based product configurator
- "Animation styles are customizable with lots of options" — Reality: Pick one preset style + optional creative direction text, duration is fixed at 8 seconds
- "I can pause and resume the creation process" — Reality: Form state is lost on page refresh; must complete in one session

**UX principle to reinforce/correct:**
**Product configurator mental model, not video editor.** Every UI element should reinforce "configure → order → receive" rather than "create → edit → export." This is purchasing a service, not using a tool.

---

## Pass 2: Information Architecture

**All user-visible concepts:**
- Logo file (upload)
- Brand name (text that appears in video)
- Quality tier (Standard/Premium)
- Aspect ratio (16:9/9:16)
- Animation style (10+ preset options)
- Creative direction (optional AI prompt)
- Dialogue/voiceover type (None/Brand Name/Custom)
- Custom dialogue text (if selected)
- Video duration (fixed at 8 seconds, informational only)
- Credit balance (subscription + credit packs)
- Video library (all created videos)
- Video status (Pending/Processing/Completed/Failed)
- Email verification status
- Subscription plan (Starter/Professional)
- Credit packs (one-time purchases)
- Single credit trial ($5)

**Grouped structure:**

### Video Creation (Primary)
- **Logo file**: Primary — First and most essential input
  - Rationale: Without a logo, nothing else matters; leads the creation flow
- **Brand name**: Primary — Appears visually in all animations
  - Rationale: Core identifying text that appears in video
- **Animation style**: Primary — Most visible creative decision
  - Rationale: Determines the visual aesthetic; requires conscious choice
- **Quality tier**: Primary — Affects pricing and output quality
  - Rationale: Critical decision point (1 vs 2 credits); must be explicit
- **Aspect ratio**: Primary — Determines video format
  - Rationale: Platform-specific choice (YouTube vs Instagram); cannot be changed later
- **Video duration**: Hidden (progressive) — Fixed at 8 seconds, shown as informational text
  - Rationale: Not a choice, just context; doesn't require decision-making
- **Creative direction**: Secondary — Optional customization
  - Rationale: Power user feature; not required for basic usage
- **Dialogue/voiceover**: Secondary — Optional audio narration
  - Rationale: Enhancement, not requirement; some users want silent animations

### Account & Credits (Primary)
- **Credit balance**: Primary — Visible in navigation/dashboard
  - Rationale: Gate-keeping resource; must be constantly visible
- **Email verification status**: Primary — Blocks access if unverified
  - Rationale: Critical requirement; persistent banner until resolved
- **Subscription plan**: Secondary — Manage in billing section
  - Rationale: Background system; users care about credits, not plans
- **Credit packs**: Secondary — Alternative credit source
  - Rationale: Optional supplement to subscriptions
- **Single credit trial**: Primary — Low-friction entry point
  - Rationale: Try-before-you-buy; prominently featured for new users

### Video Management (Primary)
- **Video library**: Primary — All created videos in dashboard
  - Rationale: Core output; users return here repeatedly
- **Video status**: Primary — Shown on each video card
  - Rationale: Essential state information; determines available actions
- **Download/view**: Primary — Available for completed videos
  - Rationale: Final deliverable; primary user goal

---

## Pass 3: Affordances

| Action | Visual/Interaction Signal |
|--------|---------------------------|
| Upload logo | Drag-and-drop zone with dashed border, cloud upload icon, "Drop file here or click to browse" text |
| Select quality tier | Radio buttons with clear labels "Standard (1 credit)" vs "Premium (2 credits)" — credit cost visible in label |
| Select aspect ratio | Radio buttons with platform context: "16:9 Landscape — For YouTube, presentations" vs "9:16 Vertical — For Instagram, TikTok" |
| Choose animation style | Radio button grid or tiles with visual style icons/thumbnails, tooltip description on hover, "Preview all styles" link |
| Write creative direction | Textarea (multi-line input) with helper text "Optional: Describe customization..." and character counter |
| Add dialogue/voiceover | Radio buttons for None/Brand Name/Custom; conditional text input appears when "Custom" selected |
| Submit video creation | Large primary button "Create Video (X credits)" with credit cost in label, disabled if insufficient credits |
| Retry failed video | Secondary button "Retry" on failed video card (visually distinct from primary "Create Video" action) |
| Download completed video | Download icon button on completed video card, opens video player modal with download option |
| View video status | Color-coded badges on video cards: Gray "Pending" / Orange "Processing" / Green "Completed" / Red "Failed" |
| Verify email | Persistent yellow banner with "Verify Email" CTA button, dismissible but reappears until verified |
| Buy credits | "Buy Credits" button in navigation (always visible), opens billing page |

**Affordance rules:**
- If user sees a radio button, they must pick exactly one option (no multi-select confusion)
- If user sees a textarea, they can write multi-line text (unlike single-line inputs)
- If user sees a file dropzone with dashed border, they can drag-and-drop OR click
- If user sees a disabled button with insufficient credits message, they cannot proceed (gate-keeping is explicit)
- If user sees a status badge, it's read-only information (not clickable/actionable)
- If user sees a video card, clicking it opens video player (entire card is clickable target)
- If user sees a "Retry" button on failed video, it's free (no additional credit charge implied)
- If user sees credit cost in button label ("Create Video (2 credits)"), that's the exact charge at submission

---

## Pass 4: Cognitive Load

**Friction points:**
| Moment | Type | Simplification |
|--------|------|----------------|
| "Which quality tier should I choose?" | Choice | Default to Standard (pre-selected). Show comparison: "Standard = High-quality 1080p" vs "Premium = Enhanced 1080p with superior rendering." Most users pick Standard. |
| "What should I write for creative direction?" | Uncertainty | Make textarea optional with placeholder "e.g., 'fast-paced and energetic' or 'minimal and elegant'". Future: Add guided questionnaire (see Known Gaps in PRD). |
| "What animation style is best for my brand?" | Choice | Add tooltip descriptions on each style + link to examples gallery page. Delay full exploration (progressive disclosure). |
| "How do I phrase custom dialogue text?" | Uncertainty | Show example: "e.g., 'Welcome to [Brand]' or 'Innovative solutions for you'". Add character counter to prevent over-writing. |
| "What aspect ratio do I need?" | Choice | Show platform context in label: "16:9 — For YouTube, presentations" vs "9:16 — For Instagram, TikTok". Most users know their target platform. |
| "Is my logo file good enough?" | Uncertainty | Show warning for small files: "File smaller than recommended (1000x1000px). Results may vary." But allow upload. |
| "When will my video be ready?" | Waiting | Show immediate confirmation: "Video creation started! You'll receive email in 5-10 minutes." Set expectation upfront. |
| "Do I have enough credits?" | Uncertainty | Show credit balance in navigation (always visible). Disable "Create Video" button if insufficient, with clear message. |
| "What if I don't like the result?" | Uncertainty | Clarify retry policy: Failed videos can retry free. Completed videos require new creation (no refunds). |

**Defaults introduced:**
- **Quality tier: Standard** — Most users don't need premium; saves decision time and credits
  - Rationale: 80% of users pick Standard based on comparable SaaS pricing patterns
- **Dialogue: None** — Most logo animations don't need voiceover; silent by default
  - Rationale: Audio is enhancement, not requirement; reduces complexity for basic use
- **Creative direction: Empty** — Optional field; blank is valid
  - Rationale: AI can generate good animations without user prompt; lowers barrier to entry
- **Video duration: 8 seconds (fixed, not a choice)** — Standardizes rendering and simplifies UX
  - Rationale: Removes paralysis of choice; 8 seconds is optimal for logo intros/outros

---

## Pass 5: State Design

### Video Card (Dashboard/Library)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty (no videos) | Empty state illustration + "Create your first video" CTA | "I haven't created any videos yet" | Click CTA to start creation flow |
| Loading (fetching list) | Skeleton cards (gray placeholder boxes) | "Videos are loading" | Wait (no action) |
| Pending | Gray badge "Pending", placeholder thumbnail, brand name, date | "Video is queued, not yet processing" | View details (no download yet) |
| Processing | Orange badge "Processing", placeholder thumbnail, animated spinner icon | "Video is being created, should be ready in 5-10 min" | View details, wait for email notification |
| Success (Completed) | Green badge "Completed", placeholder thumbnail, brand name, date, download icon | "Video is ready to view/download" | Click card to view player modal, click download icon |
| Partial (unverified email) | Persistent yellow banner above video list: "Verify email to create videos" | "I'm blocked from creating until I verify" | Click "Verify Email" in banner |
| Error (Failed) | Red badge "Failed", error icon, brand name, date | "Something went wrong, I can retry" | Click card to view error message + "Retry" button (free) or "Delete" button |

### Video Creation Form (Multi-step wizard)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty (Step 1 - Upload) | Dropzone with dashed border, cloud icon, "Drop file here" | "I need to upload a logo first" | Drag-and-drop file or click to browse |
| Loading (uploading file) | Progress bar in dropzone, "Uploading..." text | "File is uploading, don't navigate away" | Wait (form disabled) |
| Success (file uploaded) | Checkmark icon, file name displayed, auto-advance to Step 2 | "Upload succeeded, moving to next step" | Continue to Step 2 (automatic) |
| Partial (small file warning) | Yellow warning icon + tooltip "File smaller than 1000x1000px. Results may vary." | "My file is accepted but might not look great" | Proceed anyway or re-upload larger file |
| Error (upload failed) | Red error text below dropzone: "Upload failed. Try again." | "Something went wrong, I need to retry" | Click dropzone again to retry |
| Submitting (final step) | Button shows spinner, disabled, text changes to "Creating..." | "My video is being submitted, don't close page" | Wait (form disabled) |
| Success (submitted) | Toast notification "Video creation started! Check your email in 5-10 min", redirect to dashboard | "My order is placed, I'll get email when ready" | View video status in dashboard |

### Credit Balance Indicator (Navigation)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty (0 credits) | "0 credits" with red badge, "Buy Credits" button highlighted | "I'm out of credits, need to purchase" | Click "Buy Credits" to billing page |
| Low (1-5 credits) | "X credits" with yellow warning icon | "Running low, should buy more soon" | Continue using or buy more credits |
| Normal (6+ credits) | "X credits" with no special styling | "I have enough credits for several videos" | Create videos freely |
| Expiring soon (subscription) | "X credits expire [date]" yellow banner on dashboard | "My subscription credits expire at cycle end" | Use credits before expiration |

### Email Verification Blocker

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Unverified | Persistent yellow banner "Verify your email to create videos" + "Verify Email" button | "I'm blocked from video creation" | Click button to resend verification email |
| Pending verification | Yellow banner "Check your email to verify" (after clicking verify button) | "Verification email sent, I need to check inbox" | Open email and click verification link |
| Verified | No banner, full access to "Create Video" flow | "I'm unblocked, can create videos now" | Proceed with video creation |

---

## Pass 6: Flow Integrity

**Flow risks:**
| Risk | Where | Mitigation |
|------|-------|------------|
| User abandons form mid-creation | Multi-step wizard (Steps 1-4) | Show progress indicator (Step X of 4). Auto-save not implemented in MVP — warn user if they try to navigate away: "Changes will be lost. Continue?" browser prompt. |
| User doesn't understand credit system | First video creation attempt | Show credit balance in navigation (always visible). Tooltip on quality tiers: "Standard = 1 credit, Premium = 2 credits". Link to pricing page in navigation. |
| User creates video without verifying email | Dashboard/Create Video CTA | Gate-keep: Email verification required before accessing `/create-video`. Show persistent yellow banner on dashboard until verified. |
| User expects instant preview | Animation style selection (Step 3) | Set expectation: "You'll receive final video in 5-10 minutes via email." Link to examples gallery: "Preview all styles with sample animations." |
| User loses track of video status | After submission, 5-10 min waiting period | Send email notification when completed. Show status badges on dashboard ("Processing" → "Completed"). Toast notification on submission: "You'll receive email when ready." |
| User doesn't know what went wrong | Failed video state | Show specific error message when clicking failed video card. Provide "Retry" button (free, no additional credit charge). Consider contact support link for persistent failures. |
| User runs out of credits mid-session | Any point in creation flow | Check credits before allowing form access. Show credit balance in navigation. Disable "Create Video" button if insufficient, with message "You need X credits. Buy more?" |
| User doesn't understand failed video retry policy | Failed video card | Show tooltip on "Retry" button: "Free retry — no additional credits charged." Clarify deletion doesn't refund credits. |

**Visibility decisions:**
- **Must be visible:**
  - Credit balance (navigation, always present)
  - Email verification status (persistent banner if unverified)
  - Video status badges (Pending/Processing/Completed/Failed on every card)
  - Quality tier credit costs (radio button labels: "Standard (1 credit)")
  - Step progress indicator (Step X of 4 in wizard)
  - File upload errors (red text below dropzone)
  - Processing time estimate ("5-10 minutes" in confirmation message)

- **Can be implied:**
  - Subscription plan name (users care about credits, not plan details)
  - n8n execution ID (backend tracking, not user-facing)
  - Video resolution (1080p is standard, no need to emphasize)
  - TTS voice type (default voice used, no customization in MVP)
  - Retry attempt count (not tracked in MVP)

**UX constraints:**
- **No color pickers or font selectors** — This is not a design tool; creative direction is text-based only
- **No drag-to-reorder or timeline editing** — Single video per request, no multi-video projects
- **No undo/redo** — Irreversible submission; review step is the safety check
- **No save draft** — Form state lost on page refresh (explicitly call out in flow)
- **No real-time preview** — Set expectation upfront; final video delivered after processing
- **No partial progress visibility** — Either "Processing" or "Completed"; no 50% done indicators
- **Fixed video duration (8 seconds)** — Not user-configurable; show as informational text only

---

## Visual Specifications

### Design System Foundation

#### Color Palette
- **Primary:** Purple gradient (`#8B5CF6` to `#6366F1`) — CTAs, active states, brand accent
- **Success:** Green (`#10B981`) — Completed videos, positive feedback
- **Warning:** Yellow/Amber (`#F59E0B`) — Low credits, unverified email, small file warnings
- **Error:** Red (`#EF4444`) — Failed videos, form errors, zero credits
- **Neutral:** Gray scale (`#F9FAFB` to `#111827`) — Backgrounds, text, borders
- **Processing:** Orange (`#F97316`) — In-progress states

#### Typography
- **Headings:** Inter Bold, 24-32px (h1), 20-24px (h2), 16-18px (h3)
- **Body:** Inter Regular, 14-16px (base text), 12-14px (helper text)
- **Labels:** Inter Medium, 14px (form labels, button text)
- **Monospace:** Fira Code, 13px (credit counts, status badges)

#### Spacing System
- **Base unit:** 4px
- **Form fields:** 16px vertical spacing between fields
- **Sections:** 32px vertical spacing between major sections
- **Cards:** 16px padding, 12px gap in grid layouts
- **Wizard steps:** 24px padding per step container

---

### Screen Specifications

#### 1. Dashboard (Home)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Navigation Bar                                              │
│ [Logo] Dashboard | Create Video | Billing     [5 credits]  │
├─────────────────────────────────────────────────────────────┤
│ [BANNER: Yellow background if email unverified]             │
│ "Verify your email to create videos" [Verify Email button] │
├─────────────────────────────────────────────────────────────┤
│ Dashboard                                                   │
│                                                             │
│ [Create Video] button (large, purple, primary)             │
│                                                             │
│ Recent Videos                                               │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│ │[Thumbnail]│ │[Thumbnail]│ │[Thumbnail]│ ...             │
│ │  Brand 1  │ │  Brand 2  │ │  Brand 3  │                │
│ │ ✓ Completed│ │⏳ Processing│ │❌ Failed │                │
│ │ Jan 15    │ │ Jan 15    │ │ Jan 14    │                │
│ └───────────┘ └───────────┘ └───────────┘                │
│                                                             │
│ [View All Videos] link                                      │
└─────────────────────────────────────────────────────────────┘
```

**States:**
- Empty state (no videos): Illustration + "Create your first video" CTA
- Email unverified: Yellow banner persists at top
- Zero credits: "Create Video" button disabled with tooltip "You need 1 credit. Buy now?"

---

#### 2. Create Video Wizard (4 Steps)

**Step Progress Indicator (top of page):**
```
Step 1: Upload  →  Step 2: Details  →  Step 3: Style  →  Step 4: Review
[active step highlighted in purple, completed steps with checkmark]
```

**Step 1 - Upload Logo**
```
┌─────────────────────────────────────────────────────────────┐
│ Step 1 of 4: Upload Logo                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │         [Cloud Upload Icon]                             │ │
│ │   Drop your logo here or click to browse               │ │
│ │   Accepted formats: PNG, SVG, JPG (max 10MB)          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Cancel] button                    [Next: Details] disabled│
└─────────────────────────────────────────────────────────────┘
```

**After upload:**
- Dropzone shows checkmark + file name
- Yellow warning icon if file < 1000x1000px (tooltip: "Results may vary")
- [Next: Details] button enabled

**Step 2 - Video Details**
```
┌─────────────────────────────────────────────────────────────┐
│ Step 2 of 4: Video Details                                  │
│                                                             │
│ Brand Name *                                                │
│ [Text input: max 50 chars]                                 │
│ This text will appear in your animation                    │
│                                                             │
│ ℹ️ All videos are 8 seconds long                           │
│                                                             │
│ Quality Tier *                                              │
│ ○ Standard (1 credit) — High-quality 1080p                 │
│ ○ Premium (2 credits) — Enhanced 1080p with superior rendering│
│                                                             │
│ Aspect Ratio *                                              │
│ ○ 16:9 Landscape — For YouTube, presentations, websites   │
│ ○ 9:16 Vertical — For Instagram Stories, TikTok, Reels    │
│                                                             │
│ [Back] button                         [Next: Style] button │
└─────────────────────────────────────────────────────────────┘
```

**Step 3 - Animation Style & Customization**
```
┌─────────────────────────────────────────────────────────────┐
│ Step 3 of 4: Style & Customization                         │
│                                                             │
│ Animation Style * [Preview all styles →]                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│ │Style│ │Style│ │Style│ │Style│ ...                       │
│ │  1  │ │  2  │ │  3  │ │  4  │ [grid of 10+ options]    │
│ └─────┘ └─────┘ └─────┘ └─────┘                          │
│ [Tooltip on hover: style description]                      │
│                                                             │
│ Creative Direction (optional)                               │
│ [Textarea: max 500 chars]                                  │
│ e.g., "fast-paced and energetic" or "minimal and elegant"  │
│                                                             │
│ Dialogue/Voiceover                                          │
│ ○ None — No voiceover (animation only)                     │
│ ○ Brand Name — AI voice says your brand name               │
│ ○ Custom — AI voice says custom text:                      │
│   [Text input: max 100 chars, conditional on "Custom"]     │
│                                                             │
│ [Back] button                        [Next: Review] button │
└─────────────────────────────────────────────────────────────┘
```

**Step 4 - Review & Submit**
```
┌─────────────────────────────────────────────────────────────┐
│ Step 4 of 4: Review & Submit                                │
│                                                             │
│ Logo                                                        │
│ [Thumbnail preview]                                         │
│                                                             │
│ Brand Name: "Acme Corp"                                     │
│ Quality: Premium (2 credits)                                │
│ Aspect Ratio: 16:9 Landscape                                │
│ Style: Energetic Spin                                       │
│ Creative Direction: "fast-paced with bold colors"           │
│ Dialogue: Brand Name                                        │
│                                                             │
│ Total Cost: 2 credits                                       │
│ Your Balance: 5 credits → 3 credits after creation         │
│                                                             │
│ [Back] button       [Create Video (2 credits)] button      │
└─────────────────────────────────────────────────────────────┘
```

**After submission:**
- Toast notification: "Video creation started! You'll receive email in 5-10 minutes."
- Redirect to dashboard
- New video card appears with "Pending" status

---

#### 3. Video Library (All Videos)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Video Library                                               │
│                                                             │
│ [Search by brand name] [Filter: All | Processing | Completed | Failed]│
│                                                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │  [Thumbnail]  │ │  [Thumbnail]  │ │  [Thumbnail]  │    │
│ │   Brand A     │ │   Brand B     │ │   Brand C     │    │
│ │ ✓ Completed   │ │ ⏳ Processing  │ │ ❌ Failed      │    │
│ │ Jan 15, 2025  │ │ Jan 15, 2025  │ │ Jan 14, 2025  │    │
│ │ [Download] 🔽 │ │               │ │ [Retry][Delete]│    │
│ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                             │
│ [Load More] button (pagination)                            │
└─────────────────────────────────────────────────────────────┘
```

**Video Card States:**
- Completed: Green badge, download icon
- Processing: Orange badge, spinner animation
- Pending: Gray badge
- Failed: Red badge, "Retry" + "Delete" buttons

**Click card to open video player modal (completed videos only):**
```
┌─────────────────────────────────────────────────────────────┐
│ [X] Close                                                   │
│                                                             │
│ [Video Player]                                              │
│                                                             │
│ Brand: Acme Corp                                            │
│ Created: Jan 15, 2025                                       │
│ Quality: Premium                                            │
│                                                             │
│ [Download MP4] button                                       │
└─────────────────────────────────────────────────────────────┘
```

---

#### 4. Billing Page

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Billing & Credits                                           │
│                                                             │
│ Current Balance: [5 credits]                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Quick Trial (No Subscription)                           │ │
│ │ 1 credit for $5 — Try before you subscribe              │ │
│ │ [Buy 1 Credit] button                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Monthly Subscriptions                                       │
│ ┌──────────────────┐ ┌──────────────────┐                │
│ │   Starter        │ │  Professional    │                │
│ │ $15/month        │ │ $30/month        │                │
│ │ 5 credits/month  │ │ 10 credits/month │                │
│ │ [Subscribe]      │ │ [Subscribe]      │                │
│ └──────────────────┘ └──────────────────┘                │
│                                                             │
│ Credit Packs (One-Time Purchase)                           │
│ ┌──────────────────┐ ┌──────────────────┐                │
│ │ 10 credits - $25 │ │ 25 credits - $50 │ ...            │
│ │ [Buy Pack]       │ │ [Buy Pack]       │                │
│ └──────────────────┘ └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

**Credit expiry warning (if subscription credits expiring soon):**
```
[Yellow banner] Your 3 subscription credits expire on Jan 31, 2025
```

---

#### 5. Animation Styles Gallery (Examples Page)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Animation Style Examples                                    │
│                                                             │
│ Preview all 10+ animation styles with sample videos        │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Energetic Spin                                        │  │
│ │ [Video preview player]                                │  │
│ │ Fast-paced rotation with dynamic zoom effects        │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Minimal Fade                                          │  │
│ │ [Video preview player]                                │  │
│ │ Smooth fade-in with subtle scaling                   │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [... 10+ more style previews ...]                          │
│                                                             │
│ [Create Video] CTA button (bottom of page)                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Component Specifications

#### Video Card Component
```tsx
<VideoCard>
  <Thumbnail src={placeholderImage} /> {/* No actual thumbnail in MVP */}
  <StatusBadge status="completed" /> {/* completed | processing | pending | failed */}
  <BrandName>{video.brand_name}</BrandName>
  <Date>{video.created_at}</Date>
  <QualityTier>{video.quality_tier}</QualityTier> {/* Standard | Premium */}
  {video.status === 'completed' && <DownloadIcon />}
  {video.status === 'failed' && (
    <>
      <RetryButton tooltip="Free retry — no additional credits" />
      <DeleteButton />
    </>
  )}
</VideoCard>
```

**Interactions:**
- Click entire card → Open video player modal (if completed) or view error (if failed)
- Click download icon → Trigger download without modal (shortcut)
- Click retry → Resubmit video to n8n (no credit deduction)
- Click delete → Confirm dialog → Remove video record (no credit refund)

#### Status Badge Component
```tsx
<StatusBadge status={status}>
  {status === 'pending' && <GrayBadge>Pending</GrayBadge>}
  {status === 'processing' && <OrangeBadge><Spinner />Processing</OrangeBadge>}
  {status === 'completed' && <GreenBadge><Checkmark />Completed</GreenBadge>}
  {status === 'failed' && <RedBadge><ErrorIcon />Failed</RedBadge>}
</StatusBadge>
```

#### Credit Balance Indicator (Navigation)
```tsx
<CreditBalance credits={credits}>
  <CoinIcon />
  {credits} credits
  {credits === 0 && <RedDot />}
  {credits > 0 && credits <= 5 && <YellowWarningIcon />}
  <Tooltip>
    {credits === 0 && "Buy credits to create videos"}
    {credits > 0 && credits <= 5 && "Running low — consider buying more"}
  </Tooltip>
</CreditBalance>
```

#### File Upload Dropzone Component
```tsx
<Dropzone onDrop={handleUpload}>
  {!file && (
    <>
      <CloudUploadIcon />
      <Text>Drop your logo here or click to browse</Text>
      <HelperText>Accepted formats: PNG, SVG, JPG (max 10MB)</HelperText>
    </>
  )}
  {uploading && <ProgressBar progress={uploadProgress} />}
  {file && (
    <>
      <CheckmarkIcon />
      <FileName>{file.name}</FileName>
      {file.size < RECOMMENDED_SIZE && (
        <WarningTooltip>
          File smaller than 1000x1000px. Results may vary.
        </WarningTooltip>
      )}
    </>
  )}
  {error && <ErrorText>{error.message}</ErrorText>}
</Dropzone>
```

---

### Interaction Specifications

#### Navigation Flow
```
Dashboard → Create Video (Step 1) → Step 2 → Step 3 → Step 4 → Submit → Dashboard
                                                                      ↓
                                                            Toast: "Video started!"
                                                                      ↓
                                                           Email notification (5-10 min)
                                                                      ↓
                                                            Dashboard (video completed)
```

#### Error Recovery Flows
```
Upload fails → Show error below dropzone → User clicks dropzone → Retry upload
                                                                 ↓
                                                       Success → Continue to Step 2

Submission fails → Video marked "Failed" → User clicks video card → View error message
                                                                   ↓
                                                   [Retry] button → Resubmit to n8n (free)

Insufficient credits → Disable "Create Video" button → Show tooltip "Need X credits"
                                                                   ↓
                                                   User clicks "Buy Credits" → Billing page
```

#### Email Verification Flow
```
User signs up → Email sent with verification link → User clicks link → Redirect to dashboard
                                                                              ↓
                                                             Yellow banner removed
                                                                              ↓
                                                         "Create Video" access granted
```

---

### Responsive Breakpoints

#### Desktop (1024px+)
- Multi-column video grid (3-4 cards per row)
- Full wizard steps shown side-by-side (e.g., progress indicator at top)
- Navigation bar horizontal layout

#### Tablet (768px - 1023px)
- 2-column video grid
- Wizard steps stacked vertically
- Navigation bar condensed (icons + text)

#### Mobile (< 768px)
- Single-column video grid
- Wizard steps full-width, one step per screen
- Navigation bar icons only, credit balance in hamburger menu
- Upload dropzone simplified (click only, drag-and-drop disabled on mobile)

---

### Accessibility Considerations

#### Keyboard Navigation
- All form fields tab-navigable
- Radio buttons arrow-key navigable within groups
- Video cards focus-highlightable with Enter to open modal
- Modal close with Escape key

#### Screen Reader Support
- Status badges announced with ARIA live regions: "Video processing" → "Video completed"
- File upload progress announced: "Uploading... 50%" → "Upload complete"
- Credit balance announced: "5 credits available"
- Form errors announced immediately on validation

#### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Status badges use both color AND icon (not color-only)
- Error messages use red border + icon + text (redundant encoding)

#### Focus States
- Visible focus outlines on all interactive elements (2px purple ring)
- Skip navigation link for keyboard users
- Focus trapped in modals (can't tab outside modal)

---

## Implementation Notes

### State Management
- Video creation form: React state (lost on refresh)
- Credit balance: Real-time from Supabase (subscription + credit packs aggregation)
- Video list: Paginated query with React Query for caching
- Email verification status: Checked on page load, cached in session

### API Endpoints
- `POST /api/videos/create` — Submit video creation request
- `POST /api/webhooks/n8n` — Receive status updates from n8n
- `GET /api/videos` — Fetch user video library (paginated)
- `POST /api/videos/:id/retry` — Retry failed video (no credit deduction)
- `DELETE /api/videos/:id` — Delete video (no credit refund)
- `POST /api/webhooks/stripe` — Handle subscription/payment events
- `GET /api/billing/balance` — Get current credit balance (aggregated)

### Performance Optimizations
- Lazy load video library (virtual scrolling for 100+ videos)
- Image optimization for placeholder thumbnails (Next.js Image component)
- Debounce search input (300ms delay)
- Skeleton loading states for perceived performance

### Security Considerations
- Email verification required before video creation (gate-keeping)
- Signed URLs for logo uploads (time-limited access)
- Server-side credit checks before video creation (prevent client manipulation)
- Stripe webhook signature verification (prevent fake payment events)
- Rate limiting on API endpoints (prevent abuse, though not explicitly tracked in MVP)

---

## Open Questions & Future Enhancements

1. **Thumbnail generation:** Placeholder images in MVP. Future: Extract first frame or generate preview thumbnail.
2. **Real-time notifications:** Email-only in MVP. Future: WebSocket or polling for in-app status updates.
3. **Guided creative direction questionnaire:** High-priority enhancement (see PRD section 8.3). Helps non-creative users write better prompts.
4. **Voice customization:** Default TTS voice in MVP. Future: User selects voice type, accent, language.
5. **Advanced retry tracking:** No retry count limit in MVP. Future: Max 3 retries before requiring support contact.
6. **Video analytics:** No usage tracking in MVP. Future: Track views, downloads, most popular styles.
7. **Batch processing:** Single video per request in MVP. Future: Upload multiple logos at once.
8. **Custom duration:** Fixed 8 seconds in MVP. Future: User selects 5-15 second range.
