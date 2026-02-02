'use server'

import { createClient } from '@/lib/supabase/server'
import { videoSchema, type VideoFormValues } from '@/lib/validations/video-schema'
import { validateImageFile } from '@/lib/utils/file-validation'
import { getStylePresetConfig } from '@/lib/config/style-presets'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface CreateVideoResult {
  success?: boolean
  videoId?: string
  error?: string
  fieldErrors?: Partial<Record<keyof VideoFormValues | 'logo', string>>
}

/**
 * Create a video from logo upload and form parameters.
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate form data with Zod
 * 3. Validate file using magic bytes
 * 4. Check user has sufficient credits
 * 5. Upload logo to Supabase Storage
 * 6. Create video record with 'processing' status
 * 7. Deduct credits atomically
 * 8. Trigger n8n webhook (fire-and-forget)
 * 9. Redirect to dashboard
 */
export async function createVideo(formData: FormData): Promise<CreateVideoResult> {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Validate form data
  const rawData = {
    brandName: formData.get('brandName'),
    duration: formData.get('duration'),
    quality: formData.get('quality'),
    aspectRatio: formData.get('aspectRatio'),
    style: formData.get('style'),
    creativeDirection: formData.get('creativeDirection') || '',
    dialogueType: formData.get('dialogueType'),
    dialogueText: formData.get('dialogueText') || '',
  }

  const validated = videoSchema.safeParse(rawData)
  if (!validated.success) {
    const fieldErrors: CreateVideoResult['fieldErrors'] = {}
    for (const error of validated.error.issues) {
      const field = error.path[0] as keyof VideoFormValues
      fieldErrors[field] = error.message
    }
    return { error: 'Validation failed', fieldErrors }
  }

  // 3. Validate file using magic bytes (server-side security)
  const file = formData.get('logo') as File | null
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: 'Logo file is required', fieldErrors: { logo: 'Please upload a logo' } }
  }

  const fileValidation = await validateImageFile(file)
  if (!fileValidation.valid) {
    return { error: fileValidation.error, fieldErrors: { logo: fileValidation.error } }
  }

  // 4. Check credits using RPC function
  // Premium quality costs 2 credits, standard costs 1 credit
  const creditsRequired = validated.data.quality === 'premium' ? 2 : 1

  const { data: hasCredits, error: creditCheckError } = await supabase.rpc('check_credits', {
    p_user_id: user.id,
    p_required: creditsRequired,
  })

  if (creditCheckError) {
    console.error('Credit check error:', creditCheckError)
    return { error: 'Failed to check credit balance. Please try again.' }
  }

  if (!hasCredits) {
    return { error: 'Insufficient credits. Please purchase more credits or upgrade your plan.' }
  }

  // 5. Upload logo to Supabase Storage
  // Path format: {user_id}/{uuid}.{extension} for RLS policy
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, {
      contentType: fileValidation.mimeType,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { error: 'Failed to upload logo. Please try again.' }
  }

  // Get public URL for n8n
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(uploadData.path)

  // 6. Create video record with 'processing' status
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .insert({
      user_id: user.id,
      brand_name: validated.data.brandName,
      status: 'processing',
      logo_url: publicUrl,
      duration_seconds: parseInt(validated.data.duration, 10),
      quality: validated.data.quality,
      aspect_ratio: validated.data.aspectRatio,
      style: validated.data.style,
      creative_direction: validated.data.creativeDirection || null,
      dialogue:
        validated.data.dialogueType === 'custom'
          ? validated.data.dialogueText
          : 'no voiceover',
      error_message: null,
      credits_used: creditsRequired,
    })
    .select('id')
    .single()

  if (videoError) {
    console.error('Video record error:', videoError)
    // Clean up uploaded file on failure
    await supabase.storage.from('logos').remove([uploadData.path])
    return { error: 'Failed to create video. Please try again.' }
  }

  // 7. Deduct credits atomically
  const { data: deductSuccess, error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_video_id: video.id,
    p_credits: creditsRequired,
    p_description: `Video: ${validated.data.brandName} (${validated.data.quality})`,
  })

  if (deductError || !deductSuccess) {
    console.error('Credit deduction error:', deductError)
    // Rollback: delete video record and uploaded file
    await supabase.from('videos').delete().eq('id', video.id)
    await supabase.storage.from('logos').remove([uploadData.path])
    return { error: 'Failed to deduct credits. Please try again.' }
  }

  // 8. Trigger n8n webhook (fire-and-forget)
  // IMPORTANT: Do NOT await this - n8n will process asynchronously
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret && { 'X-Webhook-Secret': webhookSecret }),
      },
      body: JSON.stringify({
        video_id: video.id,
        brand_name: validated.data.brandName,
        quality: validated.data.quality,
        aspect_ratio: validated.data.aspectRatio,
        duration: parseInt(validated.data.duration, 10),
        style_preset: getStylePresetConfig(
          validated.data.style,
          validated.data.creativeDirection
        ),
        creative_direction: validated.data.creativeDirection || null,
        dialogue:
          validated.data.dialogueType === 'custom'
            ? validated.data.dialogueText
            : 'no voiceover',
        logo_url: publicUrl,
      }),
    }).catch((err) => {
      // Log but don't fail - video is already created and credits deducted
      console.error('n8n webhook trigger failed:', err)
    })
  } else {
    console.warn('N8N_WEBHOOK_URL not configured - video will remain in processing status')
  }

  // 9. Success - return videoId (form will redirect)
  return { success: true, videoId: video.id }
}

/**
 * Delete a video and its associated storage files.
 *
 * Flow:
 * 1. Authenticate user
 * 2. Get video to verify ownership and extract file URLs
 * 3. Verify user owns the video (extra security beyond RLS)
 * 4. Extract storage paths from URLs
 * 5. Delete storage files (logo, video, thumbnail)
 * 6. Delete database record (RLS ensures user can only delete own videos)
 * 7. Revalidate pages to update UI
 */
export async function deleteVideo(videoId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 1. Get video to verify ownership and get file URLs
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('logo_url, video_url, thumbnail_url, user_id')
    .eq('id', videoId)
    .single()

  if (fetchError || !video) {
    return { error: 'Video not found' }
  }

  // 2. Verify ownership (extra security check beyond RLS)
  if (video.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // 3. Extract storage paths from URLs and delete files
  // Path format: {user_id}/{uuid}.{ext} stored in 'logos' bucket
  const extractPath = (url: string | null): string | null => {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      // URL pattern: .../storage/v1/object/public/logos/{user_id}/{filename}
      const match = urlObj.pathname.match(/\/logos\/(.+)$/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const filesToDelete = [
    extractPath(video.logo_url),
    extractPath(video.video_url),
    extractPath(video.thumbnail_url),
  ].filter((path): path is string => path !== null)

  // Delete storage files (don't fail if files already deleted)
  if (filesToDelete.length > 0) {
    await supabase.storage.from('logos').remove(filesToDelete)
  }

  // 4. Delete database record (RLS ensures user can only delete own videos)
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)

  if (deleteError) {
    console.error('Delete video error:', deleteError)
    return { error: 'Failed to delete video' }
  }

  // 5. Revalidate pages
  revalidatePath('/videos')
  revalidatePath('/dashboard')

  return { success: true }
}
