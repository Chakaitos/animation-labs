import Link from "next/link"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { Footer } from "@/components/marketing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Animation Labs",
  description: "Privacy Policy for Animation Labs logo animation service",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      <main className="flex-1 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <div className="mb-12 pb-8 border-b-2 border-slate-200 dark:border-zinc-800">
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Last updated: February 12, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                1. Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Animation Labs ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our logo animation service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.1 Personal Information</h3>
                  <p className="leading-relaxed mb-2">
                    When you create an account, we collect:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Password (encrypted)</li>
                    <li>Payment information (processed securely by Stripe)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.2 Content You Upload</h3>
                  <p className="leading-relaxed mb-2">
                    To generate animations, you provide:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Logo files and images</li>
                    <li>Company or project names</li>
                    <li>Animation preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.3 Usage Data</h3>
                  <p className="leading-relaxed mb-2">
                    We automatically collect:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>IP address and browser type</li>
                    <li>Pages visited and features used</li>
                    <li>Video generation history and preferences</li>
                    <li>Device information and operating system</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Provide, operate, and maintain our Service</li>
                <li>Process your payments and manage subscriptions</li>
                <li>Generate and deliver logo animation videos</li>
                <li>Send you important service updates and notifications</li>
                <li>Respond to your comments and customer service requests</li>
                <li>Improve our Service and develop new features</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues or fraud</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                4. Data Storage and Security
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.1 Where We Store Data</h3>
                  <p className="leading-relaxed">
                    Your data is stored securely using Supabase (PostgreSQL database and object storage). All data is encrypted at rest and in transit using industry-standard encryption protocols.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.2 Data Retention</h3>
                  <p className="leading-relaxed">
                    We retain your personal information and uploaded content for as long as your account is active. Generated videos are stored for 90 days after creation, after which they may be deleted. You can request deletion of your data at any time by contacting us.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">4.3 Security Measures</h3>
                  <p className="leading-relaxed">
                    We implement appropriate technical and organizational measures including encrypted passwords, secure HTTPS connections, regular security audits, and access controls. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                5. Third-Party Services
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use trusted third-party service providers to help operate our Service, including payment processing, data storage, email delivery, and video generation infrastructure. These providers are carefully selected and operate under strict confidentiality and security agreements.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <strong className="text-slate-900 dark:text-white">We do not sell your personal information to third parties.</strong> These service providers only access your information to the extent necessary to perform their specific functions on our behalf.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                6. Cookies and Tracking
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use essential cookies to maintain your login session and remember your preferences. We do not use advertising or tracking cookies. You can control cookie settings through your browser, though disabling cookies may limit Service functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                7. Data Sharing and Disclosure
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We do not sell or rent your personal information. We may share information only:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>With service providers who assist in operating our Service (under strict confidentiality agreements)</li>
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets (with notice to affected users)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                8. Your Privacy Rights
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Object to or restrict certain processing of your data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                To exercise these rights, please{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  contact us
                </Link>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                9. Children's Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                10. International Data Transfers
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to such transfers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or through a prominent notice on our Service. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                12. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  contact us
                </Link>.
              </p>
            </section>
          </div>

          {/* Footer navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
            <Link
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              Terms and Conditions →
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
