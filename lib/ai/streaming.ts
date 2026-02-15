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
  // Look for OPTIONS: section
  const optionsMatch = response.match(/OPTIONS:\s*\n((?:[A-E]\..+\n?)+)/i)

  if (!optionsMatch) {
    // No options found, just a regular question or response
    return { question: response.trim(), options: null }
  }

  // Extract question text (everything before OPTIONS:)
  const question = response.substring(0, optionsMatch.index).trim()

  // Extract options
  const optionsText = optionsMatch[1]
  const optionLines = optionsText.split('\n').filter((line) => line.trim())

  const options: Option[] = optionLines
    .map((line) => {
      const match = line.match(/^([A-E])\.\s*(.+)$/)
      if (!match) return null

      const letter = match[1] as 'A' | 'B' | 'C' | 'D' | 'E'
      const text = match[2].trim()
      const isOther =
        text.toLowerCase().includes('other') ||
        text.toLowerCase().includes('describe my own')

      return { letter, text, isOther }
    })
    .filter(Boolean) as Option[]

  return { question, options }
}
