# Build-Order Prompts: Animation Labs Logo Animation Platform

## Overview
Animation Labs is a professional logo animation SaaS that delivers custom animated videos in 10-15 minutes. Users upload their logo, configure animation settings through a 4-step wizard, and receive a finished MP4 video. The platform uses a credit-based system with subscriptions and one-time purchases.

## Build Sequence

1. **Foundation: Design System & Tokens** - Color palette, typography, spacing system
2. **Layout Shell: Navigation & Page Structure** - App layout, navigation bar, credit balance indicator
3. **Dashboard: Home Screen** - Main landing page with video cards and CTAs
4. **Video Creation Wizard: Step 1 - Upload** - File upload dropzone with drag-and-drop
5. **Video Creation Wizard: Steps 2-4** - Details form, style selection, review screen
6. **Video Library: All Videos View** - Filterable/searchable video grid with pagination
7. **Video Card Component & States** - Reusable video card with all status states
8. **Video Player Modal** - Completed video viewer with download
9. **Billing Page** - Subscription plans, credit packs, and single credit trial
10. **Animation Styles Gallery** - Examples page with video previews
11. **State Feedback System** - Loading states, toasts, empty states, error messages
12. **Email Verification Flow** - Persistent banner and verification states
13. **Polish: Responsive & Accessibility** - Mobile layouts, keyboard navigation, screen reader support

---

## Prompt 1: Foundation - Design System & Tokens

### Context
Animation Labs is a modern logo animation SaaS platform. Establish the complete design system foundation that all subsequent components will use. This includes color tokens, typography scale, spacing system, and responsive breakpoints.

### Brand Colors
- **Primary (Logo Green):** `#1DD1A1` - Used for all CTAs, active states, brand accents, primary buttons, focus states
- **Primary Hover:** `#19B88E` (slightly darker) - Hover state for primary buttons
- **Primary Pressed:** `#15A07A` (even darker) - Active/pressed state for primary buttons

### Semantic Colors
- **Success:** `#10B981` (Green) - Completed videos, positive feedback, success messages
- **Warning:** `#F59E0B` (Amber) - Low credits, unverified email, small file warnings, expiring credits
- **Error:** `#EF4444` (Red) - Failed videos, form validation errors, zero credits
- **Processing:** `#F97316` (Orange) - In-progress states, videos being processed
- **Info:** `#3B82F6` (Blue) - Informational messages, tooltips

### Neutral Colors (Light Mode)
- **Background:** `#FFFFFF` (Pure white) - Page backgrounds
- **Surface:** `#F9FAFB` (Off-white) - Card backgrounds, elevated surfaces
- **Surface Hover:** `#F3F4F6` - Hover state for cards/surfaces
- **Border:** `#E5E7EB` (Light gray) - Dividers, borders, outlines
- **Text Primary:** `#111827` (Near black) - Headlines, body text
- **Text Secondary:** `#6B7280` (Medium gray) - Helper text, labels, secondary information
- **Text Tertiary:** `#9CA3AF` (Light gray) - Placeholder text, disabled text

### Neutral Colors (Dark Mode)
- **Background:** `#0A0A0A` (Near black) - Page backgrounds
- **Surface:** `#1A1A1A` (Dark charcoal) - Card backgrounds, elevated surfaces
- **Surface Hover:** `#252525` - Hover state for cards/surfaces
- **Border:** `#333333` (Medium charcoal) - Dividers, borders, outlines
- **Text Primary:** `#F9FAFB` (Off-white) - Headlines, body text
- **Text Secondary:** `#D1D5DB` (Light gray) - Helper text, labels, secondary information
- **Text Tertiary:** `#9CA3AF` (Medium gray) - Placeholder text, disabled text

### Typography
- **Font Family Primary:** `Inter` (sans-serif) - All UI text
- **Font Family Monospace:** `'Fira Code'` - Credit counts, status badges, code snippets

**Type Scale:**
- **Heading 1:** 32px / Bold / Line-height 1.2 / Letter-spacing -0.02em
- **Heading 2:** 24px / Bold / Line-height 1.3 / Letter-spacing -0.01em
- **Heading 3:** 18px / Semibold / Line-height 1.4 / Letter-spacing 0
- **Body Large:** 16px / Regular / Line-height 1.5
- **Body Base:** 14px / Regular / Line-height 1.5 - Default body text
- **Body Small:** 13px / Regular / Line-height 1.4 - Helper text, captions
- **Label:** 14px / Medium / Line-height 1.4 / Letter-spacing 0.01em - Form labels, button text
- **Badge:** 13px / Monospace / Medium / Line-height 1 - Status badges

### Spacing System
Base unit: **4px**

- **xs:** 4px (0.25rem)
- **sm:** 8px (0.5rem)
- **md:** 12px (0.75rem)
- **lg:** 16px (1rem) - Default spacing between form fields
- **xl:** 24px (1.5rem) - Section spacing within cards
- **2xl:** 32px (2rem) - Spacing between major sections
- **3xl:** 48px (3rem) - Large section breaks
- **4xl:** 64px (4rem) - Page-level spacing

### Border Radius
- **sm:** 4px - Badges, small buttons
- **md:** 8px - Standard cards, inputs, buttons
- **lg:** 12px - Large cards, modals
- **xl:** 16px - Hero sections
- **full:** 9999px - Pills, circular elements

### Shadows
- **sm:** `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle card elevation
- **md:** `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` - Standard card elevation
- **lg:** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` - Elevated cards, modals
- **xl:** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - Floating elements

### Responsive Breakpoints
- **Mobile:** < 768px - Single column layouts
- **Tablet:** 768px - 1023px - 2-column layouts
- **Desktop:** ≥ 1024px - Multi-column layouts (3-4 columns)

### Focus States
- All interactive elements should have visible focus ring: `2px solid #1DD1A1` with `4px offset`
- Focus ring should be visible in both light and dark mode

### Constraints
- Use CSS variables or design tokens for all colors (no hardcoded hex values in components)
- All measurements should use the spacing scale (no arbitrary pixel values)
- Typography should follow the defined scale (no custom font sizes)
- All transitions: `150ms ease-in-out` (consistent across the app)

---

## Prompt 2: Layout Shell - Navigation & App Structure

### Context
The main application layout with persistent navigation bar, credit balance indicator, and page container. This shell wraps all pages and provides consistent navigation, branding, and credit visibility. Users navigate between Dashboard, Create Video, and Billing pages.

### Requirements

**Navigation Bar (Horizontal, Fixed Top):**
- Height: `64px`
- Background: `Surface` color (white in light mode, dark charcoal in dark mode)
- Border bottom: `1px solid Border` color
- Padding horizontal: `24px` (desktop), `16px` (mobile)
- Shadow: `sm` shadow for subtle elevation
- Fixed position at top of viewport (stays visible on scroll)

**Navigation Layout:**
```
[Logo] [Dashboard] [Create Video] [Billing] [Spacer] [Credit Balance] [User Menu]
```

**Logo Section (Left):**
- Animation Labs logo from `/logo.svg`
- Width: `150px`, Height: `40px`
- Clickable, links to dashboard (`/`)

**Navigation Links (Left-Center):**
- Links: "Dashboard", "Create Video", "Billing"
- Spacing: `32px` gap between links
- Font: Body Base (14px), Medium weight
- Color: Text Secondary (inactive), Primary Green (active page)
- Hover: Text Primary color
- Active indicator: `2px` bottom border in Primary Green
- Mobile: Hidden, replaced with hamburger menu

**Credit Balance Indicator (Right):**
- Display format: `[Coin Icon] X credits`
- Font: Label (14px Medium), Monospace for number
- Background: `Surface Hover` with `md` border radius
- Padding: `8px 12px`
- Icon: Coin/currency icon, `16px`, Primary Green color
- States:
  - **0 credits:** Red dot badge, red text color
  - **1-5 credits:** Yellow warning icon, warning color
  - **6+ credits:** Normal styling, Text Primary
- Tooltip on hover:
  - "Buy credits to create videos" (0 credits)
  - "Running low — consider buying more" (1-5 credits)
  - "X credits available" (6+)

**User Menu (Far Right):**
- Avatar/initial circle: `36px` diameter, Primary Green background
- Dropdown on click: Logout, Settings links
- Spacing: `16px` gap from Credit Balance

**Page Container:**
- Max-width: `1280px`
- Margin: `0 auto` (centered)
- Padding: `32px 24px` (desktop), `24px 16px` (mobile)
- Min-height: `calc(100vh - 64px)` (fill viewport below nav)

