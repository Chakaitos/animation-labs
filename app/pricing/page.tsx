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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PLANS } from "@/lib/stripe/config"

const FAQS = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your credits remain valid until the end of your billing period.",
  },
  {
    question: "What happens to unused credits?",
    answer:
      "Monthly plans: Credits reset each billing cycle. Annual plans: Credits grant monthly with rollover - up to 3 credits for Starter and 10 for Professional can roll over to the next month. You can always purchase additional credit packs if needed.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We refund credits only for technical failures that prevent video delivery. Quality preferences are subjective—our extensive example gallery shows exactly what you'll get before you subscribe.",
  },
  {
    question: "How long does video delivery take?",
    answer:
      "Most videos are delivered within 10-15 minutes. Processing time may vary slightly based on complexity and current demand.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change your plan at any time. When upgrading, you'll receive additional credits immediately. When downgrading, the change takes effect at your next billing cycle.",
  },
  {
    question: "Do you offer annual plans?",
    answer:
      "Yes! Annual billing is now available. Save 17% with annual plans - $300/year for Starter (instead of $360) and $750/year for Professional (instead of $900). Plus, annual plans include credit rollover benefits.",
  },
]

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const isAnnual = interval === 'year'

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
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          )}
        </div>

        {/* Promo code input - UI placeholder */}
        <div className="max-w-sm mx-auto mb-8">
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
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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
                {isAnnual && PLANS.starter.annual.rolloverCap > 0 && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Up to {PLANS.starter.annual.rolloverCap} credits roll over monthly
                    </span>
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

          {/* Professional Plan */}
          <Card className="border-primary shadow-lg relative">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
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
                {isAnnual && PLANS.professional.annual.rolloverCap > 0 && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Up to {PLANS.professional.annual.rolloverCap} credits roll over monthly
                    </span>
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

        {/* Technical Failure Guarantee */}
        <div className="max-w-2xl mx-auto mb-16 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Technical Failure Guarantee</h3>
          <p className="text-sm text-muted-foreground">
            If technical issues prevent video delivery, we'll refund your
            credit. This guarantee covers system failures, not subjective
            quality preferences. Check our{" "}
            <Link href="/#examples" className="text-primary hover:underline">
              extensive example gallery
            </Link>{" "}
            to ensure our animations meet your expectations before subscribing.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
