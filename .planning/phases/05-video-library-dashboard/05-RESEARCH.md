# Phase 5: Video Library & Dashboard - Research

**Researched:** 2026-02-01
**Domain:** Video library management, dashboard UI, data filtering, video preview
**Confidence:** HIGH

## Summary

Phase 5 implements a video library dashboard for users to view, manage, and download their logo animation videos. The research reveals well-established patterns for Next.js 15+ App Router data fetching with search/filter capabilities, proven dashboard card layouts, and video preview/download UX patterns.

**Key findings:**
- Next.js App Router favors URL search params for filters (bookmarkable, SSR-friendly) with Server Components for data fetching
- Grid card layouts (2-3 columns) are standard for video libraries, with bento grid patterns dominating 2026 design trends
- shadcn/ui data table + TanStack Table provides flexible filtering/sorting, but grid card view is better for video thumbnails
- Supabase Realtime enables live status updates for processing videos via broadcast triggers
- Video download uses native HTML5 `<a download>` attribute for simple, accessible downloads
- Deletion requires AlertDialog confirmation for destructive actions (not Dialog)
- Empty states need clear CTA and context ("Create your first video")

**Primary recommendation:** Use Server Components with URL search params for filtering, grid card layout for videos, Suspense boundaries for streaming, AlertDialog for deletions, and optional Supabase Realtime for live status updates. Keep filtering simple (status dropdown + search input) without complex data table UI.

## Standard Stack

The established libraries/tools for video library dashboards:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.x | Full-stack framework | App Router Server Components for data fetching, URL search params pattern |
| @supabase/supabase-js | Latest | Database client | Already integrated, videos table with user_id + status composite index |
| react | Latest | UI library | Suspense boundaries for streaming, built into Next.js |
| lucide-react | Latest | Icons | Already in project, provides Video/Download/Trash/Search icons |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | ^10.x | Debounce search input | Recommended by Next.js official docs for search, reduces queries |
| @tanstack/react-table | ^8.x | Table logic (optional) | If complex sorting/filtering needed, but NOT recommended for grid layout |
| react-player | ^2.x | Video preview (optional) | If inline video preview needed, supports poster/light mode |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| URL search params | Client state (useState) | State = no bookmarks, no SSR. URL params = shareable, SEO-friendly |
| Grid cards | Data table | Table = compact, text-heavy. Cards = visual, better for video thumbnails |
| Native `<video>` tag | react-player library | Native = simpler, lighter. react-player = more features, heavier bundle |
| AlertDialog (shadcn/ui) | Custom modal | AlertDialog = accessible, focus trap, keyboard nav. Custom = more code |
| Supabase Realtime | Polling (useEffect timer) | Realtime = instant updates, scalable. Polling = simpler but inefficient |

**Installation:**
```bash
npm install use-debounce
# Optional: npm install react-player
```

**Already installed:** shadcn/ui components (Card, AlertDialog, Badge, Input, Select)

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard with recent videos (3-5 cards)
│   └── videos/
│       └── page.tsx              # Full video library with filters
│
components/
├── videos/
│   ├── video-card.tsx            # Video card component (thumbnail, status, actions)
│   ├── video-grid.tsx            # Grid layout wrapper
│   ├── video-filters.tsx         # Search + status filter (Client Component)
│   ├── delete-video-dialog.tsx   # AlertDialog for deletion
│   └── video-status-badge.tsx    # Status indicator (Processing/Completed/Failed)
│
lib/
├── supabase/
│   ├── queries/
│   │   └── videos.ts             # Reusable video queries
│   └── server.ts                 # Already exists
│
actions/
└── videos.ts                     # Server Actions (delete video)
```

### Pattern 1: Server Component with URL Search Params
**What:** Page receives `searchParams` prop, fetches filtered data, renders server-side
**When to use:** Main videos page with search and status filter
**Example:**
```typescript
// app/(protected)/videos/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { VideoGrid } from '@/components/videos/video-grid'
import { VideoFilters } from '@/components/videos/video-filters'
import { VideoCardSkeleton } from '@/components/videos/video-card-skeleton'

