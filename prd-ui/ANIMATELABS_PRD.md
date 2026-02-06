# Animation Labs - Demo Project PRD

## 1. One-Sentence Problem

> Content creators and small businesses struggle to produce professional logo animations quickly and affordably because traditional video editing requires specialized skills and expensive software, resulting in delayed content launches or settling for amateur-looking branding.

## 2. Demo Goal (What Success Looks Like)

**Success Criteria:**
- A user can upload a logo and receive a professional-quality animated video within 5-10 minutes
- The entire process requires zero video editing knowledge
- Users can clearly see their credit balance and video status at every step

**What the demo should communicate:**
- Logo animation creation is as simple as filling out a form
- Fast turnaround time (5-10 min) makes this viable for production use
- Credit-based pricing is transparent and predictable (Standard quality = 1 credit, Premium quality = 2 credits)

**Non-Goals:**
- Advanced video editing features (timeline editing, keyframe control, etc.)
- Multiple animation styles per video (user picks one style per creation)
- Real-time preview during creation (user sees final result after processing)
- Enterprise features (team collaboration, brand kits, API access)
- In-app real-time notifications (email notifications only in MVP)
- Thumbnail generation (future feature)

## 3. Target User (Role-Based)

**Primary User:** Solo content creator or small business owner

**Context:**
- Creating YouTube intros/outros, social media content, or presentation videos
- Has a logo (PNG, SVG, or JPG file) but no video editing skills
- Needs consistent, professional branding across content

**Skill Level:**
- Comfortable with basic web forms and file uploads
- No video editing or motion graphics experience required
- Understands basic video concepts (aspect ratio)

**Key Constraint:**
- Time - cannot spend hours learning editing software or waiting days for freelancer delivery
- Budget - cannot afford $50-200 per video from traditional animation services

## 4. Core Use Case (Happy Path)

**Start Condition:** User has verified their email, logged in, and has at least 1 credit available

**Flow:**

1. User verifies email address (mandatory before video creation access)
2. User clicks "Create Video" from dashboard
3. User uploads logo file (PNG, SVG, or JPG)
4. User enters video details:
   - Brand name (text that will appear visually in all animations)
   - Quality tier (Standard = 1 credit, Premium = 2 credits)
   - Aspect ratio (16:9 Landscape or 9:16 Vertical)
   - Note: All videos are 8 seconds long (fixed duration)
5. User selects animation style from 10+ options (can preview styles on separate examples page or view tooltip descriptions)
6. User provides optional creative direction (AI prompt to customize animation within selected style)
7. User chooses dialogue/voiceover type:
   - None (no audio narration)
   - Brand name (text-to-speech of brand name)
   - Custom text (text-to-speech of custom text, max 100 chars)
8. User reviews all selections on summary screen
9. User submits (1-2 credits deducted automatically based on quality tier)
10. System shows success message: "Video creation started!"
11. User returns to dashboard to see video status
12. Within 5-10 minutes, video status changes to "Completed"
13. User receives email notification with link to view video
14. User clicks video card or email link to view/download finished animation (MP4 H.264 format)

**End Condition:** User has a completed animated video available for download and use

## 5. Functional Decisions (What It Must Do)

