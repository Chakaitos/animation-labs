# PRD Clarification Session

**Source PRD**: ANIMATELABS_PRD.md
**Session Started**: 2026-02-04
**Depth Selected**: Long (20 questions)
**Total Questions**: 20
**Progress**: 20/20 ✓ COMPLETE
**Additional Updates**: 4 post-session clarifications added

---

## Session Log

## Question 1/20
**Category**: Business Rules / Pricing Model
**Ambiguity Identified**: PRD states "$3-5 per video" range but doesn't specify what determines the actual price
**Question Asked**: The PRD states videos cost '$3-5 per video'. What determines the actual price point within this range?
**User Response**: Video quality using a credit system (standard = 1 credit, premium = 2 credits). Although they are both 1080p the quality on premium is better
**Requirement Clarified**: Pricing is credit-based with two quality tiers - standard (1 credit) and premium (2 credits), both at 1080p resolution but with quality differences
**Follow-up Needed**: PRD mentions "720p / 1080p / 4K" options in section 6.2, which conflicts with "both are 1080p" - need to clarify resolution options

---

## Question 2/20
**Category**: Functional Requirements / User Inputs
**Ambiguity Identified**: Conflict between multiple resolution options (720p/1080p/4K) in PRD vs. user's statement that both tiers are 1080p
**Question Asked**: What resolution options should actually be available to users?
**User Response**: Only 1080p (standard and premium quality tiers)
**Requirement Clarified**: All videos are 1080p output. Users select quality tier (standard = 1 credit, premium = 2 credits), not resolution. The 720p/4K options should be removed from the PRD.
**Impact**: Simplifies UX (one less selection step), updates section 6.2 Details Step to remove quality radio buttons, replace with quality tier selector

---

## Question 3/20
**Category**: Business Rules / Credit Management
**Ambiguity Identified**: PRD states "Credits reset on billing cycle" but unclear if unused credits expire or roll over
**Question Asked**: What happens to unused credits at the end of a billing period?
**User Response**: Credits expire (use it or lose it)
**Requirement Clarified**: Unused credits are forfeited at the end of each billing cycle. Fresh credit allocation starts at renewal.
**Impact**: Important for user communication (display expiry warnings), billing page should show "Credits expire on [date]", consider email reminder before expiry

---

## Question 4/20
**Category**: Functional Requirements / File Validation
**Ambiguity Identified**: Max file size (10MB) specified but no minimum requirements defined for quality assurance
**Question Asked**: Should there be minimum file size or dimension requirements to ensure quality?
**User Response**: Recommended only (no hard minimums)
**Requirement Clarified**: No hard minimum requirements. System should show recommendations (e.g., "For best results, use logos at least 1000x1000px") and warn users if uploaded file is very small, but still allow upload.
**Impact**: Add to section 6.4 (Feedback & States) - show warning message for small files, update F1 validation rules

---

## Question 5/20
**Category**: UX Decisions / Style Selection
**Ambiguity Identified**: PRD mentions animation styles but doesn't specify catalog size or preview mechanism
**Question Asked**: How many style options should be available, and how do users preview them?
**User Response**: 10+ styles to choose from when creating a video, separate page with examples, and tooltip with description of each style
**Requirement Clarified**: Large style catalog (10+ options) with two preview mechanisms: (1) dedicated examples/gallery page users can browse before creating, (2) inline tooltips during style selection showing text descriptions
**Impact**: Add new route `/examples` or `/styles` to show style gallery, update section 6.2 Step 3 to include tooltip UI pattern, add to functional requirements (F13: Display style catalog with examples)

---

