import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Featured examples for homepage - showcasing variety
const examples = [
  {
    id: "intentional-man",
    title: "The Intentional Man Ministry",
    thumbnailUrl: "/examples/TheIntentionalManMinistry-thumb.jpg",
    style: "Epic",
    industry: "Ministry",
  },
  {
    id: "pokemon",
    title: "Pokémon",
    thumbnailUrl: "/examples/Pokemon-thumb.jpg",
    style: "Playful",
    industry: "Entertainment",
  },
  {
    id: "animation-labs",
    title: "Animation Labs",
    thumbnailUrl: "/examples/Animation_Labs-thumb.jpg",
    style: "Minimal",
    industry: "Tech Startup",
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
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example) => (
              <Link
                key={example.id}
                href="/examples"
                className="group cursor-pointer block"
              >
                {/* Image container with play overlay */}
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md mb-3">
                  <Image
                    src={example.thumbnailUrl}
                    alt={example.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-zinc-900/90 flex items-center justify-center">
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
                  <Badge
                    variant="secondary"
                    className="bg-primary text-white dark:bg-primary dark:text-white border-none"
                  >
                    {example.style}
                  </Badge>
                  <Badge variant="outline">{example.industry}</Badge>
                </div>
              </Link>
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
