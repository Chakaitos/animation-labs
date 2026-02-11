import type { Metadata } from 'next'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { Footer } from '@/components/marketing/Footer'
import { ExamplesGridWrapper } from '@/components/examples/ExamplesGridWrapper'
import { examples } from './_data/examples'

export const metadata: Metadata = {
  title: 'Examples - Animation Labs',
  description:
    'Explore our gallery of professional logo animations. See real examples with creative direction prompts to inspire your next video.',
  openGraph: {
    title: 'Examples - Animation Labs',
    description:
      'Explore our gallery of professional logo animations. See real examples with creative direction prompts to inspire your next video.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examples - Animation Labs',
    description:
      'Explore our gallery of professional logo animations. See real examples with creative direction prompts to inspire your next video.',
  },
}

export default function ExamplesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 dark:bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  Animation Examples
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Explore our gallery of professional logo animations. Each example includes the style and
                  creative direction prompt used to create it.
                </p>
              </div>

              {/* Examples Grid */}
              <ExamplesGridWrapper examples={examples} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Ready to Create Your Own?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get professional logo animations delivered in minutes. No design experience
                required—just describe what you want.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
