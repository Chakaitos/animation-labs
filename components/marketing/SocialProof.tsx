import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { value: "1,000+", label: "Videos Created" },
  { value: "500+", label: "Happy Customers" },
  { value: "12 min", label: "Avg. Delivery Time" },
]

const testimonials = [
  {
    quote:
      "Animation Labs saved my Q4. We needed 20 videos for a product launch and got them all in a single afternoon.",
    author: "Sarah Chen",
    role: "VP of Marketing",
    company: "TechFlow",
  },
  {
    quote:
      "The quality rivals studios charging 10x the price. Our clients love the intro videos we deliver.",
    author: "Marcus Johnson",
    role: "Founder",
    company: "Creative Labs",
  },
]

export function SocialProof() {
  return (
    <section className="bg-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-8 mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials section */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">
              Trusted by Marketing Teams
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.author}>
                  <CardContent className="p-6">
                    <p className="italic text-muted-foreground mb-4">
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
