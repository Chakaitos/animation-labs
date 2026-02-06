import Link from "next/link"
import Image from "next/image"
import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main footer grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Brand column */}
          <div className="space-y-4 md:col-span-1 text-center flex flex-col items-center">
            <Link href="/" className="inline-block">
              <Image
                src="/AL_transparent_compact.png"
                alt="Animation Labs"
                width={250}
                height={66}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Professional logo animations delivered in minutes.
            </p>
          </div>

          {/* Product column */}
          <div className="space-y-4 text-center">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
              Product
            </h3>
            <nav className="flex flex-col space-y-3" aria-label="Product links">
              <Link
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#examples"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Examples
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Support column */}
          <div className="space-y-4 text-center">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
              Support
            </h3>
            <nav className="flex flex-col space-y-3" aria-label="Support links">
              <Link
                href="#contact"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="#faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar: Social + Copyright + Legal */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on X"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe on YouTube"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright statement */}
          <p className="text-xs text-muted-foreground">
            © 2026 Animation Labs. All rights reserved.
          </p>

          {/* Legal links */}
          <nav className="flex items-center gap-2 text-xs" aria-label="Legal links">
            <Link
              href="#terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms and Conditions
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="#privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
