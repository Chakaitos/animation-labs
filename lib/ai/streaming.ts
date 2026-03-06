import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream'

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
