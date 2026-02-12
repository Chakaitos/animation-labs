import Link from "next/link"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Footer } from "@/components/marketing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions - Animation Labs",
  description: "Terms and Conditions for Animation Labs logo animation service",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      <main className="flex-1 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <div className="mb-12 pb-8 border-b-2 border-slate-200 dark:border-zinc-800">
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Last updated: February 12, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                By accessing or using Animation Labs ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                2. Service Description
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Animation Labs provides automated logo animation video generation services. We offer:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>One-time video purchases ($5 per video)</li>
                <li>Monthly subscription plans (Starter and Professional)</li>
                <li>Annual subscription plans with credit rollover</li>
                <li>Standard and Premium quality outputs</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                3. User Accounts
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and complete registration information</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                4. Credits and Subscriptions
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.1 Credit System</h3>
                  <p className="leading-relaxed">
                    Video generation requires credits based on quality: Standard quality videos require one (1) credit, while Premium quality videos require two (2) credits. Credits are non-refundable except as specified in Section 8.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.2 Monthly Subscriptions</h3>
                  <p className="leading-relaxed">
                    Credits are granted at the start of each billing cycle. Unused credits may roll over up to the plan's rollover cap. Credits expire 12 months from issuance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.3 Cancellation</h3>
                  <p className="leading-relaxed">
                    You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. Unused credits will be retained according to rollover rules.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                5. Content and Intellectual Property
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">5.1 Your Content</h3>
                  <p className="leading-relaxed">
                    You retain all rights to logos and materials you upload. By uploading content, you grant us a license to process, store, and generate animations from your materials solely to provide the Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">5.2 Generated Videos</h3>
                  <p className="leading-relaxed">
                    You own all rights to the final animated videos we generate for you. You may use them for any commercial or personal purpose.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">5.3 Prohibited Content</h3>
                  <p className="leading-relaxed">
                    You may not upload content that is illegal, infringes on intellectual property rights, contains malware, or violates these Terms.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                6. Payment Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                All payments are processed securely through Stripe. By providing payment information, you authorize us to charge your payment method for all fees incurred. Prices are subject to change with 30 days notice to active subscribers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                7. Service Availability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any part of the Service with reasonable notice. Typical video delivery time is 10-15 minutes, though this may vary based on system load.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                8. Refund Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Credits are generally non-refundable. However, if a technical failure prevents video delivery despite multiple attempts, we will refund the credit used. This does not apply to subjective quality preferences. We recommend reviewing our{" "}
                <Link href="/#examples" className="text-primary hover:underline font-medium">
                  example gallery
                </Link>{" "}
                before purchasing.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                9. Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Animation Labs and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly. Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                10. Disclaimer of Warranties
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be error-free, secure, or meet your specific requirements.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                11. Termination
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                12. Governing Law
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                13. Changes to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                14. Contact Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                For questions about these Terms, please contact us at{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  our contact page
                </Link>.
              </p>
            </section>
          </div>

          {/* Footer navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy →
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