| ID | Function | Notes |
|----|----------|-------|
| F1 | Accept logo uploads | Support PNG, SVG, JPG. Max 10MB. Show warnings for files below recommended dimensions (e.g., "For best results, use logos at least 1000x1000px") but allow upload. |
| F2 | Validate user inputs | Brand name (required, max 50 chars), quality tier (standard/premium), aspect ratio (16:9/9:16), creative direction (optional, max 500 chars), dialogue text (optional, max 100 chars). Duration is fixed at 8 seconds. |
| F3 | Check credit availability | Before allowing video creation. Show clear message if insufficient. Check both subscription credits and one-time credit pack balance. |
| F4 | Deduct credits atomically | 1 credit for standard quality, 2 credits for premium quality. Transaction recorded for audit trail. |
| F5 | Submit job to processing queue | Send to n8n webhook with all parameters (including TTS text if applicable). Receive execution ID. Uses n8n default queue handling. |
| F6 | Track video status | Pending → Processing → Completed/Failed. Update via n8n callback. |
| F7 | Store video metadata | Brand name, style, quality tier, settings, timestamps, n8n execution ID. |
| F8 | Display video library | Show all user videos with status, brand name, date. No thumbnail in MVP (use placeholder icon/image). |
| F9 | Filter and search videos | Filter by status (all/pending/processing/completed/failed). Search by brand name. |
| F10 | Download/view completed videos | Provide video URL for streaming and download. Videos delivered as MP4 with H.264 codec. |
| F11 | Handle processing failures | Show error message. Allow free retry (no additional credit charge). User can also delete failed video. Credits are NOT refunded on deletion. |
| F12 | Manage subscriptions and purchases | Stripe integration for: (1) Monthly subscriptions (Starter/Professional), (2) One-time credit packs, (3) Single credit purchase ($5, no subscription required for trial). Users can have ONE recurring subscription + multiple credit pack/single purchases. Subscription credits expire at end of billing cycle (use it or lose it). |
| F13 | Display animation style catalog | Provide dedicated examples/gallery page showing 10+ animation styles. Show tooltip with description on style selector. |
| F14 | Send completion notifications | Send email via Resend API when video processing completes. Include link to view/download video. |
| F15 | Verify email before video creation | Require email verification before users can access video creation features. Show verification reminder on dashboard if unverified. |
| F16 | Brand name text rendering | All animation styles must display the brand name text visually in the video. |

## 6. UX Decisions (What the Experience Is Like)

### 6.1 Entry Point

**How user starts:**
- From dashboard: "Create Video" button (requires at least 1 credit AND verified email)
- From navigation: Direct link to `/create-video` (redirects to login if unauthenticated, to email verification if unverified)

**What they see first:**
- If email unverified: Prompt to verify email before accessing video creation
- If no credits: Message explaining they need credits, with link to billing page
- If has credits: Step 1 of 4-step wizard showing file upload dropzone

### 6.2 Inputs

**Step 1 - Upload:**
- File upload dropzone (drag-and-drop or click to browse)
- Accepted formats: PNG, SVG, JPG
- File size limit displayed: "Max 10MB"
- Warning shown if file is very small: "For best results, use logos at least 1000x1000px" (but upload still allowed)

**Step 2 - Details:**
- Text input: Brand name (required, max 50 chars)
  - Helper text: "This text will appear in your animation"
- Info text: "All videos are 8 seconds long"
- Radio buttons: Quality Tier
  - **Standard** (1 credit) - "High-quality 1080p animation"
  - **Premium** (2 credits) - "Enhanced 1080p with superior rendering quality"
- Radio buttons: Aspect Ratio
  - **16:9 Landscape** - "For YouTube, presentations, websites"
  - **9:16 Vertical** - "For Instagram Stories, TikTok, Reels"

**Step 3 - Style:**
- Radio buttons or grid: Animation style (10+ preset options)
  - Each style has tooltip showing description on hover
  - Link to separate examples page: "Preview all styles with examples"
- Textarea: Creative direction (optional, max 500 chars)
  - Helper text: "Describe how you'd like to customize this animation style (e.g., 'fast-paced and energetic', 'minimal and elegant')"
  - Note: This text is used as an AI prompt to influence the animation
- Radio buttons: Dialogue/Voiceover (text-to-speech audio narration)
  - **None** - "No voiceover (animation only)"
  - **Brand Name** - "AI voice says your brand name"
  - **Custom** - "AI voice says custom text"
- Text input: Custom dialogue text (if "Custom" selected, max 100 chars)

**Step 4 - Review:**
- Read-only summary of all selections
- Logo preview thumbnail
- Submit button showing credit cost:
  - "Create Video (1 credit)" for standard quality
  - "Create Video (2 credits)" for premium quality

### 6.3 Outputs

**Immediate (on submission):**
- Toast notification: "Video creation started! You'll receive an email when it's ready."
- Redirect to dashboard

**After processing (5-10 min):**
- Email notification sent to user with:
  - "Your video is ready!"
  - Link to view/download
  - Video preview or thumbnail (if available in future)
- Video card appears in dashboard and video library:
  - Placeholder icon/image (no thumbnail in MVP)
  - Status badge: "Completed" (green)
  - Brand name
  - Creation date
  - Quality tier indicator
