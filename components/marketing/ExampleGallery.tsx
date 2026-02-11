import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const examples = [
  {
    id: 1,
    thumbnailUrl: "/examples/modern-tech-thumb.jpg",
    style: "Modern",
    industry: "Tech Startup",
  },
  {
    id: 2,
    thumbnailUrl: "/examples/cinematic-ecommerce-thumb.jpg",
    style: "Cinematic",
    industry: "E-commerce",
  },
  {
    id: 3,
    thumbnailUrl: "/examples/minimal-agency-thumb.jpg",
    style: "Minimal",
    industry: "Creative Agency",
  },
  {
    id: 4,
    thumbnailUrl: "/examples/bold-fitness-thumb.jpg",
    style: "Bold",
    industry: "Fitness",
  },
  {
    id: 5,
    thumbnailUrl: "/examples/elegant-luxury-thumb.jpg",
    style: "Elegant",
    industry: "Luxury Brand",
  },
  {
    id: 6,
    thumbnailUrl: "/examples/playful-gaming-thumb.jpg",
    style: "Playful",
    industry: "Gaming",
  },
]

export function ExampleGallery() {
  return (
    <section id="examples" className="relative py-16 md:py-24 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <h2 className="text-3xl font-bold text-center mb-12">
            See Exactly What You&apos;ll Get
          </h2>

          {/* Grid layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examples.map((example) => (
              <div key={example.id} className="group cursor-pointer">
                {/* Image container with play overlay */}
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md mb-3">
                  <Image
                    src={example.thumbnailUrl}
                    alt={`${example.style} style animation for ${example.industry}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-primary ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Labels */}
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                    {example.style}
                  </span>
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm">
                    {example.industry}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Section CTA */}
          <div className="flex justify-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/examples">View All Examples</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