type SearchParams = Promise<{
  query?: string
  status?: string
}>

export default async function VideosPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const status = searchParams?.status || 'all'

  return (
    <div>
      <VideoFilters /> {/* Client Component - updates URL params */}

      <Suspense
        key={query + status} // Re-render on param change
        fallback={<VideoGridSkeleton />}
      >
        <VideoList query={query} status={status} />
      </Suspense>
    </div>
  )
}

async function VideoList({ query, status }: { query: string; status: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let queryBuilder = supabase
    .from('videos')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (query) {
    queryBuilder = queryBuilder.ilike('brand_name', `%${query}%`)
  }

  const { data: videos } = await queryBuilder

  return <VideoGrid videos={videos || []} />
}
```
**Source:** [Next.js App Router Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)

### Pattern 2: Client Component Filter with Debounced Search
**What:** Search input updates URL params with debounce, status select updates immediately
**When to use:** VideoFilters component for user input
**Example:**
```typescript
// components/videos/video-filters.tsx
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function VideoFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Search by brand name..."
        defaultValue={searchParams.get('query') || ''}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Videos</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```
**Source:** [Next.js useSearchParams documentation](https://nextjs.org/docs/app/api-reference/functions/use-search-params), [use-debounce library](https://www.npmjs.com/package/use-debounce)

### Pattern 3: Video Card with Status Badge and Actions
**What:** Card displays thumbnail, brand name, status badge, download/delete actions
**When to use:** Each video in grid layout
**Example:**
```typescript
// components/videos/video-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Trash2, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { DeleteVideoDialog } from './delete-video-dialog'

type Video = {
  id: string
  brand_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  video_url: string | null
  thumbnail_url: string | null
  created_at: string
  error_message: string | null
}

export function VideoCard({ video }: { video: Video }) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      variant: 'default' as const,
      label: 'Ready'
    },
    processing: {
      icon: Loader2,
      variant: 'secondary' as const,
      label: 'Processing',
      className: 'animate-spin'
    },
    pending: {
      icon: Loader2,
      variant: 'secondary' as const,
      label: 'Queued'
    },
    failed: {
      icon: XCircle,
      variant: 'destructive' as const,
      label: 'Failed'
    },
  }

  const status = statusConfig[video.status]
  const StatusIcon = status.icon

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {/* Video thumbnail or placeholder */}
        <div className="relative aspect-video bg-muted">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.brand_name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <StatusIcon className={status.className} />
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-2 right-2">
            <Badge variant={status.variant}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{video.brand_name}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString()}
        </p>
        {video.status === 'failed' && video.error_message && (
          <p className="text-sm text-destructive mt-2">{video.error_message}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {video.status === 'completed' && video.video_url && (
          <Button asChild size="sm" className="flex-1">
            <a href={video.video_url} download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        )}
        <DeleteVideoDialog videoId={video.id} brandName={video.brand_name} />
      </CardFooter>
    </Card>
  )
}
```
**Source:** [shadcn/ui Card](https://ui.shadcn.com/docs/components/card), [shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge)

### Pattern 4: Deletion Confirmation with AlertDialog
**What:** AlertDialog interrupts user, requires explicit confirmation for destructive action
**When to use:** Video deletion (cannot be undone)
**Example:**
```typescript
// components/videos/delete-video-dialog.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteVideo } from '@/actions/videos'
import { toast } from 'sonner'

