# n8n Google Sheets to Supabase Migration Design

**Date:** 2026-01-30
**Status:** Approved
**Purpose:** Migrate n8n video processing workflow from Google Sheets to direct Supabase integration

---

## Architecture Overview

Replace Google Sheets with direct integration between Next.js app and n8n using Supabase as the central data store.

**Flow:**
1. User submits video request
2. Next.js API route validates credits
3. Inserts video row to Supabase (status: 'pending')
4. Calls n8n webhook with `video_id`
5. n8n processes via Kie AI
6. n8n downloads video and uploads to Supabase Storage
7. n8n updates Supabase directly (status: 'completed', video_url)
8. n8n calls Next.js callback API for post-processing

**Benefits:**
- Immediate writes: n8n updates database directly for fast status updates
- Application logic: Next.js API handles side effects (notifications, analytics)
- Single source of truth: All video data in Supabase, no sync issues
- Existing schema: `videos` table already has all required fields

---

## Data Flow & n8n Workflow Steps

### 1. User Creates Video (Next.js API Route)
- Validates user has credits via `check_credits(user_id, 1)`
- Validates file (type, size) before upload
- Inserts video record: `{user_id, brand_name, logo_url, status: 'pending'}`
- Deducts credit via `deduct_credits(user_id, video_id, 1)`
- Calls n8n webhook: `POST {N8N_WEBHOOK_URL}` with payload `{video_id}` and auth header

### 2. n8n Processes Video
- **Trigger node**: Webhook receives `{video_id}`
- **Auth validation**: Check Authorization header matches `N8N_WEBHOOK_SECRET`
- **Fetch video data**: Supabase node queries `SELECT * FROM videos WHERE id={{$json.video_id}}`
- **Update status**: Supabase node `UPDATE videos SET status='processing' WHERE id=video_id`
- **Gather video details**: Code node analyzes video metadata (brand_name, style, creative_direction)
- **Generate enhanced prompt**: Creates optimized prompt for Kie AI using gathered details
- **Call Kie AI**: HTTP Request sends enhanced prompt + logo_url to Kie AI API
- **Download video**: HTTP Request downloads from Kie AI temporary URL
- **Upload to Storage**: Supabase Storage node uploads to `logos/{user_id}/{video_id}.mp4`
- **Update completion**: Supabase node `UPDATE videos SET status='completed', video_url={supabase_url}, updated_at=now() WHERE id=video_id`
- **Callback**: HTTP Request `POST /api/videos/{video_id}/complete`

### 3. n8n Stores Video Permanently
- Downloads video file from Kie AI temporary URL
- Uploads to Supabase Storage: `logos/{user_id}/{video_id}.mp4` (existing bucket)
- Gets permanent public URL from Supabase Storage
- Updates database with permanent URL

### 4. n8n Notifies App
- Calls Next.js callback: `POST /api/videos/[video_id]/complete` with `{video_url, status}`
- API triggers emails, analytics, UI notifications

---

## Error Handling & Retry Logic

### Database-level Failures
- Retry with exponential backoff (3 attempts) for Supabase insert/update failures
- Store error in `videos.error_message` field
- Set `videos.status = 'failed'` for UI visibility
- Consider refunding credit via `grant_credits()` if processing never started

### Kie AI Failures
- Timeout: 60-90 seconds for Kie AI API call
- Validate Kie AI returns video URL before proceeding
- Handle 429 rate limits with retry-after delays
- On failure: `UPDATE videos SET status='failed', error_message={kie_ai_error}`

### Storage Upload Failures
- Retry upload 2-3 times if download succeeds but upload fails
- Keep Kie AI URL temporarily in `metadata.kie_ai_temp_url` as backup
- Set max file size limit (50MB) to prevent storage abuse

