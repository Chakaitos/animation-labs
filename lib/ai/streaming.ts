import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream'
import { Option } from '@/lib/validations/ai-schema'

/**
 * Convert Anthropic stream to ReadableStream for Next.js Response
 */
export function anthropicStreamToReadableStream(
  stream: MessageStream
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta') {
            if (chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

/**
 * Parse AI response to extract question and options
 */
export function parseAIResponse(response: string): {
  question: string
  options: Option[] | null
} {
  // Look for OPTIONS: section (case insensitive, flexible whitespace)
  const optionsMatch = response.match(/\*\*OPTIONS:\*\*|OPTIONS:/i)

  if (!optionsMatch || optionsMatch.index === undefined) {
    // No options found, just a regular question or response
    return { question: response.trim(), options: null }
  }

  // Extract question text (everything before OPTIONS:)
  const question = response.substring(0, optionsMatch.index).trim()

  // Extract options text (everything after OPTIONS:)
  const afterOptions = response.substring(optionsMatch.index + optionsMatch[0].length)

  // Split options section by letter boundaries so multi-line option text is captured whole.
  // Each block starts with "A.", "B.", etc. and runs until the next letter marker.
  const optionBlocks = afterOptions.split(/\n(?=[A-E]\.)/).filter((s) => s.trim())
  const options: Option[] = []

  for (const block of optionBlocks) {
    const match = block.match(/^([A-E])\.\s*([\s\S]+)$/)
    if (!match) continue

    const letter = match[1] as 'A' | 'B' | 'C' | 'D' | 'E'
    // Collapse multi-line text into a single line
    const text = match[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    const isOther =
      text.toLowerCase().includes('other') ||
      text.toLowerCase().includes('describe my own') ||
      text.toLowerCase().includes("i'll describe")

    // Create short label (first 4-6 words or until first comma/period)
    let shortLabel = text
    if (!isOther) {
      const firstPart = text.split(/[,.]|with |that |where /)[0].trim()
      const words = firstPart.split(' ')
      shortLabel = words.slice(0, Math.min(6, words.length)).join(' ')
      if (words.length > 6) shortLabel += '...'
    }

    options.push({ letter, text, shortLabel, isOther })
    if (options.length >= 5) break
  }

  // If we found fewer than 2 options, something's wrong - return no options
  if (options.length < 2) {
    return { question: response.trim(), options: null }
  }

  return { question, options }
}
