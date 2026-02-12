'use client'

import { useState } from "react"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Footer } from "@/components/marketing/Footer"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQS } from "@/lib/content/faqs"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlert(null)

    // Client-side validation
    if (formData.message.trim().length < 10) {
      setAlert({
        type: 'error',
        message: 'Message must be at least 10 characters long',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || undefined,
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAlert({
          type: 'success',
          message: "Thank you! We'll get back to you within 24 hours.",
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        setAlert({
          type: 'error',
          message: data.error || 'Failed to send message. Please try again.',
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main className="container mx-auto px-4 py-16">
        {/* Page header */}
        <h1 className="text-4xl font-bold text-center mb-4">
          Get in Touch
        </h1>
        <p className="max-w-2xl mx-auto text-center text-xl text-muted-foreground mb-12">
          Have a question or need help? We&apos;re here to assist you. Send us a message and we&apos;ll respond within 24 hours.
        </p>

        {/* Contact form */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Billing Question">Billing Question</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Partnership Opportunity">Partnership Opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={isLoading}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum 10 characters
                  </p>
                </div>

                {/* Alert */}
                {alert && (
                  <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alternative contact */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            You can also email us directly at{' '}
            <a href="mailto:support@animationlabs.ai" className="text-primary hover:underline">
              support@animationlabs.ai
            </a>
          </p>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-3xl mx-auto">
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
      </main>
      <Footer />
    </div>
  )
}
