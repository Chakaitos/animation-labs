# n8n Workflow Setup Guide - Supabase Migration

This guide explains how to import and configure the updated n8n workflow that uses Supabase instead of Google Sheets.

---

## Prerequisites

Before importing the workflow, ensure you have:

- [ ] n8n VPS access
- [ ] Supabase project URL and Service Role Key
- [ ] N8N_WEBHOOK_SECRET configured
- [ ] OpenAI API credentials
- [ ] Kie AI API credentials
- [ ] Next.js app deployed and accessible

---

## Step 1: Configure Environment Variables on n8n VPS

SSH into your n8n VPS and add these environment variables:

```bash
# Edit your environment file (location depends on your n8n setup)
# Common locations: ~/.bashrc, ~/.profile, /etc/environment, or docker-compose.yml

export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
export N8N_WEBHOOK_SECRET="your-webhook-secret-here"
export NEXTJS_CALLBACK_URL="https://yourapp.com/api/webhooks/video-status"
```

**Important:** Use your **Service Role Key**, not the anon key! The service role key bypasses RLS.

After adding variables, restart n8n:
```bash
# If using systemd
sudo systemctl restart n8n

# If using docker
docker-compose restart n8n

# If using PM2
pm2 restart n8n
```

---

## Step 2: Configure Credentials in n8n UI

### A. Supabase Postgres Credential

1. In n8n UI, go to **Credentials** → **New**
2. Search for **Postgres**
3. Name: `Supabase Postgres`
4. Configure:
   - **Host:** Extract from `SUPABASE_URL` (e.g., `your-project.supabase.co`)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** Your Supabase database password
   - **Port:** `5432`
   - **SSL:** `allow`
   - **Service Role Key:** Use environment variable `{{$env.SUPABASE_SERVICE_ROLE_KEY}}`
5. **Test** connection
6. **Save**

**Alternative:** You can also use Supabase's REST API with HTTP Request nodes instead of Postgres nodes.

### B. Supabase Storage Auth Credential

1. Go to **Credentials** → **New**
2. Search for **Header Auth**
3. Name: `Supabase Storage Auth`
4. Configure:
   - **Name:** `Authorization`
   - **Value:** `Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
5. **Save**

### C. OpenAI API Credential

1. Go to **Credentials** → **New**
2. Search for **OpenAI**
3. Name: `OpenAi account`
4. Configure:
   - **API Key:** Your OpenAI API key
5. **Save**

### D. Kie AI Credentials

1. Go to **Credentials** → **New**
2. Search for **Header Auth**
3. Name: `Kie AI Credentials`
4. Configure:
   - **Name:** `Authorization` (or whatever header Kie AI requires)
   - **Value:** Your Kie AI API key/token
5. **Save**

---

## Step 3: Import the Workflow

1. In n8n UI, click **Workflows** → **Import**
2. Select the file: `n8n-workflows/Logo-Animator-Supabase.json`
3. Click **Import**

The workflow will be imported but **not activated** yet.

---

## Step 4: Update Credential IDs

After import, you need to link the credentials you created:

1. Open the imported workflow
2. For each node with credentials:
   - **Fetch Video from Supabase** → Select `Supabase Postgres`
   - **Update Status to Processing** → Select `Supabase Postgres`
   - **Update Status to Completed** → Select `Supabase Postgres`
   - **Update Status to Failed** → Select `Supabase Postgres`
   - **Upload to Supabase Storage** → Select `Supabase Storage Auth`
   - **Analyze Logo** → Select `OpenAi account`
   - **Logo Animator AI Agent** (GPT Model sub-node) → Select `OpenAi account`
   - **Create Veo3** → Select `Kie AI Credentials`
   - **Get Veo3 Status** → Select `Kie AI Credentials`

3. **Save** the workflow

---

## Step 5: Update Next.js Environment Variables

In your Next.js `.env.local` or production environment:

```env
# n8n Webhook Integration
N8N_WEBHOOK_URL=https://your-n8n-vps.com/webhook/video-processing
N8N_WEBHOOK_SECRET=your-webhook-secret-here
```

Make sure this matches the secret you set in n8n VPS environment variables!

---

## Step 6: Test the Workflow

### Option A: Test with Manual Trigger

1. In n8n workflow editor, click the **Webhook Trigger** node
2. Click **Listen for Test Event**
3. From your terminal or Postman, send a test request:

```bash
curl -X POST https://your-n8n-vps.com/webhook/video-processing \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret-here" \
  -d '{
    "video_id": "test-video-id-from-your-database"
  }'
