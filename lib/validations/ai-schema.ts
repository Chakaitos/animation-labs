import { z } from 'zod'

const optionSchema = z.object({
  letter: z.enum(['A', 'B', 'C', 'D', 'E']),
  text: z.string(),
  isOther: z.boolean(),
})

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  options: z.array(optionSchema).optional(),
  isClarification: z.boolean().optional(),
  timestamp: z.number().optional(),
})

export const aiRequestSchema = z.object({
  phase: z.number().int().min(1).max(5),
  questionCount: z.number().int().min(0).max(4), // Main questions answered
  clarificationCount: z.number().int().min(0).max(6), // Total clarifications

  // User input: either option selection OR custom text
  selectedOption: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  userInput: z.string().max(500).optional(),
  isClarifyingQuestion: z.boolean().optional(), // true if user is asking for clarification

  conversationHistory: z.array(messageSchema).max(12), // Allow more turns for clarifications

  brandContext: z.object({
    brandName: z.string().min(1).max(100),
    stylePreset: z.string(),
    aspectRatio: z.enum(['landscape', 'portrait']),
  }),
})

export type AIRequest = z.infer<typeof aiRequestSchema>
export type Option = z.infer<typeof optionSchema>
export type Message = z.infer<typeof messageSchema>
