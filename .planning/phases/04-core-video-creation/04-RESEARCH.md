# Phase 4: Core Video Creation - Research

**Researched:** 2026-01-29
**Domain:** File upload, form handling, image processing, webhook integration, credit validation
**Confidence:** HIGH

## Summary

Phase 4 requires building a complete video creation flow: file upload with drag-and-drop, color extraction from logos, multi-step form for video parameters, credit validation, and n8n webhook triggering. The standard stack combines react-dropzone for uploads, node-vibrant for color extraction, React Hook Form with Zod for validation, shadcn/ui for components, Supabase Storage for file hosting, and Server Actions for form submission.

The critical technical challenges are: (1) proper file validation on both client and server using magic bytes, (2) atomic credit deduction with race condition prevention, (3) webhook idempotency for n8n callbacks, and (4) handling large file uploads within Next.js body size limits.

**Primary recommendation:** Use multi-step wizard pattern with shadcn/ui components, Server Actions for submission, node-vibrant for instant color extraction on upload, and PostgreSQL stored procedures with SELECT FOR UPDATE for atomic credit operations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | 14.x | File upload with drag-and-drop | Industry standard for React file uploads, accessible, supports validation |
| node-vibrant | 3.x | Color extraction from images | Semantic color swatches (Vibrant, Muted, Dark variants), better than color-thief for UI theming |
| React Hook Form | 7.x | Form state management | Zero re-renders, built-in validation, excellent DX with TypeScript |
| Zod | 3.x | Schema validation | Type-safe, composable, works seamlessly with React Hook Form |
| @hookform/resolvers | 3.x | Integration layer | Connects Zod schemas to React Hook Form |
| shadcn/ui Sonner | Latest | Toast notifications | Replaced deprecated toast component, opinionated, accessible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| file-type | 21.x | Magic byte validation | Server-side file type verification (security layer) |
| @supabase/storage-js | Latest (via SDK) | File storage operations | Uploading logos to Supabase Storage buckets |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| node-vibrant | color-thief | Simpler but lacks semantic swatches (Vibrant/Muted/Dark), node-vibrant better for theming |
| react-dropzone | Custom File Input | Would need to hand-roll drag-and-drop, validation, accessibility |
| Sonner | React Hot Toast | Sonner is shadcn's blessed choice, better integration |

**Installation:**
```bash
npm install react-dropzone react-hook-form zod @hookform/resolvers/zod node-vibrant file-type
npx shadcn@latest add form input textarea select button sonner
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── create-video/          # Video creation route
│   ├── page.tsx          # Main form container (Server Component)
│   └── _components/      # Form step components (Client Components)
│       ├── UploadStep.tsx
│       ├── DetailsStep.tsx
│       ├── StyleStep.tsx
│       └── ReviewStep.tsx
├── actions/              # Server Actions
│   ├── upload-logo.ts    # Logo upload to Supabase Storage
│   ├── create-video.ts   # Main video creation action
│   └── validate-credits.ts # Credit validation
lib/
├── supabase/
│   ├── client.ts         # Browser client
│   └── server.ts         # Server client
├── validations/
│   └── video-schema.ts   # Zod schemas for video creation
└── utils/
    ├── color-extraction.ts # node-vibrant wrapper
    └── file-validation.ts  # Magic byte validation
```

### Pattern 1: Multi-Step Form with State Management
**What:** Progressive disclosure pattern breaking video creation into logical steps with progress indicator
**When to use:** Forms with 5+ fields spanning multiple domains (upload, details, style, review)
**Example:**
```typescript
// Source: Next.js App Router patterns + shadcn/ui best practices
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function CreateVideoForm() {
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [colors, setColors] = useState<{ primary: string; secondary: string } | null>(null)

  const form = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      brandName: '',
      duration: '15s',
      quality: '1080p',
      style: 'modern',
      creativeDirection: ''
    }
  })

  // Render step based on state
  return (
    <Form {...form}>
      {step === 1 && <UploadStep onUpload={handleUpload} />}
      {step === 2 && <DetailsStep colors={colors} />}
      {step === 3 && <StyleStep />}
      {step === 4 && <ReviewStep onSubmit={handleSubmit} />}
    </Form>
  )
}
```

