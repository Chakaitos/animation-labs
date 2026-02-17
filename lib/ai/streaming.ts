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

  // Find all option lines (A., B., C., D., E.)
  const optionPattern = /([A-E])\.\s*([^\n]+)/g
  const options: Option[] = []
  let match

  while ((match = optionPattern.exec(afterOptions)) !== null) {
    const letter = match[1] as 'A' | 'B' | 'C' | 'D' | 'E'
    const text = match[2].trim()
    const isOther =
      text.toLowerCase().includes('other') ||
      text.toLowerCase().includes('describe my own') ||
      text.toLowerCase().includes("i'll describe")

    // Create short label (first 4-6 words or until first comma/period)
    let shortLabel = text
    if (!isOther) {
      // Split by comma or period and take first part
      const firstPart = text.split(/[,.]|with |that |where /)[0].trim()
      // Take first 6 words max
      const words = firstPart.split(' ')
      shortLabel = words.slice(0, Math.min(6, words.length)).join(' ')
      if (words.length > 6) shortLabel += '...'
    }

    options.push({ letter, text, shortLabel, isOther })

    // Stop if we found 5 options
    if (options.length >= 5) break
  }

  // If we found fewer than 2 options, something's wrong - return no options
  if (options.length < 2) {
    return { question: response.trim(), options: null }
  }

  return { question, options }
}
