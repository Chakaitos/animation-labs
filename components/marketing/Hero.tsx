import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Headline section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Professional Logo Animations{" "}
              <span className="text-primary">At a Fraction of the Cost</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              $3-5 per video, delivered in 10-15 minutes
            </p>
          </div>

          {/* Hero video */}
          <div className="aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl mb-8">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/examples/hero-poster.jpg"
              className="w-full h-full object-cover"
            >
              <source src="/examples/hero-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
