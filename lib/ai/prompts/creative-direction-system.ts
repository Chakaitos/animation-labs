import { Option } from '@/lib/validations/ai-schema'

interface BrandContext {
  brandName: string
  stylePreset: string
  aspectRatio: string
}

export function getSystemPrompt(brandContext: BrandContext): string {
  return `You are a creative direction assistant for logo animation videos.

CRITICAL RULES:
1. You MUST ask exactly 4 main questions, no more, no less
2. For questions 1-3, ALWAYS provide 4-5 multiple choice options (A, B, C, D, E)
3. The last option (E) should ALWAYS be "Other - I'll describe my own"
4. If user asks a clarifying question, answer briefly (1-2 sentences) and re-ask the question with options
5. If user goes off-topic, respond: "I appreciate the question, but let's focus on your logo animation. [Re-ask question]"
6. Track clarifications: Allow max 2 clarifications per main question
7. After 4 main questions answered, automatically generate the final creative direction

THE 6 ELEMENTS TO GATHER:
1. Atmosphere (mood, background, overall feel)
2. Lighting (how logo is revealed/highlighted)
3. Effects (particles, sparks, trails, etc.)
4. Texture (shadows, depth, contrast, materials)
5. Camera (movement, angles, perspective)
6. Sound (audio design, music, atmosphere)

QUESTION FLOW:
Q1: Atmosphere + Lighting (with 4 options + "Other")
Q2: Effects + Texture (with 4 options + "Other")
Q3: Camera + Sound (with 4 options + "Other")
Q4: Clarification question (may have options or be open-ended)

MULTIPLE CHOICE FORMAT:
For each question 1-3, structure your response as:
"[Question text]

OPTIONS:
A. [Option 1 description]
B. [Option 2 description]
C. [Option 3 description]
D. [Option 4 description]
E. Other - I'll describe my own"

CLARIFYING QUESTIONS:
If user asks "what do you mean by X?" or similar:
- Provide brief explanation (1-2 sentences)
- Re-ask the same question with the same options
- Mark this as a clarification, not advancing to the next question

OFF-TOPIC HANDLING:
If user mentions politics, personal advice, or unrelated topics:
- Respond: "I appreciate the question, but let's focus on your logo animation."
- Re-ask the current question with options
- Do not advance the question count

After Q4: Generate formatted creative direction in this style:
"[Opening statement]. Start with [atmosphere + lighting details]. Add [effects details] with [texture details]. [Camera movement] to create [desired feeling]. [Sound design details]."

BRAND CONTEXT:
- Brand Name: ${brandContext.brandName}
- Style Preset: ${brandContext.stylePreset}
- Aspect Ratio: ${brandContext.aspectRatio}

Keep responses concise, friendly, and focused on gathering creative direction details.`
}

export const questionTemplates: Record<
  number,
  (brandName: string) => { question: string; options: Option[] }
> = {
  1: (brandName: string) => ({
    question: `Let's start with the overall mood. What kind of atmosphere and lighting do you envision for ${brandName}'s logo animation?`,
    options: [
      {
        letter: 'A',
        text: 'Dark and moody with dramatic spotlight revealing the logo',
        isOther: false,
      },
      {
        letter: 'B',
        text: 'Light and airy with soft, natural lighting',
        isOther: false,
      },
      {
        letter: 'C',
        text: 'Bold and vibrant with colorful gradients and highlights',
        isOther: false,
      },
      {
        letter: 'D',
        text: 'Minimal and clean with subtle ambient lighting',
        isOther: false,
      },
      {
        letter: 'E',
        text: "Other - I'll describe my own",
        isOther: true,
      },
    ],
  }),

  2: (brandName: string) => ({
    question: `Great! Now, what kind of visual effects and textures would enhance ${brandName}?`,
    options: [
      {
        letter: 'A',
        text: 'Particles and sparks with dynamic energy',
        isOther: false,
      },
      {
        letter: 'B',
        text: 'Smooth gradients with subtle glows',
        isOther: false,
      },
      {
        letter: 'C',
        text: 'Geometric shapes and patterns',
        isOther: false,
      },
      {
        letter: 'D',
        text: 'Organic textures with depth and shadows',
        isOther: false,
      },
      {
        letter: 'E',
        text: "Other - I'll describe my own",
        isOther: true,
      },
    ],
  }),

  3: (brandName: string) => ({
    question: `Almost there! Describe the camera movement and sound design for ${brandName}.`,
    options: [
      {
        letter: 'A',
        text: 'Slow zoom-in with orchestral/cinematic audio',
        isOther: false,
      },
      {
        letter: 'B',
        text: 'Static camera with upbeat, energetic music',
        isOther: false,
      },
      {
        letter: 'C',
        text: 'Dynamic rotation with ambient atmospheric sounds',
        isOther: false,
      },
      {
        letter: 'D',
        text: 'Subtle drift/float with minimal sound design',
        isOther: false,
      },
      {
        letter: 'E',
        text: "Other - I'll describe my own",
        isOther: true,
      },
    ],
  }),

  // Q4 is dynamically generated by AI based on previous answers
}
