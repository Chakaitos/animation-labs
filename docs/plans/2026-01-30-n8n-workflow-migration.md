# n8n Workflow Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the `n8n-mcp-skills` when implementing this plan.

**Goal:** Migrate existing n8n video processing workflow from Google Sheets to direct Supabase integration

**Architecture:** Replace Google Sheets read/write nodes with Supabase database queries and Supabase Storage uploads. Workflow receives video_id from Next.js, fetches details from Supabase, processes via Kie AI, uploads to Storage, and updates database.

**Tech Stack:** n8n, Supabase (PostgreSQL + Storage), Kie AI API

---

## Prerequisites

Before starting, ensure you have:
- [ ] n8n instance access (VPS-hosted)
- [ ] Supabase credentials ready:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] N8N_WEBHOOK_SECRET configured in both n8n and Next.js
- [ ] NEXTJS_CALLBACK_URL for status updates
- [ ] Current workflow backup exported

---

## Task 1: Backup Current Workflow

**Files:**
- Export: `n8n-workflows/video-processing-google-sheets-backup.json`

**Step 1: Export current workflow**

In n8n UI:
1. Open the current video processing workflow
2. Click **⋯** menu → **Download**
3. Save as `video-processing-google-sheets-backup.json`
4. Store in safe location

**Step 2: Document current node structure**

Review and note:
- Webhook trigger URL (will stay the same)
- Google Sheets operations (read/write)
- Kie AI integration nodes
- Any error handling nodes

**Step 3: Commit backup**

```bash
# If storing in repo
git add n8n-workflows/video-processing-google-sheets-backup.json
git commit -m "backup: export n8n workflow before Supabase migration"
```

---

## Task 2: Configure Supabase Credentials in n8n

**Environment Variables Required:**

Add to n8n VPS environment:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role key (not anon key!)
N8N_WEBHOOK_SECRET=your-secret-token
NEXTJS_CALLBACK_URL=https://yourapp.com/api/webhooks/video-status
```

**Step 1: Add credentials to n8n**

In n8n UI:
1. Go to **Credentials** → **New**
2. Select **Supabase API**
3. Enter:
   - Name: `AnimateLabs Supabase (Service Role)`
   - Host: `https://your-project.supabase.co`
   - Service Role Secret: `{{$env.SUPABASE_SERVICE_ROLE_KEY}}`
4. Click **Save**
5. Test connection

**Step 2: Verify environment variables**

Run on n8n VPS:
```bash
echo $SUPABASE_URL
echo $N8N_WEBHOOK_SECRET
echo $NEXTJS_CALLBACK_URL
# Service role key should be set but don't echo it
```

Expected: All variables display correctly

---

## Task 3: Update Webhook Trigger Node

**Workflow Node:** Webhook Trigger (first node)

**Step 1: Verify webhook trigger settings**

Current settings should be:
- **HTTP Method:** POST
- **Path:** `/webhook/video-processing` (or similar)
- **Response Mode:** "When Last Node Finishes"

**Step 2: Add webhook secret validation**

Use **n8n-mcp-skills:n8n-node-configuration** to add authentication:

Add **IF** node immediately after webhook trigger:
- **Condition:** `{{ $('Webhook').first().json.headers['x-webhook-secret'] }}` equals `{{ $env.N8N_WEBHOOK_SECRET }}`
- **True branch:** Continue workflow
- **False branch:** Return error response

**Step 3: Validate payload structure**

Webhook receives from Next.js:
```json
{
  "video_id": "uuid",
  "brand_name": "string",
  "quality": "standard" | "premium",
  "aspect_ratio": "landscape" | "portrait",
  "duration": 4 | 6 | 8,
  "style_preset": { /* config object */ },
  "creative_direction": "string or null",
  "dialogue": "string",
  "logo_url": "https://..."
}
```

Add **Code** node to validate:
```javascript
// Validate required fields
const required = ['video_id', 'logo_url', 'brand_name'];
const missing = required.filter(field => !$input.first().json[field]);

if (missing.length > 0) {
  throw new Error(`Missing required fields: ${missing.join(', ')}`);
}

return $input.all();
```

**Step 4: Test webhook**