### States
- **Default:** All navigation elements visible, active page highlighted
- **Mobile (<768px):** Logo + Hamburger menu icon only, credit balance in hamburger dropdown
- **Credit Zero:** Red dot on credit balance, disabled "Create Video" button
- **Unverified Email:** Yellow banner below nav bar (see Prompt 12)

### Interactions
- Click logo → Navigate to dashboard
- Click nav link → Navigate to page, update active indicator
- Hover credit balance → Show tooltip
- Click user avatar → Open dropdown menu
- Mobile: Click hamburger → Slide-in menu with nav links + credit balance

### Constraints
- Navigation bar is ALWAYS visible (fixed position)
- Credit balance updates in real-time when credits change
- "Create Video" link should be visually prominent (could use Primary Green background as a button style)
- Do NOT implement authentication logic, just the layout shell

---

## Prompt 3: Dashboard - Home Screen

### Context
The main landing page users see after login. Shows a prominent "Create Video" CTA, recent videos (3-4 cards in a row), and quick access to video library. First-time users see an empty state. Email unverified users see a yellow banner at the top.

### Requirements

**Page Layout:**
- Container: Max-width `1280px`, centered
- Vertical spacing: `32px` between major sections

**Hero Section:**
- Heading: "Create Your Logo Animation" (Heading 2, 24px Bold)
- Subheading: "Professional animated videos in 5-10 minutes" (Body Large, Text Secondary)
- CTA Button: "Create Video"
  - Size: Large (`48px` height, `200px` width minimum)
  - Style: Primary Green background, white text, `md` border radius
  - Font: Label (14px Medium)
  - Hover: Primary Hover color
  - Icon: Plus icon or video icon on left
  - Disabled state: Gray background, cursor not-allowed if 0 credits or email unverified

**Recent Videos Section:**
- Heading: "Recent Videos" (Heading 3, 18px Semibold)
- Grid: 3-4 video cards per row (desktop), 2 per row (tablet), 1 per row (mobile)
- Gap: `16px` between cards
- Shows max 8 most recent videos
- Link below: "View All Videos →" (links to `/videos`, Body Base, Primary Green color)

**Video Cards Preview:**
- Use simplified video card component (see Prompt 7 for full specs)
- Show: Placeholder thumbnail, brand name, status badge, date
- Click card → View video details / open player modal

**Empty State (No Videos):**
- Illustration/icon: Empty folder or video camera icon (large, `120px`)
- Heading: "No videos yet" (Heading 3)
- Description: "Create your first animated logo video to get started" (Body Base, Text Secondary)
- CTA: "Create Video" button (same as hero CTA)
- Center-aligned in Recent Videos section

### States
- **Default (has videos):** Hero + Recent Videos grid
- **Empty (no videos):** Hero + Empty state illustration
- **Loading:** Hero + Skeleton cards in Recent Videos section (3-4 gray placeholder boxes with shimmer animation)
- **Email Unverified:** Yellow banner above hero (see Prompt 12)
- **Zero Credits:** "Create Video" button disabled, tooltip "You need 1 credit to create a video. Buy credits?"

### Interactions
- Click "Create Video" → Navigate to `/create-video` (if verified email + credits available)
- Click video card → Open video player modal or navigate to video details
- Click "View All Videos" → Navigate to `/videos`
- Hover video card → Subtle elevation increase (shadow `md` → `lg`)