## Question 6/20
**Category**: Business Rules / Error Handling
**Ambiguity Identified**: PRD section 6.5 mentions failed videos but doesn't specify retry policy or credit implications
**Question Asked**: When a video fails, can users retry? Does retry use original credit or require new credit?
**User Response**: Free retry (uses original credit)
**Requirement Clarified**: Failed videos can be retried without spending additional credits. The original credit covers both initial attempt and any retries needed.
**Impact**: Update section 6.5 error handling to include "Retry" button on failed videos, update F11 to specify free retry policy, add to credit transaction logic (don't deduct on retry), database may need failed_video retry tracking

---

## Question 7/20
**Category**: Functional Requirements / Data Processing
**Ambiguity Identified**: PRD shows creative direction as user input but doesn't explain how it's processed or its impact on output
**Question Asked**: How is the creative direction text used in the video generation process?
**User Response**: AI prompt to customize animation
**Requirement Clarified**: Creative direction field is passed to the AI/generation system as a prompt parameter to influence and customize the animation style within the selected template.
**Impact**: Update section 7.2 Processing to include AI prompt customization step, add to n8n webhook payload documentation, consider prompt engineering guidelines or examples to help users write effective directions

---

## Question 8/20
**Category**: Non-Functional Requirements / Data Storage
**Ambiguity Identified**: PRD doesn't specify video library storage limits or retention policies
**Question Asked**: Are there limits on how many completed videos a user can store in their library?
**User Response**: Unlimited storage
**Requirement Clarified**: Users can store unlimited videos with no quantity limits or automatic deletion. All created videos remain accessible indefinitely.
**Impact**: Simplifies UX (no storage warnings needed), update assumptions section to note Supabase storage costs scale with usage, no need to implement storage quota tracking or video expiry logic

---

## Question 9/20
**Category**: Business Rules / Credit Management
**Ambiguity Identified**: PRD allows video deletion but doesn't specify credit refund policy
**Question Asked**: When a user deletes a completed video, what happens to the credits used to create it?
**User Response**: No refund (credits already spent)
**Requirement Clarified**: Deleting videos does not refund credits. Once credits are spent on video creation, they cannot be recovered through deletion.
**Impact**: Add to business rules documentation, consider showing warning on delete confirmation dialog ("Deleting this video will not refund your credits"), simplifies credit transaction logic (no reversal needed)

---

## Question 10/20
**Category**: Technical Requirements / Output Specifications
**Ambiguity Identified**: PRD doesn't specify video file format or codec for deliverables
**Question Asked**: What video file format and codec should completed videos be delivered in?
**User Response**: MP4 (H.264)
**Requirement Clarified**: All videos are delivered as MP4 files using H.264 codec for maximum compatibility across platforms and devices.
**Impact**: Add to section 7.3 Outputs and n8n workflow requirements, specify in technical documentation, ensure n8n rendering outputs H.264 MP4

---

## Question 11/20
**Category**: User Requirements / Authentication Flow
**Ambiguity Identified**: PRD shows auth flow but doesn't specify if email verification gates video creation
**Question Asked**: Must users verify their email address before they can create their first video?
**User Response**: Email verification required
**Requirement Clarified**: Email verification is mandatory. Users cannot access video creation features until they verify their email address.
**Impact**: Update section 4 Core Use Case to add verification step before "User clicks Create Video", add to auth flow documentation, implement email verification check in create-video page, show verification reminder on dashboard if unverified

---

## Question 12/20
**Category**: Technical Constraints / System Limits
**Ambiguity Identified**: PRD doesn't specify if there are rate limits beyond credit availability
**Question Asked**: Are there rate limits on video creation (time-based) or only credit-based limits?
**User Response**: Credits only (no time-based limits)
**Requirement Clarified**: No rate limiting based on time or concurrent processing. Users can create as many videos as quickly as they want, limited only by available credits.
**Impact**: Simplifies implementation (no rate limiting middleware needed), ensure n8n queue can handle burst requests, may want to add user-facing note "Create unlimited videos with your credits" as a feature

---

## Question 13/20
**Category**: Functional Requirements / Brand Name Display
**Ambiguity Identified**: Brand name is required input but PRD doesn't clarify if/how it appears in final video
**Question Asked**: Does brand name text always appear in the final video, or is visibility style-dependent?
**User Response**: Always appears (all styles show it)
**Requirement Clarified**: Brand name text is guaranteed to be visible in every animation style. All 10+ styles must be designed to incorporate text display.
**Impact**: Critical for n8n workflow design - all animation templates must support text rendering, add to style creation guidelines, update section 6.2 to clarify brand name will be displayed in video

---

## Question 14/20
**Category**: Functional Requirements / Aspect Ratio Support
**Ambiguity Identified**: PRD lists 3 aspect ratios (16:9, 9:16, 1:1) but doesn't specify if all styles support all ratios
**Question Asked**: Do all animation styles support all three aspect ratios?
**User Response**: All animation styles support only 2 aspect ratios: 16:9 and 9:16
**Requirement Clarified**: Only landscape (16:9) and vertical (9:16) formats are supported. Square format (1:1) should be removed from the PRD. All styles work with both supported aspect ratios.
**Impact**: Update section 6.2 Step 2 to remove "1:1 Square" option, update database schema validation if aspect_ratio field has enum constraint, simplifies n8n workflow (2 templates per style instead of 3)

---

## Question 15/20
**Category**: Functional Requirements / Media Generation
**Ambiguity Identified**: PRD mentions thumbnail_url in section 7.3 but doesn't explain thumbnail generation process
**Question Asked**: When and how are video thumbnails generated?
**User Response**: There is currently no thumbnail generation available
**Requirement Clarified**: Thumbnail generation is NOT implemented in MVP. The thumbnail_url field exists in database but will be null for all videos.
**Impact**: Update section 7.3 to note thumbnails are future feature, video cards should show placeholder image or video icon when thumbnail_url is null, remove thumbnail from n8n callback requirements, add to future enhancements backlog

---

## Question 16/20
**Category**: Business Rules / Subscription Management
**Ambiguity Identified**: PRD mentions subscriptions but doesn't specify if users can have multiple or how plan changes work
**Question Asked**: Can a user have multiple active subscriptions simultaneously?
**User Response**: One subscription + credit packs, and upgrade/downgrade replaces current
**Requirement Clarified**: Users can have ONE recurring subscription at a time. They can purchase additional one-time credit packs on top. Plan changes (upgrade/downgrade) immediately cancel the old subscription and start the new one.
**Impact**: Database must support one active subscription + multiple credit pack purchases (may need subscription_type field: 'recurring' vs 'one_time'), update billing page to show subscription + packs separately, implement plan change logic with proration handling

---

## Question 17/20
**Category**: Technical Constraints / System Capacity
**Ambiguity Identified**: PRD doesn't specify what happens when processing capacity is exceeded
**Question Asked**: What should happen to new requests when n8n processing queue becomes full?
**User Response**: No queue system implemented yet, using n8n default behavior
**Requirement Clarified**: No custom queue management in MVP. System relies on n8n's default queue handling for concurrent requests.
**Impact**: Document n8n default queue behavior in technical assumptions, add to risks section (potential bottleneck), consider monitoring n8n queue depth for future capacity planning, may need to implement custom queue logic in future if demand exceeds n8n defaults

---

## Question 18/20
**Category**: Functional Requirements / Audio Features
**Ambiguity Identified**: PRD mentions dialogue options but doesn't specify if it's audio (TTS) or visual text
**Question Asked**: Is dialogue referring to text-to-speech audio narration or visual text?
**User Response**: Text-to-speech audio narration
**Requirement Clarified**: Dialogue is spoken audio generated using text-to-speech (TTS) technology. Users can choose: (1) no audio, (2) TTS of brand name, or (3) TTS of custom text they provide.
**Impact**: Update section 6.2 to clarify dialogue is audio/voiceover, add TTS service to technical dependencies (section 7.1), n8n workflow must integrate TTS API, consider voice selection options in future (male/female, language, accent)

---

## Question 19/20
**Category**: Business Rules / Subscription Tiers
**Ambiguity Identified**: PRD mentions Starter and Professional plans but only differentiates by credits, unclear if there are feature differences
**Question Asked**: Besides credit allocation, are there feature differences between Starter and Professional plans?
**User Response**: Credits only (same features)
**Requirement Clarified**: Both Starter and Professional plans provide access to identical features (all styles, all options, same quality tiers). The only difference is the number of monthly credits allocated to each plan.
**Impact**: Simplifies access control (no feature gating by plan tier), all users see same options regardless of plan, pricing page should emphasize "All features included" and differentiate by credit quantity only

---

## Question 20/20
**Category**: UX Decisions / User Notifications
**Ambiguity Identified**: PRD shows 10-15 min turnaround but doesn't specify how users learn when video is ready
**Question Asked**: How should users be notified when video completes processing?
**User Response**: Email notification sent
**Requirement Clarified**: Email notifications are sent when video processing completes. Users receive email with link to view/download their finished video.
**Impact**: Add email notification requirement to section 7.2 Processing, integrate Resend API for video completion emails, n8n callback webhook should trigger email send, design email template showing video preview/download link, add to functional requirements (F14: Send completion emails)

---

## Additional Clarification: App Name Correction
**Category**: Branding
**Clarification**: App name is "Animation Labs" (two words), not "Animation Labs" (one word)
**Impact**: Updated throughout entire PRD

---

## Additional Clarification: Turnaround Time Update
**Category**: Performance Expectations
**Clarification**: Videos are typically ready within 5-10 minutes (not 10-15 minutes)
**Impact**: Updated all references to turnaround time in PRD

---

## Additional Clarification 21: Single Credit Trial Purchase
**Category**: Business Model / Pricing
**Clarification**: In addition to subscriptions and credit packs, users can purchase a single credit for $5 without any subscription commitment. This allows users to try the service before committing to a monthly plan.
**Impact**:
- Updated F12 to include single credit purchase option
- Added to assumptions section as new purchase option #10
- Updated pricing model description in section 2
- Simplifies user acquisition (lower barrier to entry)

---

## Additional Clarification 22: Fixed Duration (No User Selection)
**Category**: Functional Requirements / UX Simplification
**Clarification**: All videos are 8 seconds long. Duration is NOT user-selectable. The option to choose 3s/5s/10s has been removed.
**Impact**:
- Removed duration selector from Step 2 (section 6.2)
- Updated F2 validation requirements (remove duration validation)
- Added info text in Step 2: "All videos are 8 seconds long"
- Updated core use case flow (section 4) to remove duration selection
- Added to assumptions section #3 explaining rationale (simplify UX, standardize rendering)
- Updated video output specs to note "Duration: 8 seconds (fixed)"
- Simplifies form, reduces decision fatigue, standardizes n8n workflow

---

## Additional Clarification 23: Logo Formatting Guidelines
**Category**: Technical Requirements / Content Guidelines
**Clarification**: Need visual guidelines showing proper logo presentation for both aspect ratios (16:9 and 9:16) with sample images and AI-assisted formatting solution
**User Request**: "I would like to have an area that shows a picture of how the logos should be presented for both 16:9 and 9:16 formats (Sample images) and a suggested prompt for something like OpenAI to take in a logo and return with the proper resolution and padding."
**Impact**:
- Added new Section 8: "Logo Formatting Guidelines"
- Included ASCII diagram samples showing proper logo placement and padding for both aspect ratios
- Specified safe areas: 1400x800px for 16:9, 800x1400px for 9:16
- Provided detailed AI prompts for OpenAI Vision API to auto-format logos
- Included alternative programmatic approach using Python/PIL for deterministic formatting
- Added implementation notes for n8n workflow integration
- Ensures consistent logo presentation and eliminates poor-quality results from improperly sized uploads

---

## Additional Clarification 24: Guided Creative Direction Questionnaire (Future)
**Category**: Future Enhancement / UX Improvement
**Clarification**: Future version should include guided questionnaire for users who don't know how to write creative direction prompts
**User Request**: "In a later version I would also like for a user that does not have an idea on how to give creative direction to have a guided questionnaire to collect information and build creative direction context to feed the AI for better prompt generation"
**Impact**:
- Added to "Known Gaps & Future Enhancements" section as item #8 (High Priority)
- Detailed feature design including:
  - Optional toggle in Step 3: "Need help? Use guided questionnaire"
  - Multi-step wizard with 6 structured questions (Mood, Pace, Visual Style, Movement Type, Color Emphasis, Purpose)
  - Automatic AI prompt generation from user selections
  - Example prompt output template
- Benefits: Lowers barrier to entry, improves prompt quality, reduces decision fatigue
- Technical requirements: Questionnaire UI component, prompt template engine, analytics tracking
- Future A/B testing opportunity to compare questionnaire-generated vs. manual prompts

---
