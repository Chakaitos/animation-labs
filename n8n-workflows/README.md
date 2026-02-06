# n8n Workflows

This directory contains n8n workflow JSON files for Animation Labs video processing.

---

## Files

- **`Logo-Animator-Supabase.json`** - Production workflow using Supabase integration
- **`SETUP-GUIDE.md`** - Comprehensive setup and deployment instructions

---

## Quick Start

### 1. Prerequisites
- n8n VPS with environment variables configured
- Supabase credentials (Service Role Key)
- OpenAI API key
- Kie AI API credentials

### 2. Import Workflow
1. Open n8n UI
2. Go to **Workflows** → **Import**
3. Select `Logo-Animator-Supabase.json`
4. Configure credentials (see SETUP-GUIDE.md)

### 3. Activate
1. Link all credentials in the workflow
2. Test with a sample video
3. Activate the workflow

---

## Workflow Overview

**Purpose:** Process logo animation video requests from Next.js app using Kie AI

**Trigger:** Webhook from Next.js (`POST /webhook/video-processing`)

**Flow:**
```
Next.js → n8n Webhook → Fetch from Supabase → Update Status →
AI Prompt Generation → Kie AI → Download Video →
Upload to Supabase Storage → Update Completed → Callback Next.js
```

**Key Features:**
- ✅ Webhook secret validation
- ✅ Supabase database integration
- ✅ Supabase Storage for permanent video hosting
- ✅ AI-powered prompt generation
- ✅ Error handling and retry logic
- ✅ Next.js callback notifications
- ✅ Comprehensive status tracking

---

## Environment Variables Required

On n8n VPS:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
N8N_WEBHOOK_SECRET=your-webhook-secret
NEXTJS_CALLBACK_URL=https://yourapp.com/api/webhooks/video-status
```

---

## Credentials Needed in n8n

1. **Supabase Postgres** - Database connection
2. **Supabase Storage Auth** - Header auth for Storage API
3. **OpenAI** - GPT-4 for logo analysis and prompt generation
4. **Kie AI** - Video generation API

---

## Testing

### Manual Test

```bash
curl -X POST https://your-n8n-vps.com/webhook/video-processing \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{"video_id": "test-uuid-from-database"}'
```

### End-to-End Test

1. Create video via Next.js app (`/create-video`)
2. Monitor n8n execution
3. Verify in Supabase:
   - Video status updates
   - Video file in Storage
   - Credits deducted

---

## Monitoring

### n8n UI
- Check **Executions** tab for workflow runs
- Review failed executions for errors

### Supabase
```sql
-- Recent videos
SELECT id, brand_name, status, created_at, video_url
FROM videos
ORDER BY created_at DESC
LIMIT 10;

-- Failed videos
SELECT * FROM videos WHERE status = 'failed';
```

---

## Troubleshooting

See **SETUP-GUIDE.md** for detailed troubleshooting steps.

Common issues:
- Webhook not triggering → Check `N8N_WEBHOOK_URL` in Next.js
- Unauthorized (401) → Verify `N8N_WEBHOOK_SECRET` matches
- Video not found (404) → Check video exists in database
- Storage upload failed → Verify Service Role Key and bucket permissions

---

## Migration from Google Sheets

**Old workflow:** Polled Google Sheets for `status="for production"` → processed → updated sheet

**New workflow:** Webhook triggered by Next.js → fetches from Supabase → processes → updates database

**Benefits:**
- ✅ No polling overhead
- ✅ Instant triggering
- ✅ Better error handling
- ✅ Permanent video storage in Supabase
- ✅ Single source of truth (no sync issues)
- ✅ Better security (Service Role Key vs OAuth)

---

## Architecture Diagram

```
┌─────────────┐
│  Next.js    │
│  /create-   │
│   video     │
└──────┬──────┘
       │ 1. Upload logo
       │ 2. Create video record (Supabase)
       │ 3. Deduct credits
       │ 4. POST webhook with video_id
       ↓
┌─────────────────────────────────────────┐
│           n8n Workflow                   │
├─────────────────────────────────────────┤
│ 1. Validate webhook secret              │
│ 2. Fetch video from Supabase            │
│ 3. Update status → processing           │
│ 4. Analyze logo (OpenAI)                │
│ 5. Generate prompt (AI Agent)           │
│ 6. Create video (Kie AI)                │
│ 7. Wait + check status                  │
│ 8. Download video from Kie AI           │
│ 9. Upload to Supabase Storage           │
│ 10. Update status → completed           │
│ 11. POST callback to Next.js            │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────┐
│  Supabase   │
│  - Videos   │
│  - Storage  │
└─────────────┘
```

---

## Next Steps After Import

1. ✅ Configure all credentials in n8n
2. ✅ Test with sample video
3. ✅ Activate workflow
4. ✅ Update `N8N_WEBHOOK_URL` in Next.js
5. ✅ Run end-to-end test
6. ✅ Monitor first few production videos
7. ✅ Deactivate old Google Sheets workflow

---

## Support

- **Setup issues:** See `SETUP-GUIDE.md`
- **n8n docs:** https://docs.n8n.io
- **Supabase docs:** https://supabase.com/docs
- **Kie AI docs:** (Kie AI documentation URL)

---

## Version History

- **v1.0 (2026-01-30)** - Initial Supabase migration
  - Replaced Google Sheets with Supabase
  - Added Supabase Storage upload
  - Added webhook authentication
  - Added Next.js callbacks
  - Added comprehensive error handling