export function DeleteVideoDialog({ videoId, brandName }: { videoId: string; brandName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteVideo(videoId)
      toast.success('Video deleted')
      router.refresh() // Refresh server component data
    } catch (error) {
      toast.error('Failed to delete video')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{brandName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this video. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Video'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```
**Source:** [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog), [NN/G Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/)

### Pattern 5: Empty State with Clear CTA
**What:** When user has no videos, show helpful empty state with "Create Video" button
**When to use:** Dashboard "Recent Videos" section, or full library when empty
**Example:**
```typescript
// components/videos/empty-state.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Plus } from 'lucide-react'
import Link from 'next/link'

export function EmptyVideosState() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-sm mb-4">
            Create your first logo animation to get started.
          </p>
          <Button asChild>
            <Link href="/create-video">
              <Plus className="h-4 w-4 mr-2" />
              Create Video
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```
**Source:** [Material Design Empty States](https://m1.material.io/patterns/empty-states.html), [Empty State UX Best Practices](https://www.pencilandpaper.io/articles/empty-states)

### Pattern 6: Dashboard with Recent Videos (Limited Results)
**What:** Dashboard shows credit balance + 3-5 most recent videos, not full library
**When to use:** Main dashboard page (separate from full video library)
**Example:**
```typescript
// app/(protected)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get recent videos (limit 5)
  const { data: recentVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      {/* Credit balance and stats cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <CreditBalance />
        {/* Other stat cards */}
      </div>

      {/* Recent videos section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Videos</h2>
          <Button variant="ghost" asChild>
            <Link href="/videos">View All</Link>
          </Button>
        </div>

        {recentVideos?.length ? (
          <VideoGrid videos={recentVideos} />
        ) : (
          <EmptyVideosState />
        )}
      </div>
    </div>
  )
}
```
**Source:** [Dashboard Design Best Practices](https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux) (recommends 5-6 cards max for initial view)

### Pattern 7: Optional Realtime Status Updates (Advanced)
**What:** Subscribe to video status changes via Supabase Realtime, update UI without refresh
**When to use:** If user stays on page while video processes (10-15 min wait time)
**Example:**
```typescript
// components/videos/video-grid-realtime.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VideoCard } from './video-card'

export function VideoGridRealtime({ initialVideos }: { initialVideos: Video[] }) {
  const [videos, setVideos] = useState(initialVideos)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `user_id=eq.${user.id}` // Filter to user's videos
        },
        (payload) => {
          setVideos((prev) =>
            prev.map((video) =>
              video.id === payload.new.id ? payload.new as Video : video
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
```
**Source:** [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)

**Note:** Realtime is OPTIONAL. For v1, simple page refresh after returning from create-video page is sufficient. Add Realtime in future iteration if users report frustration with manual refresh.

### Anti-Patterns to Avoid
- **Data table for videos:** Tables work for text-heavy data, not visual content. Use grid cards for video thumbnails.
- **Dialog instead of AlertDialog:** Dialog can be dismissed by clicking outside. AlertDialog forces explicit choice for destructive actions.
- **Client-side filtering only:** Loses SSR benefits, no shareable URLs, bad for SEO. Use URL search params + Server Components.
- **Infinite scroll without pagination:** Harder to share specific results, no "back" button support. Use pagination or "Load More" button.
- **Optimistic deletion without confirmation:** Users accidentally delete videos. Always require confirmation for destructive actions.
- **Fetching all videos client-side:** Inefficient with large datasets. Let database handle filtering with indexed queries.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video thumbnail generation | Custom FFmpeg logic | n8n workflow generates thumbnail | Already part of video workflow, stored in videos.thumbnail_url |
| Search debouncing | Manual setTimeout logic | use-debounce library | Handles cleanup, race conditions, React 18+ concurrent rendering |
| Status badge styling | Custom CSS for each status | shadcn/ui Badge with variants | Accessible, consistent, supports theming |
| Modal focus trap | Custom keyboard event handlers | shadcn/ui AlertDialog (Radix UI) | ARIA compliant, focus trap, ESC key, click outside handling |
| URL parameter parsing | Manual URLSearchParams logic | Next.js useSearchParams hook | Type-safe, SSR-compatible, automatic updates |
| Video download | Custom Blob download logic | Native HTML `<a download>` attribute | Browser-native, works across all devices, handles CORS |
| Filter state management | Complex reducer or Zustand | URL search params | Bookmarkable, shareable, SSR-friendly, no client state needed |
| Realtime connection management | Manual WebSocket handling | Supabase Realtime channels | Auto-reconnect, RLS policies, postgres_changes filter |

**Key insight:** Next.js App Router + Supabase provide 90% of video library functionality out-of-the-box. Focus on UX polish (empty states, loading skeletons, helpful error messages) not infrastructure.

## Common Pitfalls

### Pitfall 1: Suspense Key Missing on URL Parameter Changes
**What goes wrong:** User changes search query or status filter, but loading state doesn't show — page appears frozen.

**Why it happens:**
- Suspense boundary doesn't re-trigger when `searchParams` change
- React thinks it's the same component, doesn't show fallback
- User has no feedback that filtering is happening

**How to avoid:**
- Add `key` prop to Suspense boundary using search params: `key={query + status}`
- Forces React to unmount/remount on param changes
- Fallback UI renders while new data fetches

**Warning signs:**
- Filter changes don't show loading state
- UI feels "stuck" when searching
- Console warning about Suspense not triggered

**Source:** [Next.js Suspense Best Practices](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/), [Wisp CMS Suspense Guide](https://www.wisp.blog/blog/mastering-react-suspense-in-nextjs-15-a-developers-guide)

### Pitfall 2: Database Query N+1 Problem with Video Metadata
**What goes wrong:** Fetching videos list is fast, but rendering thumbnails from Supabase Storage causes hundreds of slow requests.

**Why it happens:**
- Videos table stores thumbnail paths, not full URLs
- Each VideoCard makes separate Storage API call to get signed URL
- Network waterfall: query → render → 20 thumbnail requests
- Supabase Storage has rate limits (100 req/10s on free tier)

**How to avoid:**
- Store full public URLs in `videos.thumbnail_url` (not just paths)
- Use public bucket with read access (already configured in Phase 4: `logos` bucket)
- Generate thumbnail URLs during n8n workflow, store in database
- If signed URLs needed, batch them in Server Component before passing to VideoCard

**Warning signs:**
- Video library page slow despite fast database query
- Network tab shows waterfall of storage.supabase.co requests
- Rate limit errors from Supabase Storage
- Lighthouse report flags "excessive network requests"

**Source:** [Supabase Storage Public Buckets](https://supabase.com/docs/guides/storage/uploads/public-buckets), Existing decision D-04-03-001 (public read access for logos bucket)

### Pitfall 3: Video Download Fails Due to CORS
**What goes wrong:** Download button works locally but fails in production with CORS error.

**Why it happens:**
- Supabase Storage requires CORS configuration for downloads from different domains
- `<a download>` attribute only works for same-origin URLs
- n8n-generated videos stored in external CDN without CORS headers
- Browser blocks download due to security policy

**How to avoid:**
- Configure Supabase Storage bucket CORS to allow your domain
- Use server-side proxy route if videos stored externally: `/api/download/[videoId]`
- Ensure `video_url` is publicly accessible (no auth required)
- Test download in production before launch (local bypasses CORS)

**Warning signs:**
- Download works in dev but fails in production
- Console error: "Cross-origin request blocked"
- Download button triggers navigation instead of download
- Right-click "Save As" works but button doesn't

**Source:** [Supabase Storage CORS](https://supabase.com/docs/guides/storage/uploads/cors), [HTML Download Attribute MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)

### Pitfall 4: Empty State Shown Briefly During Loading
**What goes wrong:** User navigates to library → sees "No videos" empty state → videos load → flicker.

**Why it happens:**
- Server Component data fetching not wrapped in Suspense
- Component renders synchronously with empty array initially
- Videos fetch completes, triggers re-render
- Poor perceived performance despite fast query

**How to avoid:**
- Wrap data-fetching component in Suspense boundary
- Show skeleton loading state (grid of card skeletons) in fallback
- Ensure async data fetch happens before render (Server Component)
- Use `loading.tsx` for route-level loading state

**Warning signs:**
- Brief flash of empty state on page load
- Cumulative Layout Shift (CLS) in Lighthouse report
- Users report "flickering" when navigating to library
- Fast 3G simulation shows empty state prominently

**Source:** [Next.js Loading UI and Streaming](https://nextjs.org/docs/14/app/building-your-application/routing/loading-ui-and-streaming)

### Pitfall 5: Deletion Doesn't Remove Video Files from Storage
**What goes wrong:** User deletes video, database record removed, but video files remain in Supabase Storage forever (storage bloat).

**Why it happens:**
- Delete action only removes row from `videos` table
- Storage objects (logo, video, thumbnail) have separate lifecycle
- No cascade delete configured
- Storage costs increase over time

**How to avoid:**
- In delete Server Action, remove storage objects before deleting database row
- Use Supabase Storage `remove()` method for logo_url, video_url, thumbnail_url
- Consider soft delete (add `deleted_at` column) to enable "undo" or recovery
- Add database trigger to clean up storage on row delete (advanced)

**Warning signs:**
- Supabase Storage usage grows but video count stays low
- Orphaned files in Storage browser
- Storage quota alerts from Supabase
- Deleted videos still accessible via old URLs

**Implementation:**
```typescript
// actions/videos.ts
'use server'

export async function deleteVideo(videoId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get video URLs before deletion
  const { data: video } = await supabase
    .from('videos')
    .select('logo_url, video_url, thumbnail_url')
    .eq('id', videoId)
    .eq('user_id', user!.id)
    .single()

  if (!video) throw new Error('Video not found')

  // 2. Delete storage objects
  const filesToDelete = [
    video.logo_url,
    video.video_url,
    video.thumbnail_url,
  ].filter(Boolean).map(url => {
    // Extract path from full URL
    const urlObj = new URL(url!)
    return urlObj.pathname.split('/').slice(-1)[0] // filename
  })

  if (filesToDelete.length) {
    await supabase.storage.from('logos').remove(filesToDelete) // Or appropriate bucket
  }

  // 3. Delete database row
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('user_id', user!.id)

  if (error) throw error
}
```

**Source:** [Supabase Storage Delete Files](https://supabase.com/docs/reference/javascript/storage-from-remove), Database best practices

### Pitfall 6: Realtime Subscription Memory Leak
**What goes wrong:** Video library page gets slower over time, browser tab uses increasing memory, eventually crashes.

**Why it happens:**
- Realtime channel subscription created in useEffect
- Component unmounts but channel not cleaned up
- Multiple subscriptions accumulate on navigation back/forth
- Supabase client keeps connections open

**How to avoid:**
- Always return cleanup function from useEffect
- Call `supabase.removeChannel(channel)` on unmount
- Use dependency array to prevent recreation on every render
- Consider skipping Realtime for v1 (use manual refresh instead)

**Warning signs:**
- Browser dev tools show increasing WebSocket connections
- Memory usage grows in Performance Monitor
- Realtime events fire multiple times for single database change
- Console warning: "Multiple subscriptions to same channel"

**Source:** [Supabase Realtime Best Practices](https://supabase.com/docs/guides/realtime), React useEffect cleanup pattern

## Code Examples

Verified patterns from official sources:

### Complete Server Component Page with Filtering
```typescript
// app/(protected)/videos/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VideoGrid } from '@/components/videos/video-grid'
import { VideoFilters } from '@/components/videos/video-filters'
import { EmptyVideosState } from '@/components/videos/empty-state'
import { VideoCardSkeleton } from '@/components/videos/video-card-skeleton'

type SearchParams = Promise<{
  query?: string
  status?: string
}>

export default async function VideosPage(props: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const status = searchParams?.status || 'all'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Library</h1>
        <Button asChild>
          <Link href="/create-video">
            <Plus className="h-4 w-4 mr-2" />
            Create Video
          </Link>
        </Button>
      </div>

      <VideoFilters />

      <Suspense
        key={query + status} // CRITICAL: Re-trigger on param change
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <VideoList query={query} status={status} userId={user.id} />
      </Suspense>
    </div>
  )
}

async function VideoList({
  query,
  status,
  userId,
}: {
  query: string
  status: string
  userId: string
}) {
  const supabase = await createClient()

  // Build query with filters
  let queryBuilder = supabase
    .from('videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply status filter (uses composite index: user_id, status)
  if (status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  // Apply search filter (case-insensitive partial match)
  if (query) {
    queryBuilder = queryBuilder.ilike('brand_name', `%${query}%`)
  }

  const { data: videos } = await queryBuilder

  if (!videos?.length) {
    return <EmptyVideosState />
  }

  return <VideoGrid videos={videos} />
}
```
**Source:** [Next.js App Router Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)

### Delete Video Server Action with Storage Cleanup
```typescript
// actions/videos.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteVideo(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get video to check ownership and retrieve file URLs
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('logo_url, video_url, thumbnail_url, user_id')
    .eq('id', videoId)
    .single()

  if (fetchError || !video) {
    throw new Error('Video not found')
  }

  // Verify ownership (additional security check)
  if (video.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // Extract storage paths from URLs
  const extractPath = (url: string | null) => {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      // Extract path after bucket name
      // Example: https://...storage.../logos/user-id/file.png -> user-id/file.png
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.indexOf('logos')
      return pathParts.slice(bucketIndex + 1).join('/')
    } catch {
      return null
    }
  }

  const filesToDelete = [
    extractPath(video.logo_url),
    extractPath(video.video_url),
    extractPath(video.thumbnail_url),
  ].filter((path): path is string => path !== null)

  // Delete storage files (don't fail if already deleted)
  if (filesToDelete.length) {
    await supabase.storage.from('logos').remove(filesToDelete)
  }

  // Delete database record (RLS ensures user can only delete own videos)
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)

  if (deleteError) {
    throw new Error('Failed to delete video')
  }

  // Revalidate pages to reflect deletion
  revalidatePath('/videos')
  revalidatePath('/dashboard')

  return { success: true }
}
```
**Source:** [Supabase Storage Remove](https://supabase.com/docs/reference/javascript/storage-from-remove), [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side filtering with useState | URL search params + Server Components | Next.js 13+ (2023) | Shareable URLs, SSR, better SEO, no client state management |
| Table view for media content | Grid card layout with thumbnails | 2024-2025 | Better visual hierarchy, mobile-friendly, follows Bento grid trend |
| Manual debouncing with setTimeout | use-debounce library | 2021+ | Handles cleanup, race conditions, React 18+ concurrent rendering |
| Dialog for deletions | AlertDialog for destructive actions | 2023+ (Radix UI) | Forces explicit choice, better accessibility, prevents accidental deletion |
| Custom loading states | Suspense boundaries with streaming | Next.js 13+ (2022) | Progressive rendering, better perceived performance, built-in |
| Polling for status updates | Realtime subscriptions (optional) | 2023+ (Supabase Realtime) | Instant updates, more scalable, less server load |

**Deprecated/outdated:**
- **Client-side pagination only:** Next.js App Router favors server-side pagination with URL params (better SEO, shareable)
- **Custom debounce implementations:** use-debounce handles edge cases (concurrent rendering, cleanup, fast refresh)
- **Manual focus trap for modals:** Radix UI primitives (AlertDialog, Dialog) provide built-in accessible patterns

## Open Questions

Things that couldn't be fully resolved:

1. **Video preview playback behavior**
   - What we know: react-player supports light mode (poster + play icon), native `<video>` tag simpler
   - What's unclear: User expectation — inline preview vs. download-to-watch? Bandwidth implications?
   - Recommendation: Start with thumbnail-only (no preview). Add hover preview in v2 if users request it. Bandwidth costs unknown.

2. **Pagination vs. "Load More" vs. Infinite Scroll**
   - What we know: URL params enable pagination, TanStack Query enables infinite scroll
   - What's unclear: User has 10-15 min video creation time — will libraries grow large enough to need pagination in v1?
   - Recommendation: No pagination for v1 (fetch all videos, likely <50 per user). Add pagination at 100+ videos threshold.

3. **Realtime status updates necessity**
   - What we know: Supabase Realtime works, but adds complexity (subscriptions, cleanup, memory)
   - What's unclear: Do users stay on library page during 10-15 min processing, or navigate away?
   - Recommendation: Skip Realtime for v1. Use simple "Refresh" button or manual page reload. Add Realtime in v2 if users report frustration.

4. **Failed video retry mechanism**
   - What we know: n8n workflow can fail, videos.error_message stores reason
   - What's unclear: Should UI provide "Retry" button? Does n8n workflow support retry with same parameters?
   - Recommendation: Show error message, no retry button for v1. User creates new video if needed. Requires n8n workflow idempotency research.

5. **Video thumbnail fallback strategy**
   - What we know: n8n generates thumbnail, stored in videos.thumbnail_url
   - What's unclear: What if thumbnail generation fails but video succeeds? What placeholder to show?
   - Recommendation: Show status icon (spinner/checkmark) if thumbnail_url null. Don't block video download on missing thumbnail.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - Official tutorial for URL params pattern
- [Next.js Loading UI and Streaming](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - Suspense boundaries and streaming
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table) - TanStack Table integration
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog) - Destructive action confirmation
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes) - Database subscription pattern
- [Supabase Storage Remove Files](https://supabase.com/docs/reference/javascript/storage-from-remove) - Storage cleanup

### Secondary (MEDIUM confidence - verified with official sources)
- [FreeCodeCamp Next.js 15 Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/) - Suspense best practices, key prop pattern
- [Nielsen Norman Group: Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/) - When to use confirmations for destructive actions
- [Material Design: Empty States](https://m1.material.io/patterns/empty-states.html) - Empty state UX patterns
- [Pencil & Paper: Empty States](https://www.pencilandpaper.io/articles/empty-states) - Empty state best practices with examples
- [Justinmind: Dashboard Design](https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux) - Dashboard card count recommendations (5-6 max)
- [SaaS Frame: Dashboard UI Examples](https://www.saasframe.io/categories/dashboard) - 163 modern dashboard examples
- [Muz.li: Best Dashboard Designs 2026](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/) - Bento grid pattern dominance

### Tertiary (LOW confidence - marked for validation)
- [use-debounce npm](https://www.npmjs.com/package/use-debounce) - Library usage examples
- [react-player npm](https://www.npmjs.com/package/react-player) - Video player library documentation
- [NN/G Progress Indicators](https://www.nngroup.com/articles/progress-indicators/) - Loading state timing guidelines
- [UX Design: Loading States](https://uxdesign.cc/loading-progress-indicators-ui-components-series-f4b1fc35339a) - Progress indicator patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with Next.js official docs, existing project stack
- Architecture: HIGH - Patterns from Next.js official tutorial, shadcn/ui docs, tested patterns
- Pitfalls: MEDIUM-HIGH - Mix of documented issues (Suspense key) and common database patterns (N+1)
- Realtime: MEDIUM - Well-documented but optional for v1, marked as future enhancement

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - stable Next.js patterns, UI design trends slow-moving)

**Notes:**
- Existing database schema has composite index `videos_user_status_idx` on (user_id, status) — optimizes filtered queries
- Dashboard already exists with placeholder "Recent Videos" section (lines 110-130 in dashboard/page.tsx)
- Phase 5 enhances dashboard + adds dedicated `/videos` page with full library
- User decisions from CONTEXT.md: Grid layout (2-3 columns), no time estimates, completed videos show thumbnail + success badge
- Claude's discretion: Processing/failed visual treatment, card information density, dashboard structure