### Webhook Failures
- If Next.js callback fails, log error but don't block (video already saved)
- Make callback fire-and-forget (don't wait for response)

### n8n Execution Tracking
- Store n8n execution ID in `videos.n8n_execution_id` for debugging
- Add workflow logs to `videos.metadata.processing_log`

---

## Security & Authentication

### Supabase Service Role Key in n8n
- Store `SUPABASE_SERVICE_ROLE_KEY` as environment variable in n8n VPS
- Use service role (not anon key) to bypass RLS when updating videos
- Never expose service key to frontend

### n8n Webhook Authentication
- Protect n8n webhook URL with secret token
- Next.js includes: `Authorization: Bearer {N8N_WEBHOOK_SECRET}`
- n8n validates token before processing
- Store `N8N_WEBHOOK_SECRET` in both `.env.local` and n8n environment

### Next.js Callback API Authentication
- n8n calls `/api/videos/[id]/complete` with same secret
- API validates `Authorization` header matches `N8N_WEBHOOK_SECRET`

### Supabase Storage Security
- `logos` bucket: service role uploads only
- Public read access for video URLs
- RLS policies ensure users only see their own videos
- File paths include `user_id` to prevent cross-user access

### Data Validation
- **App-level**: File type/size validation before sending to n8n
- **n8n-level**: Validate `video_id` exists in database before processing

---

## Implementation Components

### 1. Next.js API Route: `/app/api/videos/create/route.ts`
```typescript
// Validates user authentication via Supabase Auth
// Checks credits: await supabase.rpc('check_credits', {p_user_id: user.id, p_required: 1})
// Inserts video record with logo_url (already uploaded and validated)
// Deducts credit: await supabase.rpc('deduct_credits', {p_user_id, p_video_id, p_credits: 1})
// Triggers n8n: POST {N8N_WEBHOOK_URL} with {video_id} and auth header
// Returns {video_id, status: 'pending'} to frontend
```

### 2. Next.js API Route: `/app/api/videos/[id]/complete/route.ts`
```typescript
// Validates N8N_WEBHOOK_SECRET in Authorization header
// Receives {video_url, status} from n8n
// Post-processing: email notification, analytics, UI cache update
// Returns {success: true}
// Optional: Trigger real-time update via Supabase Realtime
```

### 3. n8n Workflow (VPS-hosted)
- Uses n8n-mcp-skills for configuration and validation
- Replaces Google Sheets nodes with Supabase nodes
- See workflow steps in "Data Flow" section above

### 4. Environment Variables

**.env.local (Next.js):**
```env
N8N_WEBHOOK_URL=https://your-n8n-vps.com/webhook/video-processing
N8N_WEBHOOK_SECRET=your-secret-token
```

**n8n VPS environment:**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
N8N_WEBHOOK_SECRET=your-secret-token
NEXTJS_CALLBACK_URL=https://yourapp.com/api/videos
```

---

## Testing & Deployment Strategy

### Development Testing (Production Supabase)
- Use production Supabase instance for testing
- Create test user account and subscription with credits
- Configure VPS-hosted n8n with production credentials
- Test with real Kie AI API (or mock initially)
- Test storage uploads to production `logos` bucket

### Integration Testing Steps
1. Create test user with credits in production DB
2. Test `/api/videos/create` API route with test logo upload
3. Verify n8n VPS receives webhook and fetches from Supabase
4. Test prompt generation with video metadata
5. Test Kie AI integration
6. Verify storage upload to `logos/{user_id}/{video_id}.mp4`
7. Confirm DB updates through all status transitions
8. Test callback to `/api/videos/[id]/complete`
9. Test error scenarios (failed Kie AI, storage failures, missing credits)

### Pre-Launch
- [ ] Complete end-to-end testing with test accounts
- [ ] Verify all test videos process successfully
- [ ] **Reset production data**: Delete test videos, credit transactions, user accounts
- [ ] Keep DB schema (migrations intact)
- [ ] Clear `logos` bucket test files
- [ ] Verify n8n webhook URLs are correct

### Post-Launch Monitoring
- Monitor first real user video creations
- Watch n8n VPS execution logs
- Track failed videos: `SELECT * FROM videos WHERE status='failed'`
- Monitor n8n execution times and success rates
- Verify credit deductions match completed videos
- Set up error alerting (email/Slack for failures)

---

## Database Schema (Existing)

The `videos` table already has all required fields:
- `id`: Primary key (uuid)
- `user_id`: Foreign key to auth.users
- `brand_name`: Text
- `status`: 'pending' | 'processing' | 'completed' | 'failed'
- `logo_url`: Text (uploaded before API call)
- `video_url`: Text (set by n8n after processing)
- `error_message`: Text (set on failure)
- `n8n_execution_id`: Text (for debugging)
- `metadata`: JSONB (for processing logs, Kie AI temp URLs)
- `created_at`, `updated_at`: Timestamps

No schema changes required.

---

## Migration Checklist

- [ ] Create Next.js API route: `/api/videos/create/route.ts`
- [ ] Create Next.js API route: `/api/videos/[id]/complete/route.ts`
- [ ] Update n8n workflow (use n8n-mcp-skills):
  - [ ] Remove Google Sheets nodes
  - [ ] Add Supabase nodes (fetch, update status, update completion)
  - [ ] Add Supabase Storage upload node
  - [ ] Update prompt generation node with DB metadata
  - [ ] Add auth validation to webhook trigger
  - [ ] Add callback HTTP request to Next.js
- [ ] Add environment variables to Next.js (.env.local)
- [ ] Add environment variables to n8n VPS
- [ ] Configure Supabase Storage policies for `logos` bucket
- [ ] Test end-to-end with test account
- [ ] Reset production data before launch
- [ ] Monitor first real videos

---

## Success Criteria

- Videos successfully created without Google Sheets dependency
- Status updates visible in real-time in Supabase
- Videos permanently stored in Supabase Storage
- Error handling catches and logs all failure scenarios
- Credits properly deducted for each video
- n8n execution logs show successful processing
