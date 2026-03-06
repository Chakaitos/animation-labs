import { z } from 'zod'

export const logoAnalysisSchema = z.object({
  industry: z.string(),
  brandArchetype: z.string(),
  animationTone: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  needsBrandContext: z.boolean(),
})

export type LogoAnalysis = z.infer<typeof logoAnalysisSchema>

export const optimizeRequestSchema = z.object({
  rawInput: z.string().min(5).max(1000),
  brandContext: z.object({
    brandName: z.string().min(1).max(100),
    stylePreset: z.string(),
    aspectRatio: z.enum(['landscape', 'portrait']),
    logoAnalysis: logoAnalysisSchema.optional().catch(undefined),
  }),
})

export type OptimizeRequest = z.infer<typeof optimizeRequestSchema>
