import Link from 'next/link'
import { Video, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EmptyVideosState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Video className="mb-4 size-12 text-muted-foreground opacity-50" />
        <h3 className="mb-2 text-lg font-semibold">No videos yet</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Create your first logo animation to get started.
        </p>
        <Button asChild>
          <Link href="/create-video">
            <Plus />
            Create Video
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
