-- Remove color extraction columns from videos table
-- Phase 04 Plan 05: Color extraction removed - n8n/veo3 will determine colors

alter table public.videos
  drop column if exists primary_color,
  drop column if exists secondary_color;

comment on table public.videos is 'Logo animation videos created by users. Colors determined by n8n/veo3 workflow.';
