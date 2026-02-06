# Email Logo Setup Instructions

## What Was Done

Reverted email logo changes and updated EmailLayout to use the new horizontal logo image provided by the user.

**Reverted commits:**
- e98cefd: 240x60 horizontal dimensions
- b789a9a: Reduced header whitespace by 2/3
- c643795: 220x220 square logo

**Kept commit:**
- eca6a44: Reduced email header padding (mb-6 to mb-3)

## New Logo Configuration

**File:** `emails/_components/EmailLayout.tsx`

**Changes:**
- Logo source: `https://animationlabs.ai/email-logo.png` (was: logo.svg)
- Dimensions: 300px × 75px (4:1 aspect ratio for horizontal layout)
- Added `display: block` style for better email client compatibility
- Kept reduced padding (mb-3) for compact header

## Required Action

**The horizontal logo image needs to be placed in the production environment:**

1. Save the horizontal logo image as `email-logo.png`
2. Upload to production server at path: `public/email-logo.png`
3. Logo will be accessible at: `https://animationlabs.ai/email-logo.png`

**Note:** Email clients require absolute URLs. The file must be accessible at the production domain for emails to display correctly.

## Local Development

When testing with `npm run email:dev`:
- External URLs may not load in the preview
- This is normal email preview behavior
- Logo will display correctly in actual sent emails once uploaded to production

## Verification

After uploading to production, test by:
1. Triggering a test email (signup, video completion, etc.)
2. Check that logo displays with proper proportions
3. Verify no excess whitespace around logo