### Pattern 2: Immediate Color Extraction on Upload
**What:** Extract colors client-side immediately after file selection for fast feedback
**When to use:** When color info is needed before form submission (user sees results instantly)
**Example:**
```typescript
// Source: node-vibrant browser usage + react-dropzone integration
import Vibrant from 'node-vibrant'

async function extractColors(file: File): Promise<{ primary: string; secondary: string }> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const vibrant = new Vibrant(canvas)
  const palette = await vibrant.getPalette()

  return {
    primary: palette.Vibrant?.hex || '#000000',
    secondary: palette.Muted?.hex || '#666666'
  }
}

// In upload component
const onDrop = useCallback(async (acceptedFiles: File[]) => {
  const file = acceptedFiles[0]
  setFile(file)

  // Extract colors immediately
  const extractedColors = await extractColors(file)
  setColors(extractedColors)
}, [])
```

### Pattern 3: Server Action with Credit Validation and File Upload
**What:** Atomic operation that validates credits, uploads file, deducts credits, triggers webhook
**When to use:** Video creation submission (all-or-nothing transaction)
**Example:**
```typescript
// Source: Next.js Server Actions + Supabase patterns
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const videoSchema = z.object({
  brandName: z.string().min(1),
  duration: z.enum(['4s', '6s', '8s', '15s']),
  quality: z.enum(['standard', 'premium', '1080p', '4k']),
  style: z.string(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export async function createVideo(formData: FormData) {
  const supabase = await createClient()

  // 1. Validate form data
  const validated = videoSchema.safeParse({
    brandName: formData.get('brandName'),
    duration: formData.get('duration'),
    quality: formData.get('quality'),
    style: formData.get('style'),
    primaryColor: formData.get('primaryColor'),
    secondaryColor: formData.get('secondaryColor'),
  })

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  // 2. Check credits using RPC
  const { data: userData } = await supabase.auth.getUser()
  const { data: hasCredits } = await supabase.rpc('check_credits', {
    user_id: userData.user!.id,
    required: 1
  })

  if (!hasCredits) {
    return { error: 'Insufficient credits' }
  }

  // 3. Upload file to Supabase Storage
  const file = formData.get('logo') as File
  const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file)

  if (uploadError) {
    return { error: 'Upload failed' }
  }

  // 4. Create video record (triggers credit deduction via RPC)
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .insert({
      user_id: userData.user!.id,
      logo_url: uploadData.path,
      brand_name: validated.data.brandName,
      duration: validated.data.duration,
      quality: validated.data.quality,
      style: validated.data.style,
      primary_color: validated.data.primaryColor,
      secondary_color: validated.data.secondaryColor,
      status: 'processing'
    })
    .select()
    .single()

  if (videoError) {
    return { error: 'Video creation failed' }
  }

  // 5. Deduct credits atomically
  await supabase.rpc('deduct_credits', {
    user_id: userData.user!.id,
    video_id: video.id,
    credits: 1
  })

  // 6. Trigger n8n webhook
  await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET!
    },
    body: JSON.stringify({
      videoId: video.id,
      logoUrl: supabase.storage.from('logos').getPublicUrl(uploadData.path).data.publicUrl,
      ...validated.data
    })
  })

  return { success: true, videoId: video.id }
}
```

### Pattern 4: File Validation (Client + Server)
**What:** Multi-layer validation: client-side for UX, server-side for security
**When to use:** All file uploads (never trust client-side validation alone)
**Example:**
```typescript
// Client-side (react-dropzone)
const { getRootProps, getInputProps, fileRejections } = useDropzone({
  accept: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  },
  maxSize: 25 * 1024 * 1024, // 25MB (Supabase limit)
  multiple: false,
  onDrop: (acceptedFiles) => {
    // Client-side validation passed
    handleUpload(acceptedFiles[0])
  }
})

// Server-side (magic bytes validation)
// Source: OWASP File Upload Best Practices
import { fileTypeFromBuffer } from 'file-type'

async function validateImageFile(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer()
  const type = await fileTypeFromBuffer(Buffer.from(buffer))

  // Verify magic bytes match allowed types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!type || !allowedTypes.includes(type.mime)) {
    return false
  }

  // Additional checks
  if (buffer.byteLength > 25 * 1024 * 1024) {
    return false
  }

  return true
}
```