```

4. Watch the execution in n8n UI
5. Verify each node executes successfully

### Option B: Test with Real Video Creation

1. **Activate** the workflow in n8n (toggle to **Active**)
2. In your Next.js app, go to `/create-video`
3. Upload a logo and submit the form
4. Monitor the workflow execution in n8n
5. Check Supabase to verify:
   - Video status changes: `pending` → `processing` → `completed`
   - Video file uploaded to Storage at `logos/{user_id}/{video_id}.mp4`
   - `video_url` populated with Supabase Storage URL

---

## Step 7: Verify End-to-End Flow

Check each step:

1. **✅ Next.js creates video record**
   ```sql
   SELECT * FROM videos ORDER BY created_at DESC LIMIT 1;
   ```
   Status should be `pending` initially, then `processing`

2. **✅ n8n receives webhook**
   - Check n8n execution log
   - Verify webhook secret validation passed

3. **✅ Video data fetched from Supabase**
   - Check "Fetch Video from Supabase" node output

4. **✅ Status updated to processing**
   ```sql
   SELECT status, n8n_execution_id FROM videos WHERE id = 'your-video-id';
   ```

5. **✅ Kie AI generates video**
   - Check "Create Veo3" and "Get Veo3 Status" node outputs

6. **✅ Video downloaded and uploaded to Supabase Storage**
   - Check Supabase Storage bucket `logos`
   - Verify file exists at `{user_id}/{video_id}.mp4`

7. **✅ Status updated to completed**
   ```sql
   SELECT status, video_url FROM videos WHERE id = 'your-video-id';
   ```

8. **✅ Next.js receives callback**
   - Check Next.js logs for webhook receipt

---

## Troubleshooting

### Webhook not triggering

**Problem:** n8n workflow doesn't start when video is created

**Solutions:**
- Check `N8N_WEBHOOK_URL` in Next.js env vars
- Verify n8n workflow is **Active**
- Test webhook manually with curl
- Check n8n logs for incoming requests

### Unauthorized error (401)

**Problem:** Webhook validation failing

**Solutions:**
- Verify `N8N_WEBHOOK_SECRET` matches in both Next.js and n8n
- Check `X-Webhook-Secret` header is being sent correctly
- Test with manual curl request

### Video not found (404)

**Problem:** Supabase query returns no results

**Solutions:**
- Verify `video_id` in webhook payload is correct
- Check Supabase connection credentials
- Test query manually in Supabase SQL editor:
  ```sql
  SELECT * FROM videos WHERE id = 'your-video-id';
  ```

### Supabase connection failed

**Problem:** Can't connect to Supabase database

**Solutions:**
- Verify Supabase credentials are correct
- Check **Service Role Key** is being used (not anon key)
- Test connection in n8n credentials page
- Verify Supabase project is not paused

### Storage upload failed

**Problem:** Video doesn't upload to Supabase Storage

**Solutions:**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify `logos` bucket exists in Supabase Storage
- Check bucket permissions allow service role uploads
- Verify storage URL format:
  ```
  https://your-project.supabase.co/storage/v1/object/logos/{user_id}/{video_id}.mp4
  ```

### Kie AI timeout

**Problem:** Video not ready after 60 second wait

**Solutions:**
- Increase wait time (change "Wait 60s" node to 90 or 120 seconds)
- Add loop logic to check multiple times
- Check Kie AI API status
- Verify Kie AI credentials are valid

### Callback to Next.js failed

**Problem:** Next.js doesn't receive completion notification

**Solutions:**
- Verify `NEXTJS_CALLBACK_URL` is correct
- Check Next.js `/api/webhooks/video-status` endpoint is accessible
- Verify `N8N_WEBHOOK_SECRET` header is correct
- Check Next.js logs for errors
- **Note:** Callback failure doesn't block video completion (it's fire-and-forget)

---

## Workflow Nodes Reference

Quick reference of all nodes and their purpose:

| Node Name | Type | Purpose |
|-----------|------|---------|
| Webhook Trigger | Webhook | Receives video_id from Next.js |
| Validate Webhook Secret | IF | Checks X-Webhook-Secret header |
| Unauthorized Response | Respond to Webhook | Returns 401 if secret invalid |
| Fetch Video from Supabase | Postgres | Queries videos table for video details |
| Check Video Exists | IF | Validates video was found |
| Video Not Found Response | Respond to Webhook | Returns 404 if video doesn't exist |
| Update Status to Processing | Postgres | Sets status='processing' |
| Map Video Data | Set | Transforms Supabase data to workflow format |
| Analyze Logo | OpenAI | Analyzes logo image for colors/style |
| Logo Animator AI Agent | AI Agent | Generates enhanced video prompt |
| Think | Tool | Reasoning tool for AI agent |
| GPT Model | Language Model | Powers the AI agent |
| Structured Output | Output Parser | Formats AI response as JSON |
| Create Veo3 | HTTP Request | Triggers Kie AI video generation |
| Wait 60s | Wait | Waits for video processing |
| Get Veo3 Status | HTTP Request | Checks if video is ready |
| Check Video Ready | Switch | Routes based on success/in-progress |
| Download Video from Kie AI | HTTP Request | Downloads video from Kie AI temp URL |
| Upload to Supabase Storage | HTTP Request | Uploads to logos/{user_id}/{video_id}.mp4 |
| Set Video URL | Set | Constructs permanent Supabase Storage URL |
| Update Status to Completed | Postgres | Sets status='completed', video_url |
| Callback Next.js | HTTP Request | Notifies Next.js of completion |
| Success Response | Respond to Webhook | Returns success to original webhook |
| Update Status to Failed | Postgres | Sets status='failed' on timeout |
| Callback Next.js (Failed) | HTTP Request | Notifies Next.js of failure |
| Failed Response | Respond to Webhook | Returns failure to original webhook |

---

## Key Differences from Google Sheets Version

### What Changed

1. **Trigger:** Still webhook, but now receives `video_id` from Next.js instead of polling Google Sheets
2. **Data source:** Supabase Postgres queries instead of Google Sheets reads
3. **Creative direction:** Now from Supabase `creative_direction` field instead of hardcoded
4. **Video storage:** Added download + upload to Supabase Storage
5. **Status updates:** Direct Supabase updates instead of Google Sheets writes
6. **Callback:** Added Next.js webhook notification

### What Stayed the Same

- AI agent prompt generation logic
- Kie AI integration (Create Veo3, Get Veo3)
- Logo analysis with OpenAI
- Wait/retry pattern for video processing

---

## Monitoring

### Check Workflow Executions

In n8n UI:
1. Go to **Executions**
2. Filter by workflow: "Logo Animator - Supabase"
3. Review successful and failed executions

### Check Database Status

In Supabase:
```sql
-- Recent videos
SELECT
  id,
  brand_name,
  status,
  created_at,
  updated_at,
  error_message
