'use client'

import { useState } from 'react'
import { ChevronDown, Lightbulb, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXAMPLE_ELEMENTS = [
  { label: 'Atmosphere', color: 'text-purple-600 dark:text-purple-400', text: 'dark, moody background' },
  { label: 'Lighting', color: 'text-amber-600 dark:text-amber-400', text: 'soft spotlight slowly revealing' },
  { label: 'Effects', color: 'text-orange-600 dark:text-orange-400', text: 'tiny ember-like sparks that flicker subtly' },
  { label: 'Texture', color: 'text-slate-600 dark:text-slate-400', text: 'deep shadow and texture' },
  { label: 'Camera', color: 'text-blue-600 dark:text-blue-400', text: 'slow dolly-in with slight side-to-side drift' },
  { label: 'Sound', color: 'text-emerald-600 dark:text-emerald-400', text: 'low orchestral rumble with faint crackling' },
]

export function CreativeDirectionExample() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-2 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-primary/5 transition-colors group"
        type="button"
      >
        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            See example creative direction
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-1 space-y-3">
            {/* Elements Legend */}
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_ELEMENTS.map((element) => (
                <div
                  key={element.label}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 border border-border/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: element.color.split(' ')[0].replace('text-', '') }} />
                  <span className="text-xs font-medium text-muted-foreground">{element.label}</span>
                </div>
              ))}
            </div>

            {/* Example Text */}
            <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Example</span>
                </div>
              </div>

              <div className="p-3 pr-20">
                <p className="text-xs leading-relaxed text-foreground/90">
                  Keep it <span className="font-medium">cinematic and minimal</span>. Start on a{' '}
                  <span className="font-medium text-purple-600 dark:text-purple-400">dark, moody background</span> with a{' '}
                  <span className="font-medium text-amber-600 dark:text-amber-400">soft spotlight slowly revealing</span> the Nike swoosh. Add{' '}
                  <span className="font-medium text-orange-600 dark:text-orange-400">tiny ember-like sparks that flicker subtly around the edges</span>, just enough to give it energy without turning it into a fire effect. Use{' '}
                  <span className="font-medium text-slate-600 dark:text-slate-400">deep shadow and texture</span> so the swoosh feels powerful and high-contrast.{' '}
                  <span className="font-medium text-blue-600 dark:text-blue-400">Camera should do a slow dolly-in with a slight side-to-side drift</span> so the shadows feel like they're moving.{' '}
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Sound should be a low orchestral rumble with faint crackling embers and a soft wind atmosphere</span>.
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="flex gap-2 text-xs text-muted-foreground bg-background/50 rounded-md p-2.5 border border-border/50">
              <span className="font-medium text-primary">Pro tip:</span>
              <span>Be specific about atmosphere, lighting, effects, textures, camera movements, and sound design for best results.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
