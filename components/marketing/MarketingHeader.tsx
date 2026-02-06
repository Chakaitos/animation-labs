import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MarketingHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/AL_transparent_compact.png"
              alt="Animation Labs"
              width={250}
              height={66}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="text-sm hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