Run test:
```bash
curl -X POST https://your-n8n-vps.com/webhook/video-processing \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{"video_id":"test-123","logo_url":"https://test.com/logo.png","brand_name":"TestBrand"}'
```

Expected: Webhook triggers, passes validation

---

## Task 4: Replace Google Sheets Read with Supabase Query

**Remove:** Google Sheets "Get Row" node
**Add:** Supabase "Get Rows" node

**Step 1: Add Supabase query node**

Use **n8n-mcp-skills:n8n-node-configuration**:

Add **Supabase** node after webhook validation:
- **Credential:** AnimateLabs Supabase (Service Role)
- **Operation:** Get Rows
- **Table:** `videos`
- **Return All:** No
- **Limit:** 1
- **Filters:**
  - Field: `id`
  - Operator: `eq`
  - Value: `{{ $json.video_id }}`

**Step 2: Add error handling for missing video**

Add **IF** node after Supabase query:
- **Condition:** `{{ $json.length > 0 }}`
- **False branch:** Return error "Video not found"
- **True branch:** Continue workflow

**Step 3: Map Supabase data to workflow variables**

Add **Set** node to normalize data:
```javascript
return {
  video_id: $json[0].id,
  user_id: $json[0].user_id,
  brand_name: $json[0].brand_name,
  logo_url: $json[0].logo_url,
  quality: $json[0].quality,
  aspect_ratio: $json[0].aspect_ratio,
  duration: $json[0].duration_seconds,
  style: $json[0].style,
  creative_direction: $json[0].creative_direction,
  dialogue: $json[0].dialogue
};
```

**Step 4: Remove Google Sheets node**

Delete the old Google Sheets "Get Row" node

**Step 5: Test query**

Execute workflow with test video_id from database
Expected: Successfully fetches video data

---

## Task 5: Update Status to 'processing'

**Add:** Supabase "Update Rows" node before Kie AI processing

**Step 1: Add Supabase update node**

Add **Supabase** node:
- **Operation:** Update Rows
- **Table:** `videos`
- **Filters:**
  - Field: `id`
  - Operator: `eq`
  - Value: `{{ $json.video_id }}`
- **Update Fields:**
  - `status`: `processing`
  - `n8n_execution_id`: `{{ $execution.id }}`
  - `updated_at`: `{{ $now.toISO() }}`

**Step 2: Test status update**

Execute workflow
Verify in Supabase:
```sql
SELECT id, status, n8n_execution_id FROM videos WHERE id = 'test-video-id';
```

Expected: status='processing', n8n_execution_id populated

---

## Task 6: Update Prompt Generation Node

**Modify:** Existing prompt generation Code node

**Step 1: Update prompt node to use Supabase data**

Use **n8n-mcp-skills:n8n-code-javascript**:

Update Code node that generates Kie AI prompt:
```javascript
// Access video data from Supabase query
const videoData = $('Supabase - Fetch Video').first().json;

// Build enhanced prompt
const prompt = `Create a professional logo animation for ${videoData.brand_name}.

Style: ${videoData.style}
Duration: ${videoData.duration} seconds
Aspect Ratio: ${videoData.aspect_ratio === 'landscape' ? '16:9' : '9:16'}
Quality: ${videoData.quality}

${videoData.creative_direction ? `Creative Direction: ${videoData.creative_direction}` : ''}

${videoData.dialogue !== 'no voiceover' ? `Voiceover: ${videoData.dialogue}` : 'No voiceover'}

Generate a smooth, engaging animation that showcases the brand identity.`;

return {
  json: {
    prompt,
    video_id: videoData.video_id,
    logo_url: videoData.logo_url,
    user_id: videoData.user_id
  }
};
```

**Step 2: Test prompt generation**

Execute node with test data
Expected: Prompt includes all video metadata from Supabase

---

## Task 7: Add Supabase Storage Upload for Completed Video

**Add:** Supabase Storage upload node after Kie AI returns video

**Step 1: Add HTTP Request to download Kie AI video**

Add **HTTP Request** node after Kie AI completion:
- **Method:** GET
- **URL:** `{{ $json.kie_ai_video_url }}`  (adjust based on Kie AI response structure)
- **Response Format:** File
- **Download File:** Yes

