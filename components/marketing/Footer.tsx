import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            2026 Animation Labs. All rights reserved.
          </p>

          {/* Navigation links */}
          <nav className="flex gap-4 text-sm">
            <Link
              href="/pricing"
              className="hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="hover:text-primary transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
