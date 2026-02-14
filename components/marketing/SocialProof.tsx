'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"

const stats = [
  { value: "1,000+", label: "Videos Created" },
  { value: "250+", label: "Happy Customers" },
  { value: "5 mins", label: "Avg. Delivery Time" },
]

const testimonials = [
  {
    quote:
      "Animation Labs saved my Q4. We needed 20 videos for a product launch and got them all in a single afternoon.",
    author: "Sarah Ambrosini",
    role: "VP of Marketing",
    company: "TechFlow",
  },
  {
    quote:
      "The quality rivals studios charging 10x the price. Our clients love the intro videos we deliver.",
    author: "Neil Hamilton",
    role: "Owner",
    company: "Low Key Surfboards",
  },
  {
    quote:
      "We love the engagement and branding that the animations bring to our products and content.",
    author: "Joshua Saverio",
    role: "VP of Marketing",
    company: "ChakaToys",
  },
  {
    quote:
      "The quality rivals studios charging 10x the price. Our clients love the intro videos we deliver.",
    author: "Danel Alvarez",
    role: "Sr. Designer",
    company: "Diseño Creativo Open",
  },
]

export function SocialProof() {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 dark:from-zinc-900 dark:via-zinc-800/60 dark:to-zinc-900 py-16 overflow-hidden">
      {/* Primary green gradient accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-8 mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold mb-1 text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials carousel */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-block">
                <h2 className="text-3xl font-bold mb-2">
                  Trusted by Marketing Teams, Designers, and Businesses
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full mx-auto" />
              </div>
            </div>

            <Carousel
              plugins={[plugin.current]}
              className="w-full max-w-5xl mx-auto"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2">
                    <Card className="h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <p className="italic text-muted-foreground mb-4 flex-1">
                          &quot;{testimonial.quote}&quot;
                        </p>
                        <div>
                          <div className="font-semibold">{testimonial.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}, {testimonial.company}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
