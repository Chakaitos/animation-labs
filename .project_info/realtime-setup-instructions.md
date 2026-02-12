# Real-Time Video Status Updates - Setup Instructions

## What Was Implemented

Real-time video status updates using Supabase Realtime. Users now see video status changes instantly without refreshing the page.

## Immediate Action Required

### 1. Apply Database Migration

The migration to enable Realtime on the videos table needs to be applied:

**Option A: If using Supabase CLI (recommended)**
```bash
supabase db push
```

**Option B: Manual SQL in Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
```

### 2. Verify Setup

1. Go to Supabase Dashboard → Database → Replication
2. Verify `videos` table appears in the publication list
3. Ensure Realtime is enabled for your project (Settings → API)

### 3. Test the Feature

1. Start the development server: `npm run dev`
2. Navigate to the dashboard
3. Create a new video
4. **Do not refresh the page**
5. In a separate tab, manually update the video status in Supabase Dashboard:
   ```sql
   UPDATE videos
   SET status = 'completed',
       video_url = 'https://example.com/test.mp4'
   WHERE status = 'processing'
   ORDER BY created_at DESC
   LIMIT 1;
   ```
6. Watch the dashboard - the status should update automatically and a toast notification should appear

## What Changed

### New Files
- `hooks/useVideoSubscription.ts` - Custom hook for Realtime subscriptions
- `components/videos/VideoGridRealtime.tsx` - Client component with real-time updates
- `supabase/migrations/00008_enable_realtime_videos.sql` - Database migration
- `REALTIME_IMPLEMENTATION.md` - Full implementation documentation

### Modified Files
- `app/(protected)/dashboard/page.tsx` - Now uses VideoGridRealtime
- `app/(protected)/videos/page.tsx` - Now uses VideoGridRealtime

### Dependencies Added
- `sonner` - Toast notification library (via shadcn/ui)

## How It Works

1. User opens dashboard or videos page
2. `VideoGridRealtime` component mounts
3. `useVideoSubscription` hook creates a WebSocket connection to Supabase
4. When n8n webhook updates a video status in the database:
   - PostgreSQL triggers a NOTIFY event
   - Supabase broadcasts the change via WebSocket
   - Hook receives the update and updates React state
   - UI re-renders with new status
   - Toast notification appears

## Expected Behavior

- **Video completes:** Status badge changes to green "Ready", toast: "Video Ready!"
- **Video fails:** Status badge changes to red "Failed", toast: "Video Failed" with error message
- **New video created:** Appears at the top of the list immediately
- **Video deleted:** Removed from the list immediately
- **Multiple tabs open:** All tabs receive updates simultaneously

## Troubleshooting

### "Updates not appearing"
- Check Realtime is enabled (step 1 above)
- Check browser console for WebSocket errors
- Verify videos table is in replication publication

### "Toast notifications not appearing"
- Already set up - `<Toaster />` is in `app/layout.tsx`
- Check browser console for errors

### "Yellow warning banner persists"
- Check Supabase project status
- Check network connectivity
- Verify Realtime is enabled in project settings

## Performance Notes

- Free tier: 200 concurrent connections (sufficient for ~200 simultaneous users)
- Pro tier: 500+ concurrent connections
- Subscriptions are filtered by user_id for efficiency
- Automatic reconnection on connection drop

## Next Steps

After verifying the migration is applied and testing works:

1. Deploy to production
2. Monitor Realtime connection usage in Supabase Dashboard
3. Consider future enhancements (progress bars, optimistic UI, desktop notifications)

For full details, see `REALTIME_IMPLEMENTATION.md`
