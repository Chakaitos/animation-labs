import { Vibrant } from 'node-vibrant/browser'

export interface ExtractedColors {
  primary: string
  secondary: string
}

/**
 * Extract primary and secondary colors from an image file.
 * Uses node-vibrant for semantic color extraction (Vibrant, Muted swatches).
 *
 * @param file - Image file (JPG, PNG, or WebP)
 * @returns Object with primary (Vibrant) and secondary (Muted) hex colors
 */
export async function extractColors(file: File): Promise<ExtractedColors> {
  // Create an object URL for the file
  const imageUrl = URL.createObjectURL(file)

  try {
    // Extract colors using Vibrant
    const vibrant = new Vibrant(imageUrl)
    const palette = await vibrant.getPalette()

    // Use Vibrant as primary, falling back to DarkVibrant
    // Use Muted as secondary, falling back to LightMuted
    const primary = palette.Vibrant?.hex || palette.DarkVibrant?.hex || '#000000'
    const secondary = palette.Muted?.hex || palette.LightMuted?.hex || '#666666'

    return { primary, secondary }
  } finally {
    // Clean up object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrl)
  }
}
