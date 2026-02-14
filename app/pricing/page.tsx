'use client'

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Footer } from "@/components/marketing/Footer"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PLANS } from "@/lib/stripe/config"

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const isAnnual = interval === 'year'

  const handleSubscribe = async (planId: 'starter' | 'professional') => {
    setIsLoading(planId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, interval }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        alert('Failed to start checkout. Please try again.')
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main className="container mx-auto px-4 py-16">
        {/* Page header */}
        <h1 className="text-4xl font-bold text-center mb-4">
          Choose Your Plan
        </h1>
        <p className="max-w-2xl mx-auto text-center text-xl text-muted-foreground mb-8">
          Professional logo animations at a fraction of traditional costs. All
          plans include access to all animation styles and email support.
        </p>

        {/* Monthly/Annual toggle */}
        <div className="flex items-center justify-center gap-3 text-sm mb-8">
          <span className={isAnnual ? "" : "font-semibold"}>Monthly</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={(checked) => setInterval(checked ? 'year' : 'month')}
          />
          <span className={isAnnual ? "font-semibold" : ""}>
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              Save 17%
            </Badge>
          )}
        </div>

        {/* Promo code input - UI placeholder (hidden on mobile) */}
        <div className="max-w-sm mx-auto mb-8 hidden sm:block">
          <Label htmlFor="promo" className="text-sm text-muted-foreground">
            Have a promo code?
          </Label>
          <Input
            id="promo"
            placeholder="Enter code"
            disabled
            className="mt-2"
          />
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Try It Out - $5 Single Credit */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Out</CardTitle>
              <CardDescription>Test before you commit</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-muted-foreground">/video</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                One-time purchase
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">1 video</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Standard quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">All animation styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Try Now</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Starter Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{PLANS.starter.name}</CardTitle>
              <CardDescription>{PLANS.starter.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${isAnnual ? PLANS.starter.annual.price : PLANS.starter.monthly.price}
                </span>
                <span className="text-muted-foreground">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-muted-foreground mt-1">
                  ${(PLANS.starter.annual.price / 12).toFixed(2)}/month billed annually
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PLANS.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {/* Rollover is now included in base features array */}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('starter')}
                disabled={isLoading === 'starter'}
              >
                {isLoading === 'starter' ? 'Loading...' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="border-primary shadow-lg relative">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
              Recommended
            </div>
            <CardHeader>
              <CardTitle>{PLANS.professional.name}</CardTitle>
              <CardDescription>{PLANS.professional.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${isAnnual ? PLANS.professional.annual.price : PLANS.professional.monthly.price}
                </span>
                <span className="text-muted-foreground">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-muted-foreground mt-1">
                  ${(PLANS.professional.annual.price / 12).toFixed(2)}/month billed annually
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PLANS.professional.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {/* Rollover is now included in base features array */}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe('professional')}
                disabled={isLoading === 'professional'}
              >
                {isLoading === 'professional' ? 'Loading...' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Now</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