### Pattern 5: Webhook Idempotency for n8n Callbacks
**What:** Ensure n8n callbacks can be safely retried without duplicate processing
**When to use:** Status update endpoints that n8n calls back to
**Example:**
```typescript
// Source: Webhook best practices - idempotency patterns
// app/api/webhooks/video-status/route.ts
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const headersList = await headers()
  const webhookId = headersList.get('x-webhook-id')

  // Verify webhook secret
  const secret = headersList.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { videoId, status, outputUrl } = body

  const supabase = await createClient()

  // Idempotent update using webhook ID
  // If webhook already processed, returns success without re-processing
  const { data, error } = await supabase
    .from('videos')
    .update({
      status,
      output_url: outputUrl,
      webhook_id: webhookId,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', videoId)
    .eq('webhook_id', null) // Only update if not already processed
    .select()

  // If data is null, webhook already processed
  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ message: 'Already processed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### Anti-Patterns to Avoid
- **Storing uploaded files in server memory:** Use Supabase Storage directly, never buffer entire files in Next.js API routes
- **Client-only file validation:** Always validate on server using magic bytes (clients can bypass validation)
- **Deducting credits before webhook succeeds:** Deduct after video record created, before webhook trigger
- **Blocking form submission on webhook response:** Trigger webhook fire-and-forget, show "processing" status immediately
- **Using File objects in Server Actions:** Convert to FormData or Buffer (File objects can't be serialized between server/client)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop file upload | Custom drop handlers | react-dropzone | Accessibility (keyboard, screen readers), file rejections, MIME validation, mobile support |
| Color extraction from images | Canvas pixel sampling | node-vibrant | Handles quantization, semantic swatches (Vibrant/Muted), works across color spaces |
| Multi-step form state | useState soup | React Hook Form | Performance (no re-renders), validation integration, error handling, touched/dirty tracking |
| Form validation | Manual regex checks | Zod | Type safety, composable schemas, better error messages, async validation |
| File type detection | Extension checking | file-type (magic bytes) | Security (extensions can be spoofed), detects actual file format |
| Credit deduction | Application-level checks | PostgreSQL stored procedure | Race conditions, atomicity, database-level integrity |
| Toast notifications | Custom Portal/Overlay | Sonner (shadcn) | Accessibility, stacking, dismiss handling, mobile support |

**Key insight:** File upload and form handling have many edge cases (mobile browsers, accessibility, file validation, race conditions). Use battle-tested libraries that handle these scenarios. Custom implementations miss critical security (magic bytes) and UX concerns (keyboard navigation, screen readers).

## Common Pitfalls

### Pitfall 1: File Upload Body Size Limit in Next.js
**What goes wrong:** Server Actions default to 1MB body limit, causing "Body exceeded 1mb limit" errors for larger logo uploads
**Why it happens:** Next.js protects against large payload attacks with conservative default
**How to avoid:** Configure `bodySizeLimit` in `next.config.js` for server actions
**Warning signs:** Errors when uploading files > 1MB, intermittent upload failures
**Prevention:**
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb' // Match Supabase Storage limit
    }
  }
}
```

### Pitfall 2: Race Conditions in Credit Deduction
**What goes wrong:** Two simultaneous video creations deduct credits twice, or user with 1 credit creates 2 videos
**Why it happens:** Check-then-act pattern without atomic locking (read credits, then update separately)
**How to avoid:** Use PostgreSQL stored procedure with `SELECT FOR UPDATE` or `SERIALIZABLE` isolation
**Warning signs:** Credit balance doesn't match transaction history, negative balances
**Prevention:**
```sql
-- Use existing deduct_credits function with FOR UPDATE locking
CREATE OR REPLACE FUNCTION deduct_credits(
  user_id UUID,
  video_id UUID,
  credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT (subscription_credits + overage_credits)
  INTO current_credits
  FROM subscriptions
  WHERE user_id = user_id
  FOR UPDATE;

  IF current_credits < credits THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct from overage first, then subscription
  UPDATE subscriptions
  SET overage_credits = GREATEST(0, overage_credits - credits),
      subscription_credits = CASE
        WHEN overage_credits >= credits THEN subscription_credits
        ELSE subscription_credits - (credits - overage_credits)
      END
  WHERE user_id = user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, video_id, credits_used)
  VALUES (user_id, video_id, credits);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### Pitfall 3: Missing Server-Side File Validation (Security)
**What goes wrong:** Malicious users upload executable files disguised as images (e.g., .exe renamed to .jpg)
**Why it happens:** Client-side validation (MIME type, extension) is easily bypassed
**How to avoid:** Always validate magic bytes on server using file-type library
**Warning signs:** Unexpected file types in storage, security scanner alerts
**Prevention:**
```typescript
// Server Action
import { fileTypeFromBuffer } from 'file-type'

