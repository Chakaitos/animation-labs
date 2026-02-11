export interface Example {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl: string
  posterUrl: string
  creativeDirection: string
  style: string
  industry: string
}

export const examples: Example[] = [
  {
    id: 'modern-tech-fade',
    title: 'Modern Tech Fade In',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Create a smooth, modern logo animation with a gentle fade-in effect. Start with the logo at 0% opacity and gradually increase to 100% over 2 seconds. Add a subtle scale effect, starting at 95% size and growing to 100%. Use a smooth ease-out timing function for an elegant, professional feel. The animation should feel clean and minimalist, perfect for a tech startup.',
    style: 'Modern',
    industry: 'Tech Startup',
  },
  {
    id: 'energetic-bounce',
    title: 'Energetic Bounce',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Design an energetic logo animation with a playful bounce effect. The logo should drop in from above with a bouncing motion using elastic easing. Include 2-3 bounces that gradually settle. Add a slight rotation (±5 degrees) during the bounce for extra personality. The overall duration should be 3 seconds. This should feel fun and dynamic, great for consumer brands.',
    style: 'Playful',
    industry: 'E-commerce',
  },
  {
    id: 'cinematic-reveal',
    title: 'Cinematic Reveal',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Create a cinematic logo reveal with a dramatic sliding mask effect. Start with the logo behind a horizontal wipe that slides from left to right, revealing the logo progressively. Add a subtle glow effect that follows the reveal edge. Include a final camera zoom that brings the logo from 80% to 100% size. Total duration: 4 seconds. Use smooth cubic-bezier easing for a premium, high-end feel.',
    style: 'Cinematic',
    industry: 'Creative Agency',
  },
  {
    id: 'minimal-fade-up',
    title: 'Minimal Fade Up',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Design a minimal logo animation with a subtle upward movement. The logo should fade in from 0% to 100% opacity while simultaneously translating upward by 20 pixels. Use a 2-second duration with ease-out timing. Keep it understated and elegant—no extra effects. Perfect for professional services and minimalist brands that value simplicity.',
    style: 'Minimal',
    industry: 'Professional Services',
  },
  {
    id: 'spin-entrance',
    title: 'Spinning Entrance',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Create a dynamic spinning entrance for the logo. Start with a 360-degree rotation combined with a scale from 0% to 100%. Add a fade-in from 0% to 100% opacity during the spin. Use a 2.5-second duration with ease-in-out timing. The rotation should feel smooth but energetic. Add a slight overshoot at the end (scale to 102% then settle at 100%) for extra impact.',
    style: 'Dynamic',
    industry: 'Sports & Fitness',
  },
  {
    id: 'glitch-tech',
    title: 'Tech Glitch Effect',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Design a modern tech-inspired logo animation with a digital glitch effect. Create RGB channel splitting where red, green, and blue layers briefly separate by 5-10 pixels then snap together. Add 2-3 quick flicker moments during the first second. Follow with a smooth fade-in to full opacity. Total duration: 3 seconds. Should feel cutting-edge and tech-forward, perfect for software companies.',
    style: 'Glitch',
    industry: 'Tech Startup',
  },
  {
    id: 'elegant-zoom',
    title: 'Elegant Zoom In',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Create an elegant logo animation with a smooth zoom-in effect. Start the logo at 70% scale and grow to 100% over 3 seconds. Combine with a fade-in from 0% to 100% opacity. Use a smooth ease-out cubic-bezier curve for refined, luxury feel. Add a subtle blur effect that clears as the logo comes into focus. Perfect for premium brands and luxury services.',
    style: 'Elegant',
    industry: 'Luxury Goods',
  },
  {
    id: 'typewriter-build',
    title: 'Letter-by-Letter Build',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Design a logo animation where each letter or element appears sequentially like a typewriter. Each element should fade in and slightly scale up (from 90% to 100%) in quick succession with 0.1-second delays between elements. Total duration: 2-3 seconds depending on logo complexity. Add a subtle cursor blink effect. Great for wordmark logos and text-heavy designs.',
    style: 'Sequential',
    industry: 'Publishing',
  },
  {
    id: 'particle-assembly',
    title: 'Particle Assembly',
    videoUrl: '/examples/hero-demo.mp4',
    thumbnailUrl: '/examples/hero-demo.mp4',
    posterUrl: '/examples/hero-demo.mp4',
    creativeDirection: 'Create a futuristic logo animation where the logo assembles from scattered particles. Start with 20-30 small dots randomly positioned around the logo area. Each particle should move toward its final position in the logo with varying speeds and easing. Use 3 seconds total duration. Add a subtle glow effect as particles settle. Should feel high-tech and innovative, perfect for AI and data companies.',
    style: 'Futuristic',
    industry: 'AI & Data',
  },
]