**Step 2: Add Supabase Storage upload node**

Use **n8n-mcp-skills:n8n-node-configuration**:

Add **Supabase** node (or use HTTP Request for Storage API):
- **Method:** POST
- **URL:** `{{ $env.SUPABASE_URL }}/storage/v1/object/logos/{{ $json.user_id }}/{{ $json.video_id }}.mp4`
- **Authentication:** Bearer Token
- **Token:** `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
- **Headers:**
  - `Content-Type`: `video/mp4`
  - `x-upsert`: `false`
- **Body (Binary):** Video file from previous node

**Alternative using Supabase Storage API directly:**

Add **HTTP Request** node:
```javascript
// Using Supabase Storage REST API
const formData = new FormData();
formData.append('file', $binary.data);

return {
  method: 'POST',
  url: `${process.env.SUPABASE_URL}/storage/v1/object/logos/${$json.user_id}/${$json.video_id}.mp4`,
  headers: {
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'x-upsert': 'false'
  },
  body: formData
};
```

**Step 3: Get permanent video URL**

Add **Set** node after upload:
```javascript
const videoPath = `${$json.user_id}/${$json.video_id}.mp4`;
const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/logos/${videoPath}`;

return {
  json: {
    ...$json,
    video_url: publicUrl,
    storage_path: videoPath
  }
};
```

**Step 4: Test storage upload**

Execute with test video file
Verify in Supabase Storage bucket `logos`:
- File exists at `{user_id}/{video_id}.mp4`
- Public URL is accessible

---

## Task 8: Replace Google Sheets Write with Supabase Update

**Remove:** Google Sheets "Update Row" node
**Add:** Supabase "Update Rows" node

**Step 1: Add Supabase completion update node**

Add **Supabase** node:
- **Operation:** Update Rows
- **Table:** `videos`
- **Filters:**
  - Field: `id`
  - Operator: `eq`
  - Value: `{{ $json.video_id }}`
- **Update Fields:**
  - `status`: `completed`
  - `video_url`: `{{ $json.video_url }}`
  - `updated_at`: `{{ $now.toISO() }}`

**Step 2: Add error handling branch**

Create separate error path for failed Kie AI processing:

Add **Supabase** node (error branch):
- **Operation:** Update Rows
- **Table:** `videos`
- **Filters:**
  - Field: `id`
  - Operator: `eq`
  - Value: `{{ $json.video_id }}`
- **Update Fields:**
  - `status`: `failed`
  - `error_message`: `{{ $json.error }}`
  - `updated_at`: `{{ $now.toISO() }}`

**Step 3: Remove Google Sheets node**

Delete the old Google Sheets "Update Row" node

**Step 4: Test both success and failure paths**

Test success: Execute with valid video
Test failure: Trigger error path
Verify database updates correctly in both cases

---

## Task 9: Add Next.js Callback Webhook

**Add:** HTTP Request node to notify Next.js API

**Step 1: Add callback HTTP Request node**

Add **HTTP Request** node after Supabase update:
- **Method:** POST
- **URL:** `{{ $env.NEXTJS_CALLBACK_URL }}`
- **Authentication:** None (uses header)
- **Headers:**
  - `Content-Type`: `application/json`
  - `X-Webhook-Secret`: `{{ $env.N8N_WEBHOOK_SECRET }}`
- **Body:**
```json
{
  "videoId": "{{ $json.video_id }}",
  "status": "completed",
  "videoUrl": "{{ $json.video_url }}",
  "n8nExecutionId": "{{ $execution.id }}"
}
```

**Step 2: Add error callback (optional)**

Add another HTTP Request for failure notification:
```json
{
  "videoId": "{{ $json.video_id }}",
  "status": "failed",
  "errorMessage": "{{ $json.error }}",
  "n8nExecutionId": "{{ $execution.id }}"
}
```

**Step 3: Make callback fire-and-forget**

Add **Error Trigger** node around callback:
- On callback failure: Log error but continue workflow
- Don't block on callback response

**Step 4: Test callback**

Execute workflow
Verify Next.js receives webhook at `/api/webhooks/video-status`
Check Next.js logs for successful processing