export async function uploadLogo(formData: FormData) {
  const file = formData.get('logo') as File
  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate magic bytes (can't be spoofed)
  const type = await fileTypeFromBuffer(buffer)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!type || !allowedTypes.includes(type.mime)) {
    return { error: 'Invalid file type' }
  }

  // Proceed with upload
  // ...
}
```

### Pitfall 4: File Object Serialization in Server Actions
**What goes wrong:** "File objects are not supported" error when passing File from Client to Server Component
**Why it happens:** File objects can't be serialized across client/server boundary in Next.js App Router
**How to avoid:** Always pass files via FormData to Server Actions
**Warning signs:** Serialization errors, "Only plain objects can be passed" errors
**Prevention:**
```typescript
// CLIENT COMPONENT
'use client'

export function UploadForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // File is part of FormData, not passed as File object
    await uploadLogo(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="logo" required />
      <button type="submit">Upload</button>
    </form>
  )
}
```

### Pitfall 5: n8n Webhook Timeout During Processing
**What goes wrong:** n8n webhook times out waiting for video processing to complete
**Why it happens:** Blocking webhook call until video generation finishes (10-15 minutes)
**How to avoid:** Fast ACK pattern - return 200 immediately, process asynchronously
**Warning signs:** Webhook timeouts, duplicate n8n retries, processing status not updating
**Prevention:**
```typescript
// Server Action - trigger webhook fire-and-forget
export async function createVideo(formData: FormData) {
  // ... validation and credit deduction ...

  // Create video record with "processing" status
  const { data: video } = await supabase
    .from('videos')
    .insert({ status: 'processing', ... })
    .select()
    .single()

  // Trigger n8n webhook WITHOUT awaiting response
  fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: video.id, ... })
  }).catch(err => console.error('Webhook failed:', err))

  // Return success immediately (don't wait for video processing)
  return { success: true, videoId: video.id }
}
```

### Pitfall 6: Supabase Storage RLS Policy Misconfiguration
**What goes wrong:** Users can't upload files, or can access other users' logos
**Why it happens:** Private buckets default to blocking all access without RLS policies
**How to avoid:** Create RLS policies on `storage.objects` table for authenticated users
**Warning signs:** 403 errors on upload, users seeing each other's files
**Prevention:**
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Pitfall 7: Missing Loading States in Multi-Step Form
**What goes wrong:** User clicks submit multiple times, creating duplicate videos
**Why it happens:** No visual feedback during async operations (upload, color extraction, submission)
**How to avoid:** Use `useFormStatus` for submit button, local state for async operations
**Warning signs:** Duplicate video records, user reports of "unresponsive" buttons
**Prevention:**
```typescript
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Video'}
    </Button>
  )
}

// For color extraction
const [extracting, setExtracting] = useState(false)

const onDrop = async (files: File[]) => {
  setExtracting(true)
  try {
    const colors = await extractColors(files[0])
    setColors(colors)
  } finally {
    setExtracting(false)
  }
}
```

## Code Examples

Verified patterns from official sources:

### Complete Upload Step with Color Extraction
```typescript
// Source: react-dropzone + node-vibrant integration
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Vibrant from 'node-vibrant'
import { Button } from '@/components/ui/button'

