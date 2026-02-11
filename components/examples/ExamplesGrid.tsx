import Image from 'next/image'
import { Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/app/examples/_data/examples'

interface ExamplesGridProps {
  examples: Example[]
  onExampleClick: (example: Example) => void
}

export function ExamplesGrid({ examples, onExampleClick }: ExamplesGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examples.map((example) => (
        <button
          key={example.id}
          onClick={() => onExampleClick(example)}
          className="group relative text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all hover:scale-[1.02]"
        >
          {/* Video Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">
            <Image
              src={example.thumbnailUrl}
              alt={example.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-semibold">{example.title}</h3>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="text-xs bg-primary text-white dark:bg-primary dark:text-white border-none"
            >
              {example.style}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {example.industry}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