---

## Task 10: End-to-End Testing

**Test the complete migration flow**

**Step 1: Create test video in Next.js app**

1. Login to app
2. Go to `/create-video`
3. Upload test logo
4. Fill form and submit
5. Verify credits deducted

**Step 2: Monitor n8n execution**

In n8n UI:
1. Watch execution log in real-time
2. Verify each node executes successfully
3. Check for any errors

**Step 3: Verify database updates**

Query Supabase:
```sql
SELECT
  id,
  status,
  video_url,
  n8n_execution_id,
  error_message,
  created_at,
  updated_at
FROM videos
ORDER BY created_at DESC
LIMIT 1;
```

Expected:
- status: `completed`
- video_url: Supabase Storage URL
- n8n_execution_id: populated

**Step 4: Verify video file in Storage**

Check Supabase Storage bucket `logos`:
- File exists at `{user_id}/{video_id}.mp4`
- File is accessible via public URL
- File plays correctly

**Step 5: Verify callback received**

Check Next.js logs for webhook receipt
Verify no errors in callback processing

**Step 6: Test error scenarios**

Test cases:
1. Invalid video_id → should return error
2. Missing logo_url → should fail gracefully
3. Kie AI timeout → should mark video as failed
4. Storage upload failure → should retry and log error

**Step 7: Monitor credits**

Verify:
```sql
SELECT * FROM credit_transactions
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC;
```

Expected: Credit deducted correctly

---

## Task 11: Cleanup and Documentation

**Step 1: Export updated workflow**

In n8n UI:
1. Export workflow as `video-processing-supabase.json`
2. Store in version control

```bash
git add n8n-workflows/video-processing-supabase.json
git commit -m "feat: migrate n8n workflow to Supabase

- Replace Google Sheets nodes with Supabase queries
- Add Supabase Storage upload for videos
- Add Next.js webhook callback
- Update error handling for all failure scenarios

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 2: Document workflow nodes**

Create `n8n-workflows/README.md`:
```markdown
# n8n Video Processing Workflow

## Nodes Overview

1. **Webhook Trigger** - Receives video_id from Next.js
2. **Validate Secret** - Checks X-Webhook-Secret header
3. **Fetch Video** - Queries Supabase for video details
4. **Update Processing** - Sets status='processing'
5. **Generate Prompt** - Creates enhanced Kie AI prompt
6. **Call Kie AI** - Triggers video generation
7. **Download Video** - Gets video from Kie AI temp URL
8. **Upload to Storage** - Saves to Supabase Storage
9. **Update Completed** - Sets status='completed', video_url
10. **Callback Next.js** - Notifies app of completion

## Environment Variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `N8N_WEBHOOK_SECRET`
- `NEXTJS_CALLBACK_URL`

## Testing

Use test webhook:
\`\`\`bash
curl -X POST https://n8n-vps.com/webhook/video-processing \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Secret: $N8N_WEBHOOK_SECRET" \\
  -d '{"video_id":"test-uuid"}'
\`\`\`
```

**Step 3: Update migration design doc**

Update `docs/plans/2026-01-30-n8n-supabase-migration-design.md`:
- [x] Migration completed
- [x] All tests passing
- [x] Documentation updated

**Step 4: Deactivate old Google Sheets workflow**

1. Rename old workflow to `[DEPRECATED] Video Processing - Google Sheets`
2. Set to inactive
3. Keep for reference but don't delete yet

---

## Success Criteria

- [ ] Video creation flow works end-to-end without Google Sheets
- [ ] Videos upload to Supabase Storage at `logos/{user_id}/{video_id}.mp4`
- [ ] Database updates correctly through all status transitions
- [ ] Credits deduct properly
- [ ] Error handling catches all failure scenarios
- [ ] Next.js callback receives completion notifications
- [ ] n8n execution logs show no errors
- [ ] Old Google Sheets workflow deprecated

---

## Rollback Plan (If Needed)

If migration fails:
1. Reactivate old Google Sheets workflow
2. Restore from `video-processing-google-sheets-backup.json`
3. Update `N8N_WEBHOOK_URL` in Next.js to point to old workflow
4. Investigate issues before retrying migration