interface UploadStepProps {
  onComplete: (file: File, colors: { primary: string; secondary: string }) => void
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null)
  const [colors, setColors] = useState<{ primary: string; secondary: string } | null>(null)
  const [extracting, setExtracting] = useState(false)

  const extractColors = useCallback(async (file: File) => {
    setExtracting(true)
    try {
      const img = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const vibrant = new Vibrant(canvas)
      const palette = await vibrant.getPalette()

      return {
        primary: palette.Vibrant?.hex || palette.DarkVibrant?.hex || '#000000',
        secondary: palette.Muted?.hex || palette.LightMuted?.hex || '#666666'
      }
    } finally {
      setExtracting(false)
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    setFile(uploadedFile)

    const extractedColors = await extractColors(uploadedFile)
    setColors(extractedColors)
  }, [extractColors])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
    onDrop
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        {file ? (
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <p>Drag & drop your logo here, or click to select</p>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="text-red-500 text-sm">
          {fileRejections[0].errors[0].message}
        </div>
      )}

      {extracting && (
        <p className="text-sm text-gray-500">Extracting colors...</p>
      )}

      {colors && (
        <div className="flex gap-4">
          <div>
            <p className="text-sm font-medium">Primary Color</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: colors.primary }} />
              <span className="text-sm">{colors.primary}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Secondary Color</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: colors.secondary }} />
              <span className="text-sm">{colors.secondary}</span>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={() => file && colors && onComplete(file, colors)}
        disabled={!file || !colors || extracting}
      >
        Continue
      </Button>
    </div>
  )
}
```

### Form with React Hook Form + Zod + Server Action
```typescript
// Source: Next.js forms guide + shadcn/ui patterns
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useActionState } from 'react'
import { createVideo } from '@/app/actions/create-video'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const videoSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  duration: z.enum(['4s', '6s', '8s', '15s']),
  quality: z.enum(['standard', 'premium', '1080p', '4k']),
  style: z.string().min(1, 'Style is required'),
  creativeDirection: z.string().optional()
})

type VideoFormData = z.infer<typeof videoSchema>

interface VideoFormProps {
  file: File
  colors: { primary: string; secondary: string }
}

export function VideoForm({ file, colors }: VideoFormProps) {
  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      brandName: '',
      duration: '15s',
      quality: '1080p',
      style: 'modern',
      creativeDirection: ''
    }
  })

  const [state, formAction, pending] = useActionState(createVideo, { message: '' })

  const onSubmit = async (data: VideoFormData) => {
    const formData = new FormData()
    formData.append('logo', file)
    formData.append('primaryColor', colors.primary)
    formData.append('secondaryColor', colors.secondary)
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    formAction(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="brandName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your brand name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="4s">4 seconds</SelectItem>
                  <SelectItem value="6s">6 seconds</SelectItem>
                  <SelectItem value="8s">8 seconds</SelectItem>
                  <SelectItem value="15s">15 seconds</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {state?.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? 'Creating...' : 'Create Video'}
        </Button>
      </form>
    </Form>
  )
}
```

### n8n Webhook Payload Structure
```typescript
// Source: n8n webhook best practices
// This is what gets sent to n8n webhook
interface N8nVideoPayload {
  // Required fields
  videoId: string              // Database ID for callback
  logoUrl: string             // Public URL to logo file
  brandName: string           // User-provided brand name

  // Video parameters
  duration: '4s' | '6s' | '8s' | '15s'
  quality: 'standard' | 'premium' | '1080p' | '4k'
  style: string               // Style preset name

  // Color information
  primaryColor: string        // Hex color (e.g., "#FF5733")
  secondaryColor: string      // Hex color (e.g., "#33A1FF")

  // Optional creative direction
  creativeDirection?: string  // User's custom instructions

  // Callback information
  callbackUrl: string         // Where n8n reports status updates
  webhookSecret: string       // Secret for verifying callbacks
}