FROM videos
ORDER BY created_at DESC
LIMIT 10;

-- Failed videos
SELECT * FROM videos
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Videos stuck in processing
SELECT * FROM videos
WHERE status = 'processing'
  AND updated_at < NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

### Check Storage Files

In Supabase Storage UI:
1. Go to **Storage** → **logos** bucket
2. Browse by user_id folders
3. Verify video files are .mp4 and accessible

---

## Rollback Plan

If the migration has issues:

1. **Deactivate** the new Supabase workflow in n8n
2. **Reactivate** the old Google Sheets workflow
3. **Update** `N8N_WEBHOOK_URL` in Next.js to point to old workflow
4. **Investigate** issues in n8n execution logs
5. **Fix** and retry migration

---

## Success Checklist

Before going live:

- [ ] All credentials configured in n8n
- [ ] Environment variables set on n8n VPS
- [ ] Workflow imported and credentials linked
- [ ] Test video created successfully end-to-end
- [ ] Video file uploaded to Supabase Storage
- [ ] Database status updates correctly (pending → processing → completed)
- [ ] Next.js receives callback notification
- [ ] Credits deducted properly
- [ ] Error handling tested (invalid video_id, timeout, etc.)
- [ ] Old Google Sheets workflow deactivated
- [ ] Monitoring set up (n8n executions + Supabase queries)

---

## Support

If you encounter issues:

1. Check n8n execution logs for errors
2. Verify environment variables are set correctly
3. Test each node individually in n8n editor
4. Review Supabase logs for database/storage errors
5. Check Next.js logs for webhook receipt

For Supabase-specific issues, see: https://supabase.com/docs
For n8n-specific issues, see: https://docs.n8n.io
