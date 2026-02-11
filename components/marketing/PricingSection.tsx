'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import { PLANS } from "@/lib/stripe/config"

export function PricingSection() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const isAnnual = interval === 'year'

  return (
    <section id="pricing" className="relative bg-white dark:bg-zinc-950 py-16 overflow-hidden">
      {/* Radial gradient accent - soft primary glow from bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-100/30 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50/60 dark:from-zinc-900/60 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mb-6">
            Pay per video or choose a plan. No hidden fees.
          </p>

          {/* Monthly/Annual toggle */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className={isAnnual ? "" : "font-semibold"}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={(checked) => setInterval(checked ? 'year' : 'month')}
            />
            <span className={isAnnual ? "font-semibold" : ""}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 bg-primary text-white dark:bg-primary dark:text-white border-none">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Try It Out Card - $5 single credit */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Out</CardTitle>
              <CardDescription>Test before you commit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-muted-foreground">/video</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  One-time purchase
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>1 video</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>All animation styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>10-15 min delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Try Now</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Starter Card */}
          <Card>
            <CardHeader>
              <CardTitle>{PLANS.starter.name}</CardTitle>
              <CardDescription>{PLANS.starter.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? PLANS.starter.annual.price : PLANS.starter.monthly.price}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isAnnual
                    ? `$${(PLANS.starter.annual.price / 12).toFixed(0)}/month billed annually`
                    : '~$3 per video'}
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>10 videos/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>All animation styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>10-15 min delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
                {isAnnual && PLANS.starter.annual.rolloverCap > 0 && (
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Up to {PLANS.starter.annual.rolloverCap} credits roll over</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Select Plan</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Card */}
          <Card className="border-primary shadow-lg relative">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
              Recommended
            </div>

            <CardHeader>
              <CardTitle>{PLANS.professional.name}</CardTitle>
              <CardDescription>{PLANS.professional.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? PLANS.professional.annual.price : PLANS.professional.monthly.price}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isAnnual
                    ? `$${(PLANS.professional.annual.price / 12).toFixed(0)}/month billed annually`
                    : 'Only $2.50 per video'}
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>30 videos/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>All animation styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>10-15 min delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Priority email support</span>
                </li>
                {isAnnual && PLANS.professional.annual.rolloverCap > 0 && (
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Up to {PLANS.professional.annual.rolloverCap} credits roll over</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/signup">Select Plan</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Technical guarantee */}
        <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Technical Failure Guarantee: If technical issues prevent video
            delivery, we&apos;ll refund your credit. See our{" "}
            <Link
              href="/examples"
              className="underline hover:text-primary transition-colors"
            >
              extensive examples
            </Link>{" "}
            to know exactly what you&apos;ll get.
          </p>
        </div>
      </div>
    </section>
  )
}
