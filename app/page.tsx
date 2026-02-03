import type { Metadata } from "next"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Hero } from "@/components/marketing/Hero"
import { ExampleGallery } from "@/components/marketing/ExampleGallery"
import { SocialProof } from "@/components/marketing/SocialProof"
import { PricingSection } from "@/components/marketing/PricingSection"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "AnimateLabs - Professional Logo Animations in Minutes",
  description:
    "Create stunning logo animation videos for intros and outros at $3-5 per video. 10-15 minute turnaround with professional quality.",
  openGraph: {
    title: "AnimateLabs - Professional Logo Animations",
    description:
      "Professional logo animations at a fraction of traditional cost. $3-5 per video, delivered in minutes.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimateLabs - Professional Logo Animations",
    description:
      "Professional logo animations at a fraction of traditional cost.",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main>
        <Hero />
        <ExampleGallery />
        <SocialProof />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
