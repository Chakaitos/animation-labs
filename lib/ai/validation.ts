interface ValidationResult {
  valid: boolean
  error?: string
  redirect?: boolean
  isClarifyingQuestion?: boolean
}

/**
 * Detect if user input is a clarifying question
 */
export function detectClarifyingQuestion(input: string): boolean {
  const clarifyingPatterns = [
    /what\s+(do\s+you\s+mean|does|is)\s+/i,
    /can\s+you\s+(explain|clarify|tell\s+me\s+more)/i,
    /i\s+don't\s+understand/i,
    /could\s+you\s+elaborate/i,
    /what's\s+the\s+difference/i,
  ]

  return (
    clarifyingPatterns.some((pattern) => pattern.test(input)) ||
    input.includes('?')
  )
}

/**
 * Validate user input for AI creative direction
 */
export function validateUserInput(
  input: string | undefined,
  selectedOption: string | undefined,
  phase: number
): ValidationResult {
  // 1. Check if option was selected (valid for phases 1-3)
  if (selectedOption && ['A', 'B', 'C', 'D', 'E'].includes(selectedOption)) {
    return { valid: true }
  }

  // 2. If no option selected, must have text input
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      error: 'Please select an option or provide custom input',
    }
  }

  // 3. Detect if this is a clarifying question
  const isClarifyingQuestion = detectClarifyingQuestion(input)

  // 4. Length check (more lenient for clarifying questions)
  if (input.length > 500) {
    return { valid: false, error: 'Please keep answers under 500 characters' }
  }

  // 5. Minimum length (very lenient - just needs something)
  if (input.trim().length < 2) {
    return { valid: false, error: 'Please provide more details' }
  }

  // 6. Off-topic detection (skip for clarifying questions)
  if (!isClarifyingQuestion) {
    const offTopicKeywords = [
      'politics',
      'election',
      'president',
      'war',
      'religion',
      'medical advice',
      'legal advice',
      'financial advice',
      'weather',
      'recipe',
      'how to make',
    ]

    const lowerInput = input.toLowerCase()
    const containsOffTopic = offTopicKeywords.some((kw) =>
      lowerInput.includes(kw)
    )

    if (containsOffTopic) {
      return {
        valid: false,
        error: 'Please focus on logo animation details',
        redirect: true,
      }
    }
  }

  // 7. Prompt injection prevention
  const suspiciousPatterns = [
    /ignore\s+(previous|all)\s+instructions/i,
    /you\s+are\s+now/i,
    /system\s*:/i,
    /disregard\s+(everything|all)/i,
  ]

  const containsSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(input)
  )

  if (containsSuspicious) {
    return { valid: false, error: 'Invalid input detected' }
  }

  return { valid: true, isClarifyingQuestion }
}
