-- Enable Realtime for videos table
-- This allows clients to subscribe to real-time updates when videos change status

-- Add videos table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE videos;

-- Add comment explaining this migration
COMMENT ON TABLE public.videos IS 'Logo animation videos created by users. Realtime enabled for status updates.';
