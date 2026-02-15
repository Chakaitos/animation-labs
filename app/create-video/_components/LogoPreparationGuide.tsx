'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Sparkles, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoPreparationGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const aiPrompt = `Take my uploaded logo and:

1. Create a high-resolution image.
2. Center the logo perfectly.
3. Add 15–20% padding on all sides.
4. Keep the background clean (white or transparent).
5. Maintain aspect ratio without stretching.
6. Ensure the logo fully fits inside the frame even when slightly zoomed in.
7. Export in either 1920x1080 (16:9 landscape) or 1080x1920 (9:16 portrait).

This is for animated video use, so the logo must not touch the edges.`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mb-4 rounded-xl border border-info/20 bg-gradient-to-br from-info/5 via-transparent to-info/5 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-info/5 to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-info/5 transition-colors group"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center group-hover:bg-info/15 transition-colors">
          <Sparkles className="w-4 h-4 text-info" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground">
            Logo Preparation Tips
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get perfect results with properly formatted logos
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-4">
            {/* Why this matters */}
            <div className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 border border-border/50">
              <p className="font-medium text-foreground mb-1">Why proper formatting matters:</p>
              <p className="text-xs leading-relaxed">
                Logos often get zoomed during animation. Without adequate padding, your logo may appear cropped or cut off.
                Follow these guidelines to ensure your animation looks professional.
              </p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Good Logo Examples:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Landscape Example */}
                <div className="group relative rounded-lg border border-border overflow-hidden bg-background hover:border-info/40 transition-colors">
                  <div className="relative aspect-video">
                    <Image
                      src="/logo-guide-16x9.png"
                      alt="Landscape logo example (16:9) - centered with padding"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 bg-muted/50 border-t border-border">
                    <p className="text-xs font-medium text-foreground">Landscape (16:9)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">1920 × 1080 px</p>
                  </div>
                </div>

                {/* Portrait Example */}
                <div className="group relative rounded-lg border border-border overflow-hidden bg-background hover:border-info/40 transition-colors">
                  <div className="relative aspect-[9/16]">
                    <Image
                      src="/logo-guide-9x16.png"
                      alt="Portrait logo example (9:16) - centered with padding"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 bg-muted/50 border-t border-border">
                    <p className="text-xs font-medium text-foreground">Portrait (9:16)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">1080 × 1920 px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">AI Prompt for Logo Formatting:</h4>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-background hover:bg-muted transition-colors border border-border"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
                <pre className="text-xs leading-relaxed p-4 overflow-x-auto font-mono text-foreground/90">
                  {aiPrompt}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this prompt with ChatGPT, Claude, or any AI image tool to prepare your logo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
