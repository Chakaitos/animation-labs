import { parseAIResponse } from '../streaming'

describe('parseAIResponse', () => {
  it('parses question with OPTIONS: format correctly', () => {
    const response = `Let's start with the overall mood.

OPTIONS:
A. Dark and moody with dramatic spotlight
B. Light and airy with soft lighting
C. Bold and vibrant with colorful highlights
D. Minimal and clean with subtle ambient lighting
E. Other - I'll describe my own`

    const result = parseAIResponse(response)

    expect(result.question).toBe("Let's start with the overall mood.")
    expect(result.options).toHaveLength(5)
    expect(result.options![0]).toMatchObject({
      letter: 'A',
      text: 'Dark and moody with dramatic spotlight',
      isOther: false,
    })
    expect(result.options![4]).toMatchObject({
      letter: 'E',
      isOther: true,
    })
  })

  it('parses question with **OPTIONS:** format correctly', () => {
    const response = `What kind of effects do you want?

**OPTIONS:**
A. Particles and sparks
B. Smooth gradients
C. Geometric shapes
D. Organic textures
E. Other - I'll describe my own`

    const result = parseAIResponse(response)

    expect(result.question).toContain('What kind of effects')
    expect(result.options).toHaveLength(5)
  })

  it('creates short labels for long option text', () => {
    const response = `Question here

OPTIONS:
A. High-contrast cinematic reveal with sharp lighting that cuts through the darkness, emphasizing power and precision
B. Short option
E. Other - I'll describe my own`

    const result = parseAIResponse(response)

    expect(result.options).toHaveLength(3)
    expect(result.options![0].shortLabel).toBeTruthy()
    expect(result.options![0].shortLabel!.length).toBeLessThan(
      result.options![0].text.length
    )
  })

  it('detects "Other" variations as isOther', () => {
    const testCases = [
      "Other - I'll describe my own",
      'Other - describe my own',
      'Other option',
    ]

    testCases.forEach((text) => {
      const response = `Question\n\nOPTIONS:\nA. Normal\nE. ${text}`
      const result = parseAIResponse(response)

      expect(result.options![1].isOther).toBe(true)
    })
  })

  it('returns null for options when no OPTIONS section found', () => {
    const response = 'This is just a regular response without options.'

    const result = parseAIResponse(response)

    expect(result.question).toBe(response)
    expect(result.options).toBeNull()
  })

  it('returns null for options when fewer than 2 options found', () => {
    const response = `Question here

OPTIONS:
A. Only one option`

    const result = parseAIResponse(response)

    expect(result.options).toBeNull()
  })

  it('handles malformed option lines gracefully', () => {
    const response = `Question here

OPTIONS:
A. Valid option
Not a valid option format
C. Another valid option`

    const result = parseAIResponse(response)

    expect(result.options).toHaveLength(2) // Only A and C
    expect(result.options![0].letter).toBe('A')
    expect(result.options![1].letter).toBe('C')
  })

  it('stops parsing after 5 options', () => {
    const response = `Question

OPTIONS:
A. Option 1
B. Option 2
C. Option 3
D. Option 4
E. Option 5
F. Option 6
G. Option 7`

    const result = parseAIResponse(response)

    expect(result.options).toHaveLength(5) // Max 5 options
  })

  it('handles final generation response (no options)', () => {
    const response = `Create a bold, masculine 8-second animation with dark background and bright white logo accents. Start with dramatic spotlight revealing the logo...`

    const result = parseAIResponse(response)

    expect(result.question).toBe(response)
    expect(result.options).toBeNull()
  })
})
