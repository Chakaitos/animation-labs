import { fileTypeFromBuffer } from 'file-type'

// Allowed MIME types for logo uploads (Veo 3 requirement - no SVG)
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number]

// Maximum file size: 25MB (Supabase Storage limit)
export const MAX_FILE_SIZE = 25 * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
}

/**
 * Validate an image file using magic bytes (server-side security).
 * Never trust client-side MIME type - always verify magic bytes.
 *
 * @param file - File object from FormData
 * @returns Validation result with error message if invalid
 */
export async function validateImageFile(file: File): Promise<FileValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  // Read file buffer for magic byte detection
  const buffer = Buffer.from(await file.arrayBuffer())

  // Detect actual file type from magic bytes
  const type = await fileTypeFromBuffer(buffer)

  // Verify it's an allowed image type
  if (!type || !ALLOWED_IMAGE_TYPES.includes(type.mime as AllowedImageType)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.',
    }
  }

  return {
    valid: true,
    mimeType: type.mime,
  }
}
