import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Briefcase,
  Palette,
  Store,
  Upload,
  Wand2,
  Download,
  Share2,
  Globe,
  Play,
  Mail,
  Presentation,
  Target,
  type LucideIcon,
} from "lucide-react"

interface Persona {
  icon: LucideIcon
  title: string
  description: string
}

interface Step {
  icon: LucideIcon
  title: string
  description: string
}

interface UseCase {
  icon: LucideIcon
  title: string
  description: string
}

const personas: Persona[] = [
  {
    icon: Briefcase,
    title: "For Agencies",
    description:
      "Deliver client work faster without hiring animators. Scale your video production without scaling your team.",
  },
  {
    icon: Palette,
    title: "For Designers",
    description:
      "Add motion to your portfolio without learning After Effects. Impress clients with animated deliverables.",
  },
  {
    icon: Store,
    title: "For Businesses",
    description:
      "Elevate your brand without hiring a video team. Professional animations at a fraction of studio costs.",
  },
]

const steps: Step[] = [
  {
    icon: Upload,
    title: "Upload Your Logo",
    description:
      "Drag and drop your logo file (JPG/JPEG, PNG, or SVG). Transparent backgrounds are supported for PNG and SVG. AI generated logos are welcome too.",
  },
  {
    icon: Wand2,
    title: "Choose Your Style",
    description:
      "Choose from multiple crafted animation styles. Or customize it with your own creative direction.",
  },
  {
    icon: Download,
    title: "Download in Minutes",
    description:
      "Your animation is typically ready in under 5 minutes. Download a high quality MP4 that's ready for web, ads, and social platforms.",
  },
]

const useCases: UseCase[] = [
  {
    icon: Share2,
    title: "Social Media Posts",
    description:
      "Make your brand pop on Instagram, LinkedIn, and TikTok with eye-catching animated logos that stop the scroll.",
  },
  {
    icon: Globe,
    title: "Website Headers",
    description:
      "Add professional motion to your hero section and instantly elevate your site's first impression.",
  },
  {
    icon: Play,
    title: "Video Intros/Outros",
    description:
      "Start every YouTube video, reel, or presentation with a polished animated logo that screams credibility.",
  },
  {
    icon: Mail,
    title: "Email Signatures",
    description:
      "Stand out in crowded inboxes with animated email signatures that make your brand memorable.",
  },
  {
    icon: Presentation,
    title: "Client Presentations",
    description:
      "Open pitches and proposals with animated branding that sets a professional tone from slide one.",
  },
  {
    icon: Target,
    title: "Digital Ads",
    description:
      "Boost ad performance with motion graphics that capture attention in Facebook, Google, and LinkedIn campaigns.",
  },
]

export function HowToSection() {
  return (
    <section id="how-to" className="relative py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Know
          </h2>

          {/* Who This Is For */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">
              Who This Is For
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {personas.map((persona) => {
                const Icon = persona.icon
                return (
                  <div
                    key={persona.title}
                    className="text-center p-6 rounded-lg"
                  >
                    <div className="flex justify-center mb-4">
                      <Icon className="w-12 h-12 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold mb-3">
                      {persona.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {persona.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex justify-center mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                    <p className="text-muted-foreground">
                      {step.description}
                      {index === 1 && (
                        <>
                          {" "}
                          See our real customer{" "}
                          <Link
                            href="#examples"
                            className="text-primary hover:underline font-medium"
                          >
                            examples
                          </Link>{" "}
                          for inspiration.
                        </>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-2xl font-semibold text-center mb-8">
              Where to Use Your Animations
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase) => {
                const Icon = useCase.icon
                return (
                  <Card
                    key={useCase.title}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            {useCase.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {useCase.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