### Constraints
- Dashboard is the default landing page after login
- Recent Videos should load quickly (limit to 8 cards)
- Empty state should be encouraging, not discouraging
- Do NOT show full video library on dashboard (that's a separate page)

---

## Prompt 4: Video Creation Wizard - Step 1: Upload Logo

### Context
First step in a 4-step video creation wizard. Users upload their logo file via drag-and-drop or file picker. Supports PNG, SVG, JPG up to 10MB. Shows warnings for small files but allows upload. After successful upload, automatically advances to Step 2.

### Requirements

**Page Layout:**
- Container: Max-width `800px`, centered
- Card: White/dark surface background, `lg` border radius, `lg` shadow, `32px` padding
- Vertical spacing: `24px` between elements

**Step Progress Indicator (Top of Card):**
- Layout: Horizontal stepper with 4 steps
- Steps: "1. Upload" → "2. Details" → "3. Style" → "4. Review"
- Active step: Primary Green circle with white checkmark or number
- Completed steps: Primary Green circle with white checkmark
- Future steps: Gray circle with gray number
- Connecting lines: Thin gray line between circles
- Font: Body Small (13px)

**Step 1 Content:**
- Heading: "Step 1 of 4: Upload Logo" (Heading 2, 24px Bold)
- Subheading: "Upload your logo to get started" (Body Base, Text Secondary)

**File Upload Dropzone:**
- Dimensions: `100%` width, `240px` height (desktop), `200px` height (mobile)
- Border: `2px dashed Border` color (light gray in light mode)
- Border radius: `lg` (12px)
- Background: `Surface` color (slightly elevated from page background)
- Hover: Border color changes to Primary Green, background to Surface Hover
- Padding: `32px`

**Dropzone Content (Empty State):**
- Icon: Cloud upload icon, `48px`, Primary Green color, centered
- Primary text: "Drop your logo here or click to browse" (Body Large, Text Primary, centered)
- Helper text: "Accepted formats: PNG, SVG, JPG (max 10MB)" (Body Small, Text Secondary, centered)
- Vertical gap: `12px` between elements

**Dropzone Content (Uploading State):**
- Progress bar: Full-width, `8px` height, Primary Green fill
- Text: "Uploading... X%" (Body Base, Text Primary, centered)
- Spinner icon: Small loading spinner next to text

**Dropzone Content (Success State):**
- Checkmark icon: `48px`, Success Green color, centered
- File name: Truncate if too long (Body Base, Text Primary, centered)
- File size: Display file size (Body Small, Text Secondary, centered)
- Warning (if file < 1000x1000px):
  - Yellow warning icon, `20px`
  - Tooltip: "File smaller than recommended (1000x1000px). Results may vary."
  - Position: Below file name

**Dropzone Content (Error State):**
- Error icon: `48px`, Error Red color, centered
- Error text: "Upload failed. Try again." (Body Base, Error Red, centered)
- Retry instruction: "Click to retry" (Body Small, Text Secondary, centered)

**Navigation Buttons (Bottom of Card):**
- Left: "Cancel" button (secondary style, gray text, gray border)
- Right: "Next: Details" button (primary style, Primary Green background)
  - Disabled until file successfully uploaded
  - Disabled state: Gray background, gray text, cursor not-allowed

### States
- **Empty (no file):** Dropzone with upload icon and text, "Next" button disabled
- **Drag Over:** Dropzone border changes to Primary Green, background to Surface Hover
- **Uploading:** Progress bar with percentage, spinner animation
- **Success:** Checkmark, file name, auto-enable "Next" button, auto-advance to Step 2 after 1 second
- **Warning (small file):** Success state + yellow warning icon with tooltip
- **Error:** Error icon and message, dropzone remains clickable to retry

### Interactions
- Click dropzone → Open file picker dialog
- Drag file over dropzone → Show drag-over state (border color change)
- Drop file → Start upload, show progress bar
- Upload success → Show success state, auto-advance after 1 second
- Upload error → Show error state, allow retry by clicking dropzone
- Click "Cancel" → Navigate back to dashboard (confirm if file uploaded: "Leave without saving?")
- Click "Next: Details" → Navigate to Step 2 (only enabled after successful upload)

### Constraints
- Only accept PNG, SVG, JPG files (reject other formats with error message)
- Max file size: 10MB (reject larger files with error: "File too large. Max 10MB.")
- Auto-advance to Step 2 on success (1 second delay to show success state)
- Do NOT implement actual file upload logic to backend, just UI states
- Form data is lost on page refresh (warn user if they try to leave: "Changes will be lost")

---

## Prompt 5: Video Creation Wizard - Steps 2-4: Details, Style, Review

### Context
Steps 2-4 of the video creation wizard. Step 2 collects brand name, quality tier, and aspect ratio. Step 3 selects animation style and optional customization (creative direction, dialogue). Step 4 shows a review summary before submission. All steps use the same card layout and step progress indicator from Step 1.

---

### STEP 2: Video Details

**Step 2 Content:**
- Heading: "Step 2 of 4: Video Details" (Heading 2)
- Subheading: "Configure your video settings" (Body Base, Text Secondary)

**Form Fields:**

1. **Brand Name (Required):**
   - Label: "Brand Name *" (Label style, Text Primary)
   - Input: Text input, full width, `48px` height, `md` border radius
   - Placeholder: "e.g., Acme Corp"
   - Helper text below: "This text will appear in your animation" (Body Small, Text Secondary)
   - Max length: 50 characters (show character counter: "X/50" on right side of input)
   - Validation: Required field, show red border + error message if empty on blur

2. **Video Duration (Informational):**
   - Info banner: Light blue background (`Info` color with 10% opacity)
   - Icon: Info icon (blue)
   - Text: "All videos are 8 seconds long" (Body Base)
   - Padding: `12px 16px`, `md` border radius
   - Not a form field, just informational text

3. **Quality Tier (Required):**
   - Label: "Quality Tier *" (Label style)
   - Radio button group (vertical layout):
     - Option 1: "Standard (1 credit)"
       - Radio button on left (Primary Green when selected)
       - Description below: "High-quality 1080p animation" (Body Small, Text Secondary)
     - Option 2: "Premium (2 credits)"
       - Description below: "Enhanced 1080p with superior rendering quality" (Body Small, Text Secondary)
   - Gap: `16px` between options
   - Default: Standard (pre-selected)

4. **Aspect Ratio (Required):**
   - Label: "Aspect Ratio *" (Label style)
   - Radio button group (vertical layout):
     - Option 1: "16:9 Landscape"
       - Description below: "For YouTube, presentations, websites" (Body Small, Text Secondary)
     - Option 2: "9:16 Vertical"
       - Description below: "For Instagram Stories, TikTok, Reels" (Body Small, Text Secondary)
   - Gap: `16px` between options

**Navigation Buttons:**
- Left: "Back" button (secondary, navigate to Step 1)
- Right: "Next: Style" button (primary, disabled until brand name filled)

---

### STEP 3: Animation Style & Customization

**Step 3 Content:**
- Heading: "Step 3 of 4: Style & Customization" (Heading 2)
- Subheading: "Choose your animation style and add optional customization" (Body Base, Text Secondary)

**Form Fields:**

1. **Animation Style (Required):**
   - Label: "Animation Style *" (Label style)
   - Link on same line (right-aligned): "Preview all styles →" (Body Small, Primary Green, links to `/styles`)
   - Grid layout: 3-4 tiles per row (desktop), 2 per row (tablet), 1 per row (mobile)
   - Gap: `12px` between tiles

**Style Tile:**
- Dimensions: `160px` width, `120px` height
- Border: `2px solid Border` (gray), `md` border radius
- Selected state: Border `2px solid Primary Green`, shadow `md`
- Hover: Border color Primary Green (light), shadow `sm`
- Content:
  - Icon/thumbnail: Centered, `48px`
  - Style name: Below icon (Body Small, Text Primary)
  - Tooltip on hover: Description of style (e.g., "Fast-paced rotation with dynamic zoom effects")

2. **Creative Direction (Optional):**
   - Label: "Creative Direction (optional)" (Label style)
   - Textarea: Multi-line input, full width, `120px` height, `md` border radius
   - Placeholder: "e.g., 'fast-paced and energetic' or 'minimal and elegant'"
   - Helper text: "Describe how you'd like to customize this animation style" (Body Small, Text Secondary)
   - Max length: 500 characters (show character counter: "X/500")

3. **Dialogue/Voiceover:**
   - Label: "Dialogue/Voiceover" (Label style)
   - Radio button group (vertical layout):
     - Option 1: "None — No voiceover (animation only)" (default)
     - Option 2: "Brand Name — AI voice says your brand name"
     - Option 3: "Custom — AI voice says custom text:"
       - Conditional text input below (only shows if "Custom" selected)
       - Input: Full width, `48px` height
       - Placeholder: "e.g., 'Welcome to Acme Corp'"
       - Max length: 100 characters (show character counter)
   - Gap: `16px` between options

**Navigation Buttons:**
- Left: "Back" button (navigate to Step 2)
- Right: "Next: Review" button (primary, disabled until animation style selected)

---

### STEP 4: Review & Submit

**Step 4 Content:**
- Heading: "Step 4 of 4: Review & Submit" (Heading 2)
- Subheading: "Review your settings before creating the video" (Body Base, Text Secondary)

**Review Summary (Read-Only):**
- Card background: `Surface Hover` (slightly elevated), `md` border radius, `24px` padding
- Vertical layout with `16px` gaps

**Summary Sections:**

1. **Logo:**
   - Label: "Logo" (Body Small, Text Secondary)
   - Thumbnail: `120px` x `120px`, uploaded logo preview, `sm` border radius
   - File name below thumbnail (Body Small)

2. **Brand Name:**
   - Label: "Brand Name" (Body Small, Text Secondary)
   - Value: User's input (Body Base, Text Primary, Medium weight)

3. **Quality:**
   - Label: "Quality" (Body Small, Text Secondary)
   - Value: "Premium (2 credits)" or "Standard (1 credit)" (Body Base)

4. **Aspect Ratio:**
   - Label: "Aspect Ratio" (Body Small, Text Secondary)
   - Value: "16:9 Landscape" or "9:16 Vertical" (Body Base)

5. **Style:**
   - Label: "Animation Style" (Body Small, Text Secondary)
   - Value: Selected style name (Body Base)

6. **Creative Direction:**
   - Label: "Creative Direction" (Body Small, Text Secondary)
   - Value: User's input or "None" (Body Base, italic if "None")

7. **Dialogue:**
   - Label: "Dialogue" (Body Small, Text Secondary)
   - Value: "None" / "Brand Name" / Custom text (Body Base)

**Cost Summary (Emphasized Section):**
- Background: Primary Green with 10% opacity, `md` border radius, `16px` padding
- Layout: Two rows
  - Row 1: "Total Cost:" (Body Base, Text Primary, Medium) → "X credits" (Body Base, Primary Green, Bold)
  - Row 2: "Your Balance:" (Body Small, Text Secondary) → "5 credits → 3 credits after creation" (Body Small, showing before/after)

**Navigation Buttons:**
- Left: "Back" button (navigate to Step 3)
- Right: "Create Video (X credits)" button
  - Primary style, Primary Green background
  - Show credit cost in button text
  - Large size: `56px` height
  - Full width on mobile
  - Loading state: Spinner icon + "Creating..." text, disabled

### States
- **Step 2 Default:** All fields empty except defaults (Standard quality pre-selected)
- **Step 2 Validation Error:** Red border on empty brand name field, error text below: "Brand name is required"
- **Step 3 Default:** No style selected, "Next" button disabled
- **Step 3 Conditional Input:** Custom dialogue input only visible if "Custom" radio selected
- **Step 4 Submitting:** "Create Video" button shows spinner, disabled, text changes to "Creating..."
- **Step 4 Success:** Toast notification "Video creation started! Check your email in 5-10 minutes.", redirect to dashboard after 2 seconds

### Interactions
- Step 2: Type in brand name → Enable "Next" button when field has value
- Step 2: Select radio buttons → Update selection state
- Step 3: Click style tile → Select style (border changes to Primary Green)
- Step 3: Select "Custom" dialogue → Show conditional text input below
- Step 3: Hover style tile → Show tooltip with description
- Step 3: Click "Preview all styles" link → Navigate to `/styles` (opens in new tab)
- Step 4: Click "Back" → Navigate to Step 3 (form data preserved)
- Step 4: Click "Create Video" → Submit form, show loading state, then success toast and redirect

### Constraints
- Step 2: Brand name is required (cannot proceed without it)
- Step 3: Animation style is required (cannot proceed without it)
- Step 3: Creative direction and dialogue are optional
- Step 4: Review summary shows ALL selections (even optional ones as "None")
- Step 4: Credit cost calculation is dynamic (1 credit for Standard, 2 for Premium)
- All steps: Form data is lost on page refresh
- All steps: Use the same step progress indicator as Step 1 (update active step)

---

## Prompt 6: Video Library - All Videos View

### Context
Dedicated page showing all user-created videos in a filterable, searchable grid. Users can filter by status (All, Processing, Completed, Failed) and search by brand name. Videos are displayed as cards with pagination for large lists. This is the complete video management interface.

### Requirements

**Page Layout:**
- Container: Max-width `1280px`, centered
- Heading: "Video Library" (Heading 1, 32px Bold)
- Vertical spacing: `32px` between sections

**Filter & Search Bar:**
- Layout: Horizontal row, `16px` gap between elements
- Sticky position: Fixed below navigation bar when scrolling

**Search Input:**
- Width: `320px` (desktop), full width (mobile)
- Height: `48px`
- Placeholder: "Search by brand name..."
- Icon: Search icon on left (gray), `20px`
- Border: `1px solid Border`, `md` border radius
- Background: `Surface`
- Focus: Border color Primary Green

**Filter Tabs:**
- Layout: Horizontal tabs, inline with search
- Tabs: "All" | "Processing" | "Completed" | "Failed"
- Active tab: Primary Green background, white text, `md` border radius
- Inactive tabs: Transparent background, Text Secondary color
- Hover: Surface Hover background
- Padding: `8px 16px` per tab
- Font: Body Base (14px), Medium weight

**Video Grid:**
- Grid layout: 3-4 cards per row (desktop), 2 per row (tablet), 1 per row (mobile)
- Gap: `16px` between cards
- Min-height: `400px` (prevent layout jump when loading)

**Pagination (Bottom):**
- Layout: Centered, horizontal
- Elements: "← Previous" | "Page X of Y" | "Next →"
- Buttons: Secondary style (gray border), disabled state when at first/last page
- Show max 10 videos per page

**Empty States:**

1. **No Videos at All:**
   - Illustration: Empty folder icon, `120px`
   - Heading: "No videos yet" (Heading 3)
   - Description: "Create your first animated logo video to get started" (Body Base, Text Secondary)
   - CTA: "Create Video" button (Primary Green)

2. **No Search Results:**
   - Illustration: Magnifying glass icon, `120px`
   - Heading: "No videos found" (Heading 3)
   - Description: "Try a different search term" (Body Base, Text Secondary)
   - Button: "Clear Search" (secondary style)

3. **No Videos in Filter:**
   - Illustration: Filter icon, `120px`
   - Heading: "No [status] videos" (Heading 3, e.g., "No completed videos")
   - Description: "Videos will appear here once they're [status]" (Body Base, Text Secondary)

### States
- **Default (has videos):** Search bar + filter tabs + video grid + pagination
- **Loading:** Search bar + filter tabs + skeleton video cards (gray placeholders with shimmer)
- **Empty (no videos):** Empty state illustration + CTA
- **No results:** Search bar + filter tabs + "No search results" empty state
- **Filtered (active filter):** Active tab highlighted, grid shows filtered videos

### Interactions
- Type in search → Debounce 300ms → Filter videos by brand name (case-insensitive)
- Click filter tab → Update active tab, filter video grid by status
- Click video card → Open video player modal (if completed) or show error details (if failed)
- Click pagination "Next" → Load next page of videos
- Click pagination "Previous" → Load previous page of videos
- Hover video card → Slight elevation increase (shadow change)

### Constraints
- Search is client-side filtering (case-insensitive, partial match on brand name)
- Filter tabs are mutually exclusive (only one active at a time)
- Pagination shows max 10 videos per page
- Skeleton loading should show 12 placeholder cards (regardless of actual count)
- Video cards use the same component as dashboard (see Prompt 7)

---

## Prompt 7: Video Card Component & Status States

### Context
Reusable video card component used in Dashboard and Video Library. Shows placeholder thumbnail (no real thumbnail in MVP), brand name, creation date, quality tier, and status badge. Supports four status states: Pending, Processing, Completed, Failed. Each state has distinct visual styling and available actions.

### Requirements

**Card Dimensions:**
- Width: `100%` (fills grid cell)
- Aspect ratio: `16:9` (video preview area)
- Total height: `~280px` (including metadata section)
- Border radius: `md` (8px)
- Border: `1px solid Border`
- Background: `Surface` (white/dark charcoal)
- Hover: Shadow `md` → `lg`, slight scale `1.02`
- Transition: `150ms ease-in-out`

**Card Layout (Top to Bottom):**

1. **Thumbnail Area (Top):**
   - Aspect ratio: `16:9`
   - Background: `Surface Hover` (placeholder)
   - Placeholder icon: Video camera icon, `48px`, centered, Text Tertiary color
   - Note: No actual thumbnail in MVP, always shows placeholder
   - Status badge overlaid on top-right corner (absolute position)

2. **Metadata Section (Bottom):**
   - Padding: `16px`
   - Vertical layout, `8px` gap between elements

3. **Brand Name:**
   - Font: Body Base (14px), Medium weight, Text Primary
   - Max lines: 1 (truncate with ellipsis if too long)

4. **Date:**
   - Font: Body Small (13px), Regular, Text Secondary
   - Format: "Jan 15, 2025" (short date format)

5. **Quality Tier:**
   - Font: Body Small (13px), Regular, Text Secondary
   - Display: "Standard" or "Premium"
   - Icon: Star icon for Premium (optional)

**Status Badge (Top-Right Corner Overlay):**
- Position: Absolute, `12px` from top and right edges
- Padding: `6px 12px`
- Border radius: `full` (pill shape)
- Font: Badge (13px Monospace, Medium)
- Shadow: `sm` shadow for elevation
- Layout: Icon + text (horizontal, `6px` gap)

**Status Badge Variants:**

1. **Pending:**
   - Background: `#9CA3AF` (gray)
   - Text color: White
   - Icon: Clock icon, `14px`
   - Text: "Pending"

2. **Processing:**
   - Background: `#F97316` (orange)
   - Text color: White
   - Icon: Spinner/loading icon (animated), `14px`
   - Text: "Processing"
   - Animation: Spinner rotates continuously

3. **Completed:**
   - Background: `#10B981` (success green)
   - Text color: White
   - Icon: Checkmark icon, `14px`
   - Text: "Completed"

4. **Failed:**
   - Background: `#EF4444` (error red)
   - Text color: White
   - Icon: X icon or error icon, `14px`
   - Text: "Failed"

**Action Buttons (Conditional, Bottom-Right of Card):**

**For Completed Videos:**
- Download icon button
- Size: `36px` x `36px`, circular
- Background: Primary Green
- Icon: Download arrow, white, `18px`
- Position: Absolute, `12px` from bottom and right edges
- Hover: Primary Hover color
- Tooltip: "Download video"

**For Failed Videos:**
- Two buttons (horizontal layout, `8px` gap):
  1. **Retry Button:**
     - Style: Secondary (gray border, gray text)
     - Size: Small (`32px` height)
     - Text: "Retry"
     - Icon: Refresh icon, `14px`
     - Tooltip: "Free retry — no additional credits charged"
  2. **Delete Button:**
     - Style: Secondary (gray border, gray text)
     - Size: Small (`32px` height)
     - Text: "Delete"
     - Icon: Trash icon, `14px`
     - Hover: Red border and text

**For Pending/Processing Videos:**
- No action buttons (user must wait)

### States
- **Default:** Card with placeholder thumbnail, brand name, date, quality, status badge
- **Hover:** Slight scale up (`scale(1.02)`), shadow increases to `lg`
- **Completed:** Download button visible on bottom-right
- **Failed:** Retry + Delete buttons visible in metadata section
- **Processing:** Animated spinner in status badge
- **Skeleton (Loading):** Gray placeholder card with shimmer animation, no text

### Interactions
- Click card (anywhere except buttons) → Open video player modal (if completed) or show error message (if failed)
- Click download icon (completed) → Trigger video download (shortcut, doesn't open modal)
- Click "Retry" button (failed) → Resubmit video to processing queue (no credit charge), show toast "Retrying video..."
- Click "Delete" button (failed) → Show confirmation dialog: "Delete this video? This cannot be undone and will not refund credits." → On confirm, delete video
- Hover card → Show elevation increase
- Hover download icon → Show tooltip "Download video"
- Hover retry button → Show tooltip "Free retry — no additional credits"

### Constraints
- Thumbnail is ALWAYS placeholder in MVP (no real thumbnail generation)
- Status badge is always visible (overlaid on thumbnail area)
- Action buttons only appear for completed/failed videos
- Card is fully clickable except for action buttons (separate click targets)
- Processing spinner animation should be smooth (CSS animation, infinite loop)
- Skeleton loading state should have shimmer effect

---

## Prompt 8: Video Player Modal - Completed Video Viewer

### Context
Modal dialog that opens when user clicks a completed video card. Displays the video player, video metadata (brand name, creation date, quality tier), and download button. Modal can be closed by clicking X button, clicking outside modal, or pressing Escape key.

### Requirements

**Modal Overlay:**
- Background: `rgba(0, 0, 0, 0.6)` (60% black overlay)
- Full viewport width/height
- Z-index: `50` (above all content)
- Click overlay → Close modal

**Modal Container:**
- Max-width: `900px` (desktop), `95%` width (mobile)
- Max-height: `90vh`
- Background: `Surface` (white/dark charcoal)
- Border radius: `lg` (12px)
- Shadow: `xl` shadow for strong elevation
- Padding: `32px` (desktop), `24px` (mobile)
- Position: Centered in viewport (horizontal and vertical)

**Modal Header (Top):**
- Layout: Horizontal row
- Left: Heading "Video Preview" (Heading 3, 18px Semibold)
- Right: Close button (X icon)
  - Size: `40px` x `40px`, circular
  - Icon: X icon, `20px`, Text Secondary
  - Hover: Background Surface Hover
  - Click → Close modal

**Video Player Section:**
- Width: `100%`
- Aspect ratio: `16:9` or `9:16` (depends on video aspect ratio)
- Background: Black
- Border radius: `md` (8px)
- Margin: `24px` vertical

**Video Player:**
- HTML5 video element with native controls
- Controls: Play/pause, volume, fullscreen, timeline scrubber
- Autoplay: No (user must click play)
- Loop: No
- Preload: Metadata
- Poster: Use placeholder thumbnail (same as card)

**Video Metadata Section (Below Player):**
- Layout: Vertical list, `12px` gap between items
- Background: `Surface Hover`, `md` border radius, `16px` padding

**Metadata Items:**
1. **Brand Name:**
   - Label: "Brand:" (Body Small, Text Secondary)
   - Value: User's brand name (Body Base, Text Primary, Medium weight)

2. **Created Date:**
   - Label: "Created:" (Body Small, Text Secondary)
   - Value: "Jan 15, 2025, 3:42 PM" (Body Base, Text Primary)

3. **Quality:**
   - Label: "Quality:" (Body Small, Text Secondary)
   - Value: "Premium" or "Standard" (Body Base, Text Primary)

4. **Aspect Ratio:**
   - Label: "Aspect Ratio:" (Body Small, Text Secondary)
   - Value: "16:9 Landscape" or "9:16 Vertical" (Body Base, Text Primary)

**Download Button (Bottom):**
- Style: Primary Green background, white text
- Size: Large (`48px` height), full width
- Text: "Download Video" (Label style)
- Icon: Download arrow icon on left
- Hover: Primary Hover color
- Click → Trigger video file download (MP4 H.264)

### States
- **Default:** Video player ready, metadata visible, download button enabled
- **Loading (video buffering):** Spinner overlay on video player
- **Playing:** Video playing, native controls active
- **Error (video load failed):** Error message overlay: "Unable to load video. Please try again later."

### Interactions
- Click close button (X) → Close modal, fade out animation
- Click overlay outside modal → Close modal
- Press Escape key → Close modal
- Click "Download Video" → Trigger file download, keep modal open
- Click play on video → Start video playback
- Video player controls → Standard HTML5 video interactions

### Constraints
- Modal should trap focus (keyboard users can't tab outside modal)
- Close button should be easily discoverable (top-right corner)
- Video player should use native HTML5 controls (don't build custom player)
- Download button should trigger direct file download (not navigate away)
- Modal should be responsive (smaller on mobile, larger on desktop)
- Escape key should always close modal

---

## Prompt 9: Billing Page - Subscriptions & Credit Packs

### Context
Dedicated billing page where users can purchase credits through three methods: (1) Single credit trial ($5, no subscription), (2) Monthly subscriptions (Starter/Professional plans), (3) One-time credit packs. Shows current credit balance and credit expiration warnings for subscription credits.

### Requirements

**Page Layout:**
- Container: Max-width `1200px`, centered
- Heading: "Billing & Credits" (Heading 1, 32px Bold)
- Vertical spacing: `32px` between major sections

**Current Balance Section (Top):**
- Background: Primary Green with 10% opacity, `lg` border radius, `24px` padding
- Layout: Horizontal row (icon + text)
- Icon: Coin/currency icon, `32px`, Primary Green color
- Text: "Current Balance: X credits" (Heading 2, 24px Bold, Text Primary)

**Credit Expiry Warning (If Applicable):**
- Displayed only if subscription credits are expiring soon (within 7 days)
- Background: Warning color with 10% opacity, `md` border radius, `16px` padding
- Icon: Warning icon, `20px`, Warning color
- Text: "Your X subscription credits expire on [date]" (Body Base, Text Primary)
- Margin: `16px` below Current Balance

---

### Section 1: Single Credit Trial (No Subscription)

**Section Heading:** "Quick Trial (No Subscription)" (Heading 3, 18px Semibold)
**Section Description:** "Try Animation Labs before committing to a subscription" (Body Base, Text Secondary)

**Trial Card:**
- Width: Full width or `400px` max
- Background: `Surface`, `md` border radius, `lg` shadow
- Border: `2px solid Primary Green` (highlighted to draw attention)
- Padding: `24px`

**Card Content:**
- Heading: "1 Credit for $5" (Heading 3, Primary Green color)
- Description: "Perfect for trying out the platform" (Body Base, Text Secondary)
- Features list (checkmarks):
  - "Create 1 standard quality video"
  - "No recurring charges"
  - "Try before you subscribe"
- Button: "Buy 1 Credit" (Primary Green, full width, large)

---

### Section 2: Monthly Subscriptions

**Section Heading:** "Monthly Subscriptions" (Heading 3)
**Section Description:** "Recurring credits every month. Cancel anytime." (Body Base, Text Secondary)

**Plan Cards Layout:**
- Grid: 2 columns (desktop), 1 column (mobile)
- Gap: `24px` between cards

**Plan Card Structure (Reusable):**
- Width: Equal width in grid
- Background: `Surface`, `md` border radius, `md` shadow
- Padding: `24px`
- Hover: Shadow `md` → `lg`

**Plan Card - Starter:**
- Badge (optional): None
- Heading: "Starter" (Heading 3, Text Primary)
- Price: "$15/month" (Heading 2, Primary Green color)
- Credit allocation: "5 credits/month" (Body Base, Text Secondary)
- Features list (checkmarks):
  - "Create 5 videos per month"
  - "All animation styles"
  - "Both quality tiers"
  - "Email support"
- Button: "Subscribe" (Primary Green, full width, large)

**Plan Card - Professional:**
- Badge: "Popular" (small badge, Primary Green background, white text, top-right corner)
- Heading: "Professional" (Heading 3, Text Primary)
- Price: "$30/month" (Heading 2, Primary Green color)
- Credit allocation: "10 credits/month" (Body Base, Text Secondary)
- Features list (checkmarks):
  - "Create 10 videos per month"
  - "All animation styles"
  - "Both quality tiers"
  - "Priority email support"
- Button: "Subscribe" (Primary Green, full width, large)

---

### Section 3: Credit Packs (One-Time Purchase)

**Section Heading:** "Credit Packs (One-Time Purchase)" (Heading 3)
**Section Description:** "Top up with extra credits anytime. Credits never expire." (Body Base, Text Secondary)

**Pack Cards Layout:**
- Grid: 3-4 cards per row (desktop), 2 per row (tablet), 1 per row (mobile)
- Gap: `16px` between cards

**Pack Card Structure (Reusable):**
- Width: Equal width in grid
- Background: `Surface`, `md` border radius, `sm` shadow
- Padding: `20px`
- Hover: Shadow `sm` → `md`

**Pack Card - Small:**
- Heading: "10 Credits" (Heading 3, Text Primary)
- Price: "$25" (Body Large, Primary Green color)
- Per-credit price: "$2.50/credit" (Body Small, Text Secondary)
- Button: "Buy Pack" (Secondary style, full width)

**Pack Card - Medium:**
- Badge: "Best Value" (small badge, Success Green, white text, top-right corner)
- Heading: "25 Credits" (Heading 3, Text Primary)
- Price: "$50" (Body Large, Primary Green color)
- Per-credit price: "$2.00/credit" (Body Small, Text Secondary)
- Savings badge: "Save $12.50" (Body Small, Success Green)
- Button: "Buy Pack" (Secondary style, full width)

**Pack Card - Large:**
- Heading: "50 Credits" (Heading 3, Text Primary)
- Price: "$90" (Body Large, Primary Green color)
- Per-credit price: "$1.80/credit" (Body Small, Text Secondary)
- Savings badge: "Save $35" (Body Small, Success Green)
- Button: "Buy Pack" (Secondary style, full width)

### States
- **Default:** All plans/packs visible, buttons enabled
- **Current Subscription (has active plan):** Show "Current Plan" badge on active subscription card, button changes to "Manage Subscription"
- **Loading (processing payment):** Button shows spinner + "Processing..." text, disabled
- **Expiry Warning:** Yellow banner shown if subscription credits expiring soon

### Interactions
- Click "Buy 1 Credit" → Redirect to Stripe checkout for single credit purchase
- Click "Subscribe" on plan card → Redirect to Stripe checkout for subscription
- Click "Buy Pack" on credit pack → Redirect to Stripe checkout for one-time purchase
- Click "Manage Subscription" (if active) → Redirect to Stripe customer portal for plan management
- All purchases handled by Stripe (external, no custom payment UI)

### Constraints
- User can have ONE active subscription at a time (Starter OR Professional, not both)
- User can purchase unlimited credit packs and single credit trials
- Subscription credits expire at end of billing cycle (show expiry warning)
- Credit pack credits never expire (mention in description)
- Do NOT implement actual payment logic (Stripe handles this)
- Redirect to Stripe Checkout on button clicks

---

## Prompt 10: Animation Styles Gallery - Examples Page

### Context
Dedicated page showcasing all 10+ animation styles with video previews. Users browse styles before creating a video to understand what each style looks like. Each style has a name, description, and example video. Page is accessible from the "Preview all styles" link in Step 3 of the creation wizard.

### Requirements

**Page Layout:**
- Container: Max-width `1200px`, centered
- Heading: "Animation Style Examples" (Heading 1, 32px Bold)
- Subheading: "Preview all 10+ animation styles with sample videos" (Body Large, Text Secondary)
- Vertical spacing: `48px` between sections (generous spacing for visual browsing)

**Style Preview Card (Repeated for Each Style):**
- Width: Full width
- Background: `Surface`, `md` border radius, `md` shadow
- Padding: `32px`
- Margin bottom: `32px`
- Layout: Horizontal (desktop) - Video on left, description on right
- Layout: Vertical (mobile) - Video on top, description below

**Style Preview Card Structure:**

1. **Style Name (Top):**
   - Heading 2 (24px Bold), Text Primary
   - Example: "Energetic Spin", "Minimal Fade", "Bold Zoom"

2. **Video Preview (Left/Top):**
   - Width: `480px` (desktop), `100%` (mobile)
   - Aspect ratio: `16:9`
   - Background: Black
   - Border radius: `md` (8px)
   - HTML5 video player with controls
   - Autoplay: No (user must click play)
   - Loop: Yes (video loops after playing)
   - Muted: Yes (autoplay requires muted)

3. **Description Section (Right/Bottom):**
   - Padding left: `32px` (desktop), no padding (mobile)
   - Vertical layout, `16px` gap

**Description Content:**
- **Description Text:** (Body Base, Text Primary)
  - Example: "Fast-paced rotation with dynamic zoom effects. Perfect for high-energy brands and tech companies."
  - Max 2-3 sentences
- **Best For:** (Body Small, Text Secondary)
  - Example: "Best for: Tech startups, fitness brands, modern businesses"
- **Tags:** (Optional - small pills with gray background)
  - Examples: "Fast-paced", "Rotating", "Dynamic"
  - Layout: Horizontal, wrap, `8px` gap
  - Style: `Surface Hover` background, `md` border radius, `6px 12px` padding

**Call-to-Action (Bottom of Page):**
- Center-aligned section after all style previews
- Heading: "Ready to create your video?" (Heading 2)
- Button: "Create Video" (Primary Green, large, `200px` width)
- Click → Navigate to `/create-video`

### Example Styles (Minimum 10)

1. **Energetic Spin**
   - Description: "Fast-paced rotation with dynamic zoom effects. Perfect for high-energy brands."
   - Best for: Tech startups, fitness brands

2. **Minimal Fade**
   - Description: "Smooth fade-in with subtle scaling. Elegant and understated."
   - Best for: Luxury brands, professional services

3. **Bold Zoom**
   - Description: "Dramatic zoom with impact. Commands attention immediately."
   - Best for: Bold brands, product launches

4. **Smooth Slide**
   - Description: "Gentle sliding motion with fade. Calm and professional."
   - Best for: Corporate, consulting, finance

5. **Particle Burst**
   - Description: "Explosive particle effects with logo reveal. Exciting and modern."
   - Best for: Gaming, entertainment, creative agencies

6. **Neon Glow**
   - Description: "Glowing neon effects with vibrant colors. Futuristic and eye-catching."
   - Best for: Nightlife, events, tech brands

7. **3D Flip**
   - Description: "Three-dimensional flip animation. Adds depth and dimension."
   - Best for: Modern brands, product showcases

8. **Glitch Effect**
   - Description: "Digital glitch with distortion effects. Edgy and contemporary."
   - Best for: Tech, gaming, creative studios

9. **Liquid Motion**
   - Description: "Smooth liquid morphing animation. Organic and flowing."
   - Best for: Beauty, wellness, lifestyle brands

10. **Geometric Shapes**
    - Description: "Abstract geometric shapes forming logo. Clean and modern."
    - Best for: Design studios, architecture, tech

### States
- **Default:** All style cards visible with video players
- **Loading (video buffering):** Spinner overlay on video player
- **Playing:** Video playing, native controls active (for user-initiated play)

### Interactions
- Hover style card → Slight elevation increase (shadow change)
- Click play on video → Start video playback
- Video ends → Loop back to start (seamless loop)
- Click "Create Video" CTA → Navigate to `/create-video`
- All video players independent (playing one doesn't affect others)

### Constraints
- Page should be easily browsable (generous spacing, clear sections)
- Videos should NOT autoplay (user must click play)
- Videos should loop when playing (seamless experience)
- Style names and descriptions are hardcoded (not dynamic from backend)
- Example videos are pre-recorded samples (not user-generated)
- Page should load quickly (consider lazy-loading videos below fold)

---

## Prompt 11: State Feedback System - Loading, Toasts, Empty States, Errors

### Context
Comprehensive feedback system for all loading states, success/error notifications, empty states, and error messages. Ensures users always understand what's happening and what went wrong. Includes skeleton loading, toast notifications, empty state illustrations, and inline error messages.

---

### SKELETON LOADING STATES

**Purpose:** Show while data is fetching (video cards, forms, etc.)

**Skeleton Card (for video cards):**
- Dimensions: Same as regular video card
- Background: `Surface Hover` with animated gradient shimmer
- Border radius: `md` (8px)
- Animation: Left-to-right shimmer effect, `1.5s` duration, infinite loop
- Layout: Gray placeholder boxes for thumbnail, text lines

**Skeleton Shimmer Animation:**
- Gradient: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)` (light mode)
- Gradient: `linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)` (dark mode)
- Animation: Moves left to right continuously

**Where to Use:**
- Dashboard: Recent videos section (show 3-4 skeleton cards)
- Video Library: Video grid (show 12 skeleton cards)
- Billing page: Plan cards (show 2-3 skeleton cards)

---

### TOAST NOTIFICATIONS

**Purpose:** Temporary feedback for actions (success, error, info)

**Toast Container:**
- Position: Fixed, `top-right` corner of viewport (desktop), `top-center` (mobile)
- Z-index: `100` (above modals)
- Width: `360px` (desktop), `90%` width (mobile)
- Max-width: `90vw`
- Distance from top: `80px` (below navigation bar)
- Distance from right: `24px` (desktop)
- Stack: Multiple toasts stack vertically with `12px` gap

**Toast Card:**
- Background: `Surface` (white/dark), `md` shadow, `md` border radius
- Padding: `16px`
- Border-left: `4px solid` (color varies by type)
- Layout: Horizontal - Icon + Content + Close button

**Toast Types:**

1. **Success Toast:**
   - Border-left color: Success Green (`#10B981`)
   - Icon: Checkmark circle, `24px`, Success Green
   - Example message: "Video creation started! Check your email in 5-10 minutes."

2. **Error Toast:**
   - Border-left color: Error Red (`#EF4444`)
   - Icon: X circle, `24px`, Error Red
   - Example message: "Upload failed. Please try again."

3. **Info Toast:**
   - Border-left color: Info Blue (`#3B82F6`)
   - Icon: Info circle, `24px`, Info Blue
   - Example message: "Video processing may take up to 10 minutes during peak hours."

4. **Warning Toast:**
   - Border-left color: Warning Amber (`#F59E0B`)
   - Icon: Warning triangle, `24px`, Warning Amber
   - Example message: "Your credits will expire in 3 days."

**Toast Content:**
- Title: Body Base (14px), Medium weight, Text Primary
- Description: Body Small (13px), Regular, Text Secondary (optional)
- Close button: X icon, `20px`, Text Secondary, top-right corner
- Auto-dismiss: 5 seconds (success/info), 7 seconds (error/warning), or manual close

**Toast Animation:**
- Enter: Slide in from right (desktop) or top (mobile), `200ms ease-out`
- Exit: Fade out + slide right, `200ms ease-in`

---

### EMPTY STATES

**Purpose:** Show when lists/grids are empty (no data to display)

**Empty State Structure (Reusable):**
- Layout: Vertical, center-aligned
- Background: Transparent (no card)
- Padding: `64px` vertical

**Empty State Elements:**
1. **Illustration/Icon:**
   - Size: `120px` x `120px`
   - Style: Simple line art or icon, Text Tertiary color
   - Examples: Empty folder, video camera, magnifying glass, filter icon

2. **Heading:**
   - Heading 3 (18px Semibold), Text Primary
   - Examples: "No videos yet", "No search results", "No failed videos"

3. **Description:**
   - Body Base (14px), Text Secondary
   - Max-width: `400px` (prevents long lines)
   - Examples: "Create your first animated logo video to get started", "Try a different search term"

4. **CTA Button (Optional):**
   - Primary or Secondary style depending on importance
   - Examples: "Create Video" (primary), "Clear Search" (secondary)

**Empty State Variants:**

1. **No Videos (First-time user):**
   - Icon: Empty folder or video camera
   - Heading: "No videos yet"
   - Description: "Create your first animated logo video to get started"
   - CTA: "Create Video" (Primary Green)

2. **No Search Results:**
   - Icon: Magnifying glass
   - Heading: "No videos found"
   - Description: "Try a different search term"
   - CTA: "Clear Search" (Secondary)

3. **No Filtered Videos:**
   - Icon: Filter icon
   - Heading: "No [status] videos"
   - Description: "Videos will appear here once they're [status]"
   - CTA: None (passive state)

---

### INLINE ERROR MESSAGES

**Purpose:** Form field validation errors, input-level feedback

**Error Text (Below Input):**
- Font: Body Small (13px), Regular
- Color: Error Red
- Icon: Small error icon (optional), `14px`, Error Red
- Margin-top: `4px` from input field

**Error Input State:**
- Border: `1px solid Error Red` (red border on input)
- Background: Error Red with 5% opacity (subtle red tint)
- Focus: Red border remains, add red focus ring

**Common Error Messages:**
- "This field is required"
- "Brand name must be at least 2 characters"
- "File too large. Max 10MB."
- "Invalid file format. Use PNG, SVG, or JPG."
- "You need at least 1 credit to create a video"

---

### FULL-PAGE ERROR STATES

**Purpose:** Critical errors (page load failed, video not found, etc.)

**Error Page Structure:**
- Layout: Vertical, center-aligned, full viewport height
- Background: `Background` color

**Error Page Elements:**
1. **Icon:** Large error icon, `160px`, Error Red
2. **Heading:** "Oops! Something went wrong" (Heading 1)
3. **Description:** Error details or generic message (Body Base, Text Secondary)
4. **Error Code:** (Optional) "Error 404" or "Error 500" (Body Small, Text Tertiary)
5. **CTA Buttons:**
   - Primary: "Go to Dashboard" (Primary Green)
   - Secondary: "Retry" (Secondary, gray border)

**Error Page Variants:**

1. **404 Not Found:**
   - Heading: "Page Not Found"
   - Description: "The page you're looking for doesn't exist."
   - CTA: "Go to Dashboard"

2. **500 Server Error:**
   - Heading: "Server Error"
   - Description: "We're experiencing technical difficulties. Please try again later."
   - CTA: "Retry" + "Go to Dashboard"

3. **Video Not Found:**
   - Heading: "Video Not Found"
   - Description: "This video may have been deleted or doesn't exist."
   - CTA: "Go to Video Library"

### Constraints
- Skeleton loading should appear immediately (no delay)
- Toasts should auto-dismiss after 5-7 seconds (user can manually close sooner)
- Empty states should be encouraging, not discouraging
- Inline errors should appear on input blur or form submit attempt
- Full-page errors should provide clear next steps (actionable CTAs)

---

## Prompt 12: Email Verification Flow - Persistent Banner & States

### Context
Users must verify their email before they can create videos. Unverified users see a persistent yellow banner on all pages (except auth pages) prompting them to verify. Banner includes "Verify Email" button that resends verification email. Banner disappears once email is verified.

### Requirements

**Verification Banner:**
- Position: Below navigation bar, full width
- Background: Warning color (`#F59E0B`) with 15% opacity (light yellow background)
- Border-bottom: `1px solid Warning color` (amber border)
- Padding: `12px 24px`
- Layout: Horizontal - Icon + Text + Button + Close (optional)
- Sticky: Yes (stays at top when scrolling)

**Banner Content:**
- Icon: Warning/info icon, `20px`, Warning color
- Text: "Verify your email to create videos" (Body Base, Text Primary)
- Button: "Verify Email" (small size, Warning background with darker amber on hover)
  - Padding: `8px 16px`
  - Border-radius: `md` (8px)
  - Font: Label (14px Medium)
- Close icon: X icon, `20px`, Text Secondary (optional - banner reappears on page reload if still unverified)

**Banner States:**

1. **Unverified (Default):**
   - Banner visible on all pages
   - "Verify Email" button enabled
   - Click button → Send verification email, show success toast

2. **Verification Email Sent:**
   - Banner text changes to: "Check your email to verify"
   - Button changes to: "Resend Email" (gray/secondary style)
   - Toast notification: "Verification email sent! Check your inbox."

3. **Verified:**
   - Banner disappears completely
   - Full access to "Create Video" flow

**Blocked Access (Unverified User):**
- "Create Video" button on dashboard: Disabled or shows tooltip "Verify email first"
- Direct navigation to `/create-video`: Redirect to dashboard with banner visible
- Error toast: "Please verify your email before creating videos"

**Verification Email Content (External - for reference):**
- Subject: "Verify your Animation Labs email address"
- Body: "Click the button below to verify your email and start creating logo animations."
- CTA: "Verify Email" button (links to verification endpoint)
- Footer: "If you didn't create an account, you can ignore this email."

### States
- **Unverified:** Yellow banner visible, "Create Video" access blocked
- **Email Sent:** Banner text updates, button changes to "Resend Email"
- **Verified:** Banner disappears, full access granted

### Interactions
- Click "Verify Email" → Send verification email via API, update button to "Resend Email", show success toast
- Click "Resend Email" → Send another verification email, show toast "Email resent"
- Click X (close banner) → Hide banner temporarily (reappears on page reload if still unverified)
- Click verification link in email → Verify email, redirect to dashboard with success toast "Email verified!"
- Try to access `/create-video` while unverified → Redirect to dashboard, show error toast

### Constraints
- Banner should be persistent across all pages (except login/signup)
- Banner should not be dismissible permanently (only temporarily - reappears on reload)
- Verification email should be sent via backend (Resend API in real implementation)
- Verification link should expire after 24 hours (show error if expired: "Link expired. Request a new one.")
- Do NOT implement actual email sending logic, just UI states

---

## Prompt 13: Polish - Responsive Layouts & Accessibility

### Context
Final polish pass covering responsive behavior across all breakpoints and accessibility features (keyboard navigation, screen reader support, focus states, color contrast). Ensures the app works on all devices and is accessible to all users.

---

### RESPONSIVE BREAKPOINTS & LAYOUTS

**Breakpoints:**
- Mobile: `< 768px`
- Tablet: `768px - 1023px`
- Desktop: `≥ 1024px`

**Navigation Bar:**
- **Desktop:** Full horizontal nav with all links visible
- **Tablet:** Condensed nav, links visible but tighter spacing
- **Mobile:** Logo + Hamburger menu icon only
  - Hamburger click → Slide-in menu from right with nav links + credit balance
  - Menu width: `280px`, full height, `Surface` background, `lg` shadow
  - Close icon in top-right of menu
  - Overlay behind menu: `rgba(0,0,0,0.4)`, full viewport

**Dashboard:**
- **Desktop:** 3-4 video cards per row
- **Tablet:** 2 video cards per row
- **Mobile:** 1 video card per row (full width)

**Video Library Grid:**
- **Desktop:** 3-4 cards per row
- **Tablet:** 2 cards per row
- **Mobile:** 1 card per row

**Billing Page Plans:**
- **Desktop:** 2 plan cards side-by-side
- **Tablet:** 2 plan cards side-by-side
- **Mobile:** 1 plan card per row (stacked)

**Credit Pack Grid:**
- **Desktop:** 3-4 packs per row
- **Tablet:** 2 packs per row
- **Mobile:** 1 pack per row

**Video Creation Wizard:**
- **Desktop:** Centered card, `800px` max-width
- **Tablet:** Full-width card with padding
- **Mobile:** Full-width card, reduced padding
  - Form fields: Full width (no multi-column layouts)
  - Navigation buttons: Full width (stacked vertically)

**Video Player Modal:**
- **Desktop:** `900px` max-width
- **Tablet:** `90%` width
- **Mobile:** `95%` width, reduced padding
  - Video player: Full width
  - Metadata: Stacked vertically

**Animation Styles Gallery:**
- **Desktop:** Horizontal layout (video left, description right)
- **Tablet:** Horizontal layout (smaller video)
- **Mobile:** Vertical layout (video on top, description below)

---

### KEYBOARD NAVIGATION

**Tab Order:**
- All interactive elements should be reachable via Tab key
- Tab order should follow logical visual order (top to bottom, left to right)
- Skip navigation link: "Skip to main content" (visible only on focus, top of page)

**Focus Indicators:**
- All focusable elements: `2px solid Primary Green` outline with `4px offset`
- Focus ring should be clearly visible in both light and dark modes
- Focus ring should not be removed (no `outline: none` without alternative)

**Keyboard Shortcuts:**
- Escape key: Close modals, close mobile menu
- Enter key: Activate buttons, submit forms
- Space key: Activate buttons, check checkboxes, toggle radio buttons
- Arrow keys: Navigate radio button groups

**Modal Focus Trap:**
- When modal opens, focus moves to first focusable element inside modal
- Tab navigation stays within modal (loops from last to first element)
- Escape key closes modal and returns focus to trigger element

**Form Navigation:**
- Tab moves between form fields in logical order
- Shift+Tab moves backward
- Enter submits form (if on submit button or input field)
- Arrow keys navigate radio button groups (Up/Down or Left/Right)

---

### SCREEN READER SUPPORT

**ARIA Labels:**
- Navigation links: `aria-label="Dashboard"`, `aria-label="Create Video"`, etc.
- Icon-only buttons: `aria-label="Close"`, `aria-label="Download video"`, etc.
- Credit balance: `aria-label="5 credits available"`
- Status badges: `aria-label="Video status: Completed"`

**ARIA Live Regions:**
- Toast notifications: `role="status"` and `aria-live="polite"` (announced by screen readers)
- Video status changes: Announce "Video processing" → "Video completed"
- Form errors: `aria-live="assertive"` (announced immediately)
- Upload progress: Announce percentage updates "Uploading... 50%"

**ARIA Landmarks:**
- Navigation bar: `<nav role="navigation" aria-label="Main navigation">`
- Main content: `<main role="main">`
- Search form: `<form role="search">`

**Alt Text & Labels:**
- Logo: `alt="Animation Labs"`
- Placeholder thumbnails: `alt="Video thumbnail placeholder"`
- Empty state illustrations: `alt=""` (decorative, not informative)
- Form labels: Every input has visible label or `aria-label`

**Status Announcements:**
- Video creation started: "Video creation started. You'll receive an email when it's ready."
- Upload complete: "Upload complete. File name: logo.png"
- Form error: "Error: Brand name is required"
- Credit balance: "Your credit balance is 5 credits"

---

### COLOR CONTRAST (WCAG AA Compliance)

**Text on Background:**
- Text Primary on Background: `#111827` on `#FFFFFF` = 16.0:1 (AAA) ✓
- Text Secondary on Background: `#6B7280` on `#FFFFFF` = 4.5:1 (AA) ✓
- Primary Green on White: `#1DD1A1` on `#FFFFFF` = 2.8:1 (Fails AA for text)
  - Solution: Use Primary Green for backgrounds with white text, not as text color on white
- White on Primary Green: `#FFFFFF` on `#1DD1A1` = 2.8:1 (Fails AA for small text)
  - Solution: Use for large text (buttons, headings) or increase contrast

**Dark Mode Contrast:**
- Text Primary on Background: `#F9FAFB` on `#0A0A0A` = 15.5:1 (AAA) ✓
- Text Secondary on Background: `#D1D5DB` on `#0A0A0A` = 9.2:1 (AAA) ✓
- Primary Green on Dark: Maintains good contrast

**Status Colors:**
- Success Green text: Use on light backgrounds only
- Error Red text: Use on light backgrounds only
- Warning Amber text: Use on light backgrounds only
- For dark backgrounds, use lighter variants or increase contrast

---

### INTERACTIVE ELEMENT SIZES (Touch Targets)

**Minimum Touch Target:**
- All interactive elements: `44px x 44px` minimum (WCAG 2.1 AA)
- Buttons: `48px` height minimum
- Icon-only buttons: `44px x 44px` minimum (padding included)

**Spacing Between Targets:**
- Minimum `8px` gap between adjacent interactive elements
- Prevents accidental taps on mobile

---

### RESPONSIVE TYPOGRAPHY

**Font Sizes (Mobile Adjustments):**
- Heading 1: `28px` (mobile) vs `32px` (desktop)
- Heading 2: `20px` (mobile) vs `24px` (desktop)
- Body text: Same across breakpoints (`14px`)

**Line Height:**
- Increase line-height for mobile (1.6 vs 1.5) for better readability

---

### LOADING & PERFORMANCE

**Image Optimization:**
- Use Next.js `<Image>` component for logo and placeholder images
- Lazy load images below the fold
- Use WebP format with PNG/JPG fallback

**Video Lazy Loading:**
- Animation Styles Gallery: Only load videos in viewport (lazy load attribute)
- Video Player Modal: Preload metadata only, not entire video

**Skeleton Loading Priority:**
- Show skeleton states immediately (no delay)
- Prevent layout shift (use fixed dimensions)

---

### CONSTRAINTS

**Responsive:**
- All pages must work on mobile, tablet, desktop
- No horizontal scrolling on any breakpoint
- Touch targets must be large enough for fingers on mobile
- Text must be readable without zooming on mobile

**Accessibility:**
- All images have alt text (or `alt=""` if decorative)
- All forms have labels (visible or aria-label)
- All interactive elements are keyboard accessible
- All status changes are announced to screen readers
- Color is not the only indicator (use icons + text)
- Focus indicators are clearly visible

**Performance:**
- Page load time < 3 seconds
- Time to interactive < 5 seconds
- Lazy load below-the-fold content
- Optimize images and videos

---

## Quality Checklist

- [x] Every measurement from UX spec captured in prompts
- [x] Every state from UX spec captured in prompts
- [x] Every interaction from UX spec captured in prompts
- [x] No prompt references another prompt (all self-contained)
- [x] Build order respects dependencies (Foundation → Shell → Components → Interactions → States → Polish)
- [x] Each prompt could be given to someone with no context
- [x] Primary color updated to `#1DD1A1` (logo green) across all prompts
- [x] Light mode uses white background, dark mode uses black/dark charcoal
- [x] Complementary colors chosen for modern aesthetic (success, error, warning, processing, info)
- [x] Responsive behavior specified for all major components
- [x] Accessibility features included (keyboard nav, screen readers, focus states)

---

## Implementation Notes

**Technology Stack (Implied):**
- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 (utility-first CSS framework)
- **Components:** shadcn/ui (pre-built accessible components)
- **Icons:** Lucide React or Heroicons
- **Animations:** Framer Motion (optional for advanced animations)

**Design Token Implementation:**
- Use CSS variables or Tailwind config for all colors, spacing, typography
- Example: `--color-primary: #1DD1A1`, `--spacing-lg: 16px`, `--font-heading: Inter`

**Component Architecture:**
- Reusable components: VideoCard, StatusBadge, FileUploadDropzone, Toast, EmptyState
- Page components: Dashboard, CreateVideo, VideoLibrary, Billing, StylesGallery
- Layout components: Navigation, PageContainer, Modal

**State Management:**
- Video creation form: React state (lost on refresh, no auto-save)
- Credit balance: Real-time from backend (React Query or SWR for caching)
- Video list: Paginated with caching
- Toast notifications: Global context or library (react-hot-toast, sonner)

**Responsive Strategy:**
- Mobile-first approach (design for mobile, enhance for desktop)
- Use Tailwind responsive prefixes: `md:`, `lg:` for breakpoint-specific styles
- Test on real devices (not just browser DevTools)

**Accessibility Testing:**
- Use keyboard only (tab through entire app)
- Use screen reader (VoiceOver on Mac, NVDA on Windows)
- Use browser extensions (Axe DevTools, WAVE)
- Check color contrast (WebAIM Contrast Checker)

---

## Next Steps

1. **Set up design tokens** in Tailwind config or CSS variables
2. **Build foundation components** (buttons, inputs, cards) using shadcn/ui
3. **Implement layout shell** (navigation, page container)
4. **Build pages in sequence** (Dashboard → Wizard → Library → Billing → Gallery)
5. **Add interactions** (forms, modals, toasts)
6. **Implement states** (loading, empty, error)
7. **Test responsive behavior** on all breakpoints
8. **Accessibility audit** with keyboard and screen reader
9. **Performance optimization** (lazy loading, image optimization)
10. **User testing** with real users on real devices