- Click card to view video player modal
- Download button to save MP4 file (H.264 codec)

### 6.4 Feedback & States

**Loading states:**
- File upload: Progress bar during upload
- Form submission: Button shows spinner, disabled, text changes to "Creating..."
- Video library: Skeleton cards while fetching data

**Success feedback:**
- Upload complete: Checkmark icon, auto-advance to next step
- Video submitted: Toast notification + redirect
- Video completed: Email notification + status badge changes to green "Completed"

**Failure feedback:**
- Upload failed: Red error text below dropzone
- Invalid form field: Red border + error message below field
- Processing failed: Status badge shows red "Failed" + error message on hover/click
- Failed video shows "Retry" button (free retry, no additional credit charge)

**Partial results:**
- Video still processing: Orange "Processing" badge, no download available yet
- Video pending: Gray "Pending" badge, queued for processing

**Warning states:**
- Small file uploaded: Yellow warning icon with tooltip "File is smaller than recommended dimensions. Results may vary."
- Credits expiring soon: Banner on dashboard "Your X credits expire on [date]"
- Unverified email: Persistent banner "Verify your email to create videos"

### 6.5 Errors (Minimum Viable Handling)

**Invalid input:**
- Show field-level error message (red text below field)
- Prevent form advancement until fixed
- Example: "Brand name is required"

**System fails (n8n webhook error, upload error):**
- Show toast error notification
- Video marked as "Failed" status
- User can view error message by clicking video card
- User can retry failed video for free (no additional credit charge)
- User can delete failed video (no credit refund)

**User does nothing (abandons form):**
- Form state is lost (no auto-save)
- Uploaded file is discarded
- No credit charged
- User can start over anytime

## 7. Data & Logic (At a Glance)

### 7.1 Inputs

**From user:**
- Logo file (upload to Supabase Storage)
- Form data (brand name, quality tier, aspect ratio, style, creative direction, dialogue type and text)
- Note: Duration is fixed at 8 seconds (not user-selectable)

**From Stripe (via webhook):**
- Subscription status updates
- Payment confirmations
- Credit grants on billing cycle (subscription renewals)
- One-time credit pack purchases

**From n8n (via webhook callback):**
- Video processing status updates
- Video URL (completed) - MP4 H.264 format
- Error messages (failed)

**From TTS service (via n8n):**
- Generated audio narration (if dialogue selected)

### 7.2 Processing

**High-level flow:**

1. **Email Check:** Verify user email is confirmed → Block access if not
2. **Upload:** User file → Supabase Storage → Generate signed URL
3. **Validate:** Form data → Server-side validation (zod schema) → Check credits (subscription + credit packs)
4. **Deduct:** Call `deduct_credits()` function (1-2 credits based on quality tier) → Update subscription/credit pack table → Log transaction
5. **Create:** Insert video record (status: "pending") → Get video ID
6. **Submit:** POST to n8n webhook with all parameters + signed logo URL + creative direction (AI prompt) + TTS text (if applicable) → Receive execution ID
7. **Queue:** n8n processes video using default queue handling (AI generation, TTS integration, rendering, etc.)
8. **Callback:** n8n POSTs to `/api/webhooks/n8n` → Update video status + video URL
9. **Notify:** Send email via Resend API with completion notification and video link

**Key logic:**
- Email verification check happens BEFORE video creation page access
- Credit check happens BEFORE video record creation (prevent orphaned videos)
- Video creation and credit deduction are in same database transaction (atomicity)
- n8n execution ID stored for debugging/tracking
- Creative direction text is passed to AI as a prompt parameter to customize animation
- TTS text is passed to text-to-speech service to generate voiceover audio
- No custom queue management - relies on n8n default behavior
- Retry attempts for failed videos do NOT deduct additional credits

### 7.3 Outputs

**To UI:**
- Video metadata (status, video URL, brand name, quality tier, timestamps)
- Credit balance (real-time from subscriptions + credit packs tables)
- Error messages (from video record or n8n callback)
- Placeholder images for video cards (no thumbnails in MVP)

**To database:**
- Video records (1 per creation request)
  - thumbnail_url field remains null (future feature)
- Credit transactions (audit log)
  - Negative amounts for video creation
  - Positive amounts for subscription grants and credit pack purchases