// Example payload
const examplePayload: N8nVideoPayload = {
  videoId: "123e4567-e89b-12d3-a456-426614174000",
  logoUrl: "https://abcdefgh.supabase.co/storage/v1/object/public/logos/user-uuid/file.png",
  brandName: "Acme Corp",
  duration: "15s",
  quality: "1080p",
  style: "modern",
  primaryColor: "#FF5733",
  secondaryColor: "#33A1FF",
  creativeDirection: "Energetic with smooth transitions",
  callbackUrl: "https://yourdomain.com/api/webhooks/video-status",
  webhookSecret: process.env.N8N_WEBHOOK_SECRET!
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js Pages Router API routes with multer | Server Actions with FormData | Next.js 13+ (2023) | Simpler file handling, no middleware needed |
| shadcn/ui Toast component | Sonner | shadcn update (2024) | Better UX, stacking, mobile support |
| React Hook Form Controller | Field render prop | RHF 7.x | Cleaner API, better TypeScript inference |
| Manual body parser config | serverActions.bodySizeLimit | Next.js 14 (2024) | Centralized config for all Server Actions |
| Extension-based file validation | Magic bytes (file-type) | Ongoing security best practice | Prevents file upload attacks |
| Optimistic locking for credits | Pessimistic locking (SELECT FOR UPDATE) | Database best practice | Prevents race conditions in high-concurrency scenarios |

**Deprecated/outdated:**
- `@shadcn/ui/toast`: Replaced by Sonner component (use `npx shadcn@latest add sonner`)
- Next.js Pages Router file upload patterns: Use Server Actions instead of API routes + multer
- Client-side only MIME type validation: Must validate magic bytes on server for security

## Open Questions

Things that couldn't be fully resolved:

1. **n8n webhook retry behavior**
   - What we know: n8n retries webhooks with exponential backoff, needs idempotency
   - What's unclear: Exact retry schedule and max attempts for n8n cloud vs self-hosted
   - Recommendation: Implement idempotency using webhook_id column, handle retries gracefully

2. **Supabase Storage image transformation timing**
   - What we know: Supabase can resize images on-the-fly for serving
   - What's unclear: Whether to resize logos before sending to n8n or let Veo 3 handle it
   - Recommendation: Send original resolution to n8n (Veo 3 likely has own preprocessing), use transformations only for UI previews

3. **Color extraction accuracy vs speed tradeoff**
   - What we know: node-vibrant is more accurate but slower than color-thief
   - What's unclear: Whether extraction speed matters for UX (happens during upload)
   - Recommendation: Use node-vibrant (better results for theming), extraction time < 500ms is acceptable

4. **Multi-step form state persistence**
   - What we know: Context decision is no draft-saving
   - What's unclear: Whether to preserve form state in sessionStorage for browser refresh
   - Recommendation: Add sessionStorage backup for better UX (user doesn't lose progress on accidental refresh)

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Forms Guide](https://nextjs.org/docs/app/guides/forms) - Server Actions, validation, error handling
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) - Size limits, RLS, image handling
- [shadcn/ui Form with React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form) - Integration patterns, Zod validation
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) - Security best practices, magic bytes
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) - RLS policy patterns

### Secondary (MEDIUM confidence)
- [react-dropzone Tutorial](https://dev.to/fpaghar/react-dropzone-a-thorough-introduction-5ebj) - API usage, validation patterns
- [Multi-Step Form with Zustand + Zod](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps) - State management patterns
- [Webhook Best Practices Guide](https://inventivehq.com/blog/webhook-best-practices-guide) - Retry logic, idempotency
- [PostgreSQL Race Conditions Prevention](https://dev.to/mistval/winning-race-conditions-with-postgresql-54gn) - SELECT FOR UPDATE patterns
- [n8n Webhook Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) - Payload handling, JSON structure

### Tertiary (LOW confidence)
- [colorthief vs node-vibrant comparison](https://npm-compare.com/colorthief,node-vibrant) - Library comparison (npm downloads only)
- Community discussions on Next.js file upload issues - Common problems identified, official solutions pending

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified with official docs and Context7
- Architecture: HIGH - Patterns from Next.js official docs and shadcn/ui best practices
- Pitfalls: MEDIUM-HIGH - Validated with official sources and community reports, specific to Next.js 16 + Supabase stack
- Security patterns: HIGH - Based on OWASP guidelines and official library documentation
- n8n integration: MEDIUM - Best practices verified, specific retry behavior needs testing

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stable stack, but Next.js and shadcn/ui evolve quickly)
