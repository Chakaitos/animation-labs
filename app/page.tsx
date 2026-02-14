import type { Metadata } from "next"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Hero } from "@/components/marketing/Hero"
import { ExampleGallery } from "@/components/marketing/ExampleGallery"
import { HowToSection } from "@/components/marketing/HowToSection"
import { SocialProof } from "@/components/marketing/SocialProof"
import { PricingSection } from "@/components/marketing/PricingSection"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Animation Labs - Professional Logo Animations in Minutes",
  description:
    "Create stunning logo animation videos for intros and outros at $3-5 per video. 10-15 minute turnaround with professional quality.",
  openGraph: {
    title: "Animation Labs - Professional Logo Animations",
    description:
      "Professional logo animations at a fraction of traditional cost. $3-5 per video, delivered in minutes.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Animation Labs - Professional Logo Animations",
    description:
      "Professional logo animations at a fraction of traditional cost.",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <ExampleGallery />
        <HowToSection />
        <SocialProof />
        {/* <PricingSection /> */}
      </main>
      <Footer />
    </div>
  )
}