- Subscription updates (credit deduction from subscription or credit packs)

**To external storage:**
- Logo files (Supabase Storage bucket: `logos`)
- Video files (n8n uploads to Supabase Storage bucket: `videos`)
  - Format: MP4 with H.264 codec
  - Resolution: 1080p (both standard and premium quality tiers)
  - Duration: 8 seconds (fixed)
  - Aspect ratio: 16:9 or 9:16 based on user selection
- Audio files (TTS-generated voiceover, embedded in final video)

**To email (Resend):**
- Video completion notifications with links to view/download

**Not persisted:**
- Form state (lost on page refresh)
- In-progress uploads (restart required)
- n8n processing logs (stay in n8n)
- Thumbnail images (not generated in MVP)

---

## 8. Logo Formatting Guidelines

### 8.1 Proper Logo Presentation

To ensure optimal results in animations, logos should be properly formatted with appropriate padding and centered within the frame. Below are the specifications for each aspect ratio:

#### 16:9 Landscape Format (1920x1080px)

**Recommended specifications:**
- Canvas size: 1920x1080px
- Logo placement: Centered horizontally and vertically
- Safe area for logo: 1400x800px (centered)
- Padding: ~260px from left/right edges, ~140px from top/bottom edges
- Background: Transparent or solid color (depending on animation style)

**Sample image layout:**
```
┌─────────────────────────────────────────────────────┐
│                    [260px padding]                   │
│  ┌───────────────────────────────────────────────┐  │
│  │            [140px padding]                     │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │                                          │  │  │
│  │  │                                          │  │  │
│  │  │          LOGO (1400x800 safe area)       │  │  │
│  │  │                                          │  │  │
│  │  │                                          │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### 9:16 Vertical Format (1080x1920px)

**Recommended specifications:**
- Canvas size: 1080x1920px
- Logo placement: Centered horizontally and vertically
- Safe area for logo: 800x1400px (centered)
- Padding: ~140px from left/right edges, ~260px from top/bottom edges
- Background: Transparent or solid color (depending on animation style)

**Sample image layout:**
```
┌─────────────────────────┐
│   [140px padding]       │
│ ┌─────────────────────┐ │
│ │  [260px padding]    │ │
│ │ ┌─────────────────┐ │ │
│ │ │                 │ │ │
│ │ │                 │ │ │
│ │ │      LOGO       │ │ │
│ │ │  (800x1400px)   │ │ │
│ │ │   safe area     │ │ │
│ │ │                 │ │ │
│ │ │                 │ │ │
│ │ │                 │ │ │
│ │ └─────────────────┘ │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### 8.2 AI-Assisted Logo Formatting (Optional Pre-Processing)

For logos that don't meet the recommended specifications, an optional AI-based pre-processing step can automatically format the logo with proper padding and resolution.

#### Suggested AI Prompt for OpenAI Vision API

**For 16:9 Landscape format:**
```
You are a professional graphic designer preparing a logo for video animation.

Take the provided logo image and format it as follows:
- Create a 1920x1080px canvas (16:9 aspect ratio)
- Place the logo centered both horizontally and vertically
- Ensure the logo fits within a 1400x800px safe area
- Add appropriate padding: minimum 260px from left/right edges, 140px from top/bottom
- If the logo has transparency, preserve it with a transparent background
- If the logo doesn't have transparency, use a clean white or appropriate solid background
- Maintain the logo's original aspect ratio (do not stretch or distort)
- If the logo is too large for the safe area, scale it down proportionally
- Ensure the logo is sharp and high-quality at 1080p resolution
- Output as PNG with transparency preserved

The goal is to create a properly formatted logo canvas ready for animation overlay.
```

**For 9:16 Vertical format:**
```
You are a professional graphic designer preparing a logo for video animation.

Take the provided logo image and format it as follows:
- Create a 1080x1920px canvas (9:16 aspect ratio, vertical)
- Place the logo centered both horizontally and vertically
- Ensure the logo fits within a 800x1400px safe area
- Add appropriate padding: minimum 140px from left/right edges, 260px from top/bottom
- If the logo has transparency, preserve it with a transparent background
- If the logo doesn't have transparency, use a clean white or appropriate solid background
- Maintain the logo's original aspect ratio (do not stretch or distort)
- If the logo is too large for the safe area, scale it down proportionally
- Ensure the logo is sharp and high-quality at 1080p resolution
- Output as PNG with transparency preserved

The goal is to create a properly formatted logo canvas ready for animation overlay.
```

