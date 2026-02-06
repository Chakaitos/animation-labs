# Real-Time Video Status Updates - Implementation

This document describes the implementation of real-time video status updates using Supabase Realtime.

## Overview

Users can now see video status changes in real-time without manually refreshing the page. When a video completes processing, the status badge automatically updates from "Processing" to "Ready", and a toast notification appears.

## Architecture

### Components

1. **`hooks/useVideoSubscription.ts`**
   - Custom React hook that manages Supabase Realtime subscriptions
   - Subscribes to UPDATE, INSERT, and DELETE events on the `videos` table
   - Filters events to only show videos for the current user
   - Automatically handles connection lifecycle (subscribe/unsubscribe)
   - Returns updated videos list and connection status

2. **`components/videos/VideoGridRealtime.tsx`**
   - Client component wrapper around the video grid
   - Uses `useVideoSubscription` hook for real-time updates
   - Displays toast notifications when videos complete or fail
   - Shows reconnection indicator if connection drops while videos are processing
   - Tracks previous video states to detect status changes

3. **`supabase/migrations/00008_enable_realtime_videos.sql`**
   - Database migration to enable Realtime on the `videos` table
   - Adds `videos` table to the `supabase_realtime` publication

### Updated Pages

1. **`app/(protected)/dashboard/page.tsx`**
   - Now uses `VideoGridRealtime` instead of static `VideoCard` mapping
   - Passes user ID and initial videos to the realtime component

2. **`app/(protected)/videos/page.tsx`**
   - Updated `VideoList` component to use `VideoGridRealtime`
   - Maintains server-side filtering (search and status filters)
   - Real-time updates work with filtered results

## How It Works

### Flow Diagram

```
User Dashboard
     ↓
VideoGridRealtime (client component)
     ↓
useVideoSubscription hook
     ↓
Supabase Realtime WebSocket
     ↓
PostgreSQL NOTIFY (when n8n webhook updates video status)
     ↓
Supabase broadcasts change to subscribed clients
     ↓
Hook updates React state
     ↓
UI re-renders with new status + toast notification
```

### Key Features

1. **Real-time Updates**
   - When n8n webhook updates a video's status in the database, Supabase Realtime broadcasts the change
   - All connected clients receive the update within ~100ms
   - UI automatically re-renders with the new video data

2. **Toast Notifications**
   - Success toast when video completes: "Video Ready! [Brand Name] is ready to download."
   - Error toast when video fails: "Video Failed. [Brand Name] failed to process. [Error message]"
   - Uses Sonner toast library for beautiful, accessible notifications

3. **Connection Management**
   - Automatic reconnection if WebSocket connection drops
   - Shows yellow warning banner if disconnected while videos are processing
   - Cleanup on component unmount to prevent memory leaks

4. **Optimistic Behavior**
   - Initial videos are fetched server-side (fast SSR)
   - Realtime subscription starts immediately on mount
   - New videos are added to the top of the list
   - Deleted videos are removed from the list

## Database Setup

### Enable Realtime (One-time Setup)

Run the migration to enable Realtime on the `videos` table:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply manually in Supabase Dashboard → SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
```

### Verify Realtime is Enabled

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Verify `videos` table is in the publication list
3. Ensure Realtime is enabled for your project

## Environment Requirements

No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing

### Manual Testing

1. **Create a video**
   - Go to dashboard or /videos page
   - Create a new video
   - Verify it appears immediately with "Processing" status

2. **Wait for completion**
   - Do NOT refresh the page
   - Wait for n8n webhook to complete processing (10-15 minutes)
   - Verify status automatically updates to "Ready"
   - Verify toast notification appears

3. **Multiple tabs**
   - Open dashboard in two browser tabs
   - Create a video in one tab
   - Verify it appears in both tabs automatically
   - Verify status updates in both tabs when complete

4. **Network disconnect**
   - Open browser DevTools → Network
   - Throttle to "Offline"
   - Create a video (will fail to submit)
   - Switch back to "Online"
   - Verify reconnection indicator appears briefly
   - Verify updates resume

### Test with Mock Update (Development)

To test without waiting for n8n:

```sql
-- In Supabase SQL Editor, update a processing video to completed
UPDATE videos
SET status = 'completed',
    video_url = 'https://example.com/video.mp4',
    thumbnail_url = 'https://example.com/thumbnail.jpg'
WHERE status = 'processing'
  AND user_id = 'YOUR_USER_ID'
LIMIT 1;
```

You should see:
- Status badge changes from orange "Processing" to green "Ready"
- Toast notification appears: "Video Ready!"
- No page refresh needed

## Performance Considerations

### Connection Limits

**Supabase Free Tier:**
- 200 concurrent Realtime connections
- Sufficient for ~200 simultaneous users on dashboard/videos page

**Supabase Pro Tier:**
- 500 concurrent connections (scalable with add-ons)

### Optimization

1. **Per-user filtering**
   - Subscription filters by `user_id` at the database level
   - Only relevant updates are sent to each client

2. **Selective subscriptions**
   - Only subscribes on pages that display videos
   - Automatically unsubscribes when leaving the page

3. **Efficient updates**
   - Only sends changed video data, not full table
   - React re-renders only affected video cards

## Troubleshooting

### Updates Not Working

1. **Check Realtime is enabled:**
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
   Should show `videos` table.

2. **Check browser console** for WebSocket errors

3. **Verify RLS policies** allow user to read their videos:
   ```sql
   SELECT * FROM videos WHERE user_id = auth.uid();
   ```

### Connection Issues

- Yellow warning banner appears: Connection is attempting to reconnect (normal)
- Banner persists: Check Supabase project status and network
- No banner but no updates: Check browser console for errors

### Toast Not Appearing

- Verify `<Toaster />` is in `app/layout.tsx` (already added)
- Check browser console for errors
- Verify Sonner is installed: `npm list sonner`

## Future Enhancements

1. **Progress indicators** - If n8n sends progress updates (0-100%)
2. **Optimistic UI** - Show new videos immediately on creation (before DB insert completes)
3. **Sound notifications** - Optional audio alert on completion
4. **Desktop notifications** - Browser Notification API integration
5. **Batch updates** - Handle multiple videos completing simultaneously

## Code References

Key files:
- `/hooks/useVideoSubscription.ts` - Realtime subscription logic
- `/components/videos/VideoGridRealtime.tsx` - UI component with notifications
- `/app/(protected)/dashboard/page.tsx` - Dashboard implementation
- `/app/(protected)/videos/page.tsx` - Video library implementation
- `/supabase/migrations/00008_enable_realtime_videos.sql` - Database setup

## Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
