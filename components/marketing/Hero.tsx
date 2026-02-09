import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')"
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Headline section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Professional Logo Animations{" "}
              <span className="text-primary">At a Fraction of the Cost</span>
            </h1>
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