#### Alternative: Programmatic Approach (Python/PIL)

For deterministic results without AI, a simple Python script using PIL/Pillow can achieve the same formatting:

```python
from PIL import Image

def format_logo(input_path, output_path, aspect_ratio="16:9"):
    # Define canvas dimensions
    if aspect_ratio == "16:9":
        canvas_width, canvas_height = 1920, 1080
        safe_width, safe_height = 1400, 800
    else:  # 9:16
        canvas_width, canvas_height = 1080, 1920
        safe_width, safe_height = 800, 1400

    # Load logo
    logo = Image.open(input_path).convert("RGBA")

    # Scale logo to fit safe area while maintaining aspect ratio
    logo.thumbnail((safe_width, safe_height), Image.Resampling.LANCZOS)

    # Create transparent canvas
    canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))

    # Calculate position to center logo
    x = (canvas_width - logo.width) // 2
    y = (canvas_height - logo.height) // 2

    # Paste logo onto canvas
    canvas.paste(logo, (x, y), logo)

    # Save formatted logo
    canvas.save(output_path, "PNG")
```

### 8.3 Implementation in n8n Workflow

The logo formatting step should be integrated into the n8n workflow before animation generation:

1. **Receive user logo upload** (any size/format)
2. **Detect aspect ratio** from user selection (16:9 or 9:16)
3. **Pre-process logo** using AI prompt or programmatic script
4. **Generate formatted logo** at proper resolution with padding
5. **Pass formatted logo** to animation generation step
6. **Render animation** using properly formatted logo canvas

This ensures consistent logo presentation across all animation styles and eliminates poor-quality results from improperly sized uploads.

---

## Assumptions Made

1. **Target turnaround time:** 5-10 minutes is achievable with current n8n workflow and AI services
2. **Pricing model:** Credit-based with two quality tiers:
   - Standard quality: 1 credit (~$3 per video)
   - Premium quality: 2 credits (~$6 per video)
   - Delivered via: (a) Monthly subscriptions (Starter/Professional plans), (b) One-time credit packs, (c) Single credit purchase ($5, no subscription - for trial)
3. **Fixed duration:** All videos are 8 seconds long. Duration is not user-selectable to simplify UX and standardize rendering.
4. **Animation quality:** AI-generated animations are "good enough" for demo purposes (not hand-crafted motion design)
5. **Tech stack:** Next.js 16 + Supabase + n8n + TTS service is sufficient for MVP scale (<1000 users)
6. **No real-time preview:** Users trust the system based on style examples gallery + descriptions
7. **Credit policy:**
   - Subscription credits expire at end of billing cycle (use it or lose it)
   - Credit pack credits do not expire
   - Failed videos can be retried for free
   - Deleting videos does not refund credits
8. **Single video per request:** No batch processing in initial version
9. **Unlimited storage:** All created videos are stored indefinitely with no quantity limits (Supabase storage costs scale with usage)
10. **Purchase options:** Three ways to get credits:
   - **Single credit trial:** $5 for 1 credit, no subscription required (try before you buy)
   - **Monthly subscriptions:** Starter or Professional plans with recurring credits
   - **Credit packs:** One-time purchases for additional credits
11. **One subscription model:** Users can have ONE recurring subscription (Starter or Professional) at a time, plus unlimited one-time credit packs and single credit purchases
12. **Plan changes:** Upgrading or downgrading plans immediately replaces the current subscription (proration handled by Stripe)
13. **Feature parity:** Both Starter and Professional subscription plans provide access to identical features (all 10+ styles, both quality tiers, all options). Only monthly credit allocation differs between plans.
14. **Queue management:** No custom queue system in MVP - relies on n8n default queue handling. Potential bottleneck for high-volume periods.
15. **No rate limits:** Users can create unlimited videos limited only by available credits (no time-based or concurrent processing limits)
16. **Brand name display:** All 10+ animation styles are designed to visually display the brand name text in the final video
17. **TTS integration:** n8n workflow integrates with a text-to-speech service for dialogue/voiceover generation (voice selection is predefined in MVP - no user choice of voice/accent/language)
18. **Email-only notifications:** Video completion notifications are sent via email only (no in-app notifications, push notifications, or real-time updates in MVP)
19. **Email verification required:** Users must verify their email address before they can access video creation features (browsing and account management allowed without verification)

