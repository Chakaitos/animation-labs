import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail skeleton */}
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full" />
      </CardHeader>

      {/* Content skeleton */}
      <CardContent className="space-y-2 p-4">
        {/* Brand name */}
        <Skeleton className="h-5 w-2/3" />
        {/* Date */}
        <Skeleton className="h-4 w-1/3" />
      </CardContent>

      {/* Footer skeleton */}
      <CardFooter className="p-4 pt-0">
        {/* Button placeholder */}
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}

export function VideoGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}
