# Phase 4: Core Video Creation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Logo upload → parameter collection → n8n workflow trigger → video generation tracking. Users provide logo and preferences, system sends to n8n for processing, credits are managed, and video status is tracked. Video library and playback are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Upload experience
- Both drag-and-drop AND click to open file picker (maximum flexibility)
- Accept JPG/JPEG, PNG, WEBP only (Veo 3 requirement - no SVG support)
- Color extraction happens immediately on upload (fast feedback)

### Form structure
- Opinionated defaults: 15s duration, 1080p quality, Modern style
- No draft-saving - complete in one session (simpler, form is quick)

### Creative direction input
- Dropdown with preset options PLUS custom text field
- "Custom" choice reveals textarea for user's own creative direction

### Review & submission
- Redirect to dashboard after successful submission
- User sees video in processing state on main dashboard

### Claude's Discretion
- Form layout (multi-step wizard vs single-page) - choose best UX for video creation flow
- Upload error display pattern (inline, toast, or both)
- Review screen content (what gets shown before submit)
- Loading state during submission (button spinner, full-page, or modal)
- Webhook failure handling (retry logic, error display, form preservation)
- Credit check timing (when to validate sufficient balance)
- Insufficient credit handling (blocking vs warning)
- Credit cost display location (where in flow to show cost)
- Credit deduction timing (when to actually deduct credits)

</decisions>

<specifics>
## Specific Ideas

- File format restriction driven by Veo 3 video generation API limitations
- Color extraction should happen immediately on upload to give users fast feedback
- Default values based on what "works well" - 15s, 1080p, Modern style preset

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-core-video-creation*
*Context gathered: 2026-01-29*