---

## Known Gaps & Future Enhancements

1. **Thumbnail generation:** Not implemented in MVP. Video cards show placeholder images. thumbnail_url field exists in database but remains null.

2. **In-app notifications:** No real-time notifications when videos complete. Users rely on email or manual refresh.

3. **Voice customization:** TTS uses default voice settings. No user control over voice type, accent, or language.

4. **Custom queue management:** Relies on n8n defaults. May need custom queue logic if demand exceeds n8n capacity.

5. **Advanced retry logic:** Retry tracking not implemented. Consider adding retry count limits in future.

6. **Credit pack expiry:** Assumption that credit pack credits don't expire needs validation with business model.

7. **Proration handling:** Plan change proration logic depends on Stripe configuration - needs testing.

8. **Guided Creative Direction Questionnaire (High Priority):**

   **Problem:** Many users don't know how to write effective creative direction prompts, leading to generic or suboptimal animations.

   **Proposed Solution:** Add an optional guided questionnaire in Step 3 that helps users who are unsure how to provide creative direction.

   **User Flow:**
   - Step 3 shows creative direction textarea (as currently designed)
   - Below textarea: Toggle/button "Need help? Use guided questionnaire"
   - Clicking activates a multi-step wizard with structured questions:

   **Sample Questions:**
   1. **Mood/Tone:** "What feeling should your animation convey?"
      - Options: Energetic & Dynamic | Professional & Trustworthy | Minimal & Clean | Playful & Fun | Bold & Impactful | Elegant & Sophisticated

   2. **Pace:** "How should the animation move?"
      - Options: Fast & Snappy | Smooth & Flowing | Slow & Dramatic | Medium Tempo

   3. **Visual Style:** "What visual aesthetic fits your brand?"
      - Options: Modern & Flat | 3D & Dimensional | Gradient & Colorful | Monochrome & Simple | Textured & Organic | Geometric & Sharp

   4. **Movement Type:** "What kind of motion appeals to you?"
      - Options: Spinning/Rotating | Zooming/Scaling | Sliding/Panning | Bouncing/Elastic | Fading/Dissolving | Morphing/Transforming

   5. **Color Emphasis:** "How should color be used?"
      - Options: Keep original logo colors exactly | Enhance with subtle effects | Add dramatic color shifts | Make it monochrome/greyscale

   6. **Purpose/Context:** "Where will you use this video?"
      - Options: YouTube intro/outro | Social media post | Presentation opener | Website header | Product demo | Email signature

   **AI Prompt Generation:**
   After completing the questionnaire, the system automatically generates a creative direction prompt by combining the user's selections:

   ```
   Example output from selections (Energetic, Fast, 3D, Spinning, Enhance colors, YouTube intro):

   "Create an energetic and dynamic animation with fast-paced movement. Use 3D dimensional effects with spinning/rotating motion. Enhance the original logo colors with vibrant effects. Style should be perfect for a YouTube intro - immediately grab attention and feel professional."
   ```

   **Implementation Notes:**
   - Questionnaire results are translated into natural language creative direction text
   - Generated prompt is inserted into the creative direction textarea (user can still edit)
   - User can re-run questionnaire to regenerate prompt
   - Analytics track questionnaire usage vs. manual entry to measure adoption
   - Consider A/B testing: questionnaire-generated prompts vs. manual prompts for quality comparison

   **Benefits:**
   - Lowers barrier to entry for non-creative users
   - Improves prompt quality and consistency
   - Reduces cognitive load and decision fatigue
   - Provides education on what makes effective creative direction
   - Increases likelihood of user satisfaction with results

   **Technical Requirements:**
   - Add questionnaire UI component (modal or inline wizard)
   - Create prompt template engine to convert selections to natural language
   - Store questionnaire responses in video metadata for future analysis
   - Add analytics events for questionnaire start/completion/abandon rates
