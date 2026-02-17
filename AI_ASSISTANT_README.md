# AI Creative Direction Assistant - V2 Implementation

## Overview

The V2 Creative Direction AI Assistant is an interactive AI-powered feature that guides users through crafting professional creative briefs for their logo animations. It uses a structured 4-question conversation with multiple-choice options and generates a polished creative direction similar to industry-standard briefs.

## Features

✅ **4-Question Structured Conversation** - Systematically gathers all 6 creative elements (atmosphere, lighting, effects, texture, camera, sound)
✅ **Multiple Choice Options** - Each question includes 4-5 predefined options plus "Other - custom input"
✅ **Clarifying Questions** - Users can ask for clarification without advancing the conversation
✅ **Streaming Responses** - Real-time AI responses for better UX
✅ **Rate Limiting** - 5 conversations per user per hour via Upstash Redis
✅ **Cost Optimized** - ~$0.01 per conversation using Claude Haiku + Sonnet
✅ **Guardrails** - Input validation, off-topic detection, prompt injection prevention

## Architecture

```
┌─────────────────────┐
│   StyleStep.tsx     │
│  (Trigger Button)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ CreativeDirectionAIDialog.tsx   │
│  - Manages conversation state   │
│  - Renders option buttons       │
│  - Handles streaming            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ /api/ai/creative-direction      │
│  - Authenticates user           │
│  - Validates input              │
│  - Rate limits                  │
│  - Calls Anthropic API          │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Anthropic Claude API          │
│  - Haiku 4 (Q1-Q4)             │
│  - Sonnet 4 (Final generation)  │
└─────────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk @upstash/redis
```

### 2. Set up Upstash Redis

1. Go to https://console.upstash.com
2. Create account (free tier is sufficient)
3. Create new Redis database:
   - Name: `animationlabs-ai-ratelimit`
   - Region: Select closest to your Vercel deployment (e.g., us-east-1)
   - Type: Regional (free tier)
4. Copy credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Set up Anthropic API

1. Go to https://console.anthropic.com
2. Create API key
3. Add billing (pay-as-you-go, ~$20 starting balance recommended)
4. Copy `ANTHROPIC_API_KEY`

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Optional Configuration
AI_ASSISTANT_ENABLED=true
AI_RATE_LIMIT_MAX_REQUESTS=5
```

Add to **Vercel Environment Variables** (Production):
- Same variables as above
- Ensure all are added to Production, Preview, and Development environments

### 5. Verify Setup

```bash
# Check TypeScript types
npx tsc --noEmit

# Run development server
npm run dev

# Test the feature:
# 1. Navigate to /create-video
# 2. Fill in brand name and logo
# 3. Go to Style step (Step 3)
# 4. Click "AI Assistant" button
# 5. Complete the conversation
```

## Usage

### User Flow

1. **Trigger**: User clicks "AI Assistant" button in Creative Direction field
2. **Question 1** (Atmosphere + Lighting):
   - AI presents 5 options (A-E)
   - User selects option or types custom response
3. **Question 2** (Effects + Texture):
   - AI presents 5 options (A-E)
   - User selects option or types custom response
4. **Question 3** (Camera + Sound):
   - AI presents 5 options (A-E)
   - User selects option or types custom response
5. **Question 4** (Clarification):
   - AI asks dynamic clarification question based on previous answers
   - May include options or request open-ended details
6. **Generation** (Automatic):
   - AI generates formatted creative direction
   - User reviews and clicks "Use This Creative Direction"
   - Form field is populated with generated text

### Clarifying Questions

Users can ask clarifying questions at any time:
- **Example**: "What do you mean by atmospheric?"
- **AI Response**: Brief explanation (1-2 sentences) + re-ask original question with options
- **Does not count** against the 4 main questions
- **Limit**: Max 2 clarifications per main question

## Cost Breakdown

### Per Conversation

- **Questions 1-4** (Claude Haiku 4):
  - ~400 tokens input (cached system prompt: 50% discount)
  - ~100 tokens output per question
  - Cost: ~$0.002 per conversation for Q1-Q4

- **Final Generation** (Claude Sonnet 4):
  - ~800 tokens input (cached system prompt: 50% discount)
  - ~400 tokens output
  - Cost: ~$0.008 per generation

**Total per conversation**: ~$0.01

### Monthly Projections

- 100 active users, 20% adoption: **$0.60/month**
- 500 active users, 30% adoption: **$4.50/month**
- 1000 active users, 40% adoption: **$18.00/month**

### ROI

If AI assistant improves conversion by even 1%, revenue gain is $60-100 per 1000 users. **ROI is 5-10x** even at high adoption rates.

## Guardrails

### Input Validation

- ✅ Length limits: 500 characters max per answer
- ✅ Minimum length: 2 characters (allows "A", "B", "C", "D", "E")
- ✅ Off-topic keyword detection (politics, personal advice, etc.)
- ✅ Prompt injection pattern detection

### Turn Limiting

- ✅ Soft limit: 4 main questions + 1 generation = 5 base turns
- ✅ Allow 2-3 additional clarifying exchanges
- ✅ Maximum total: 8 turns (prevents endless loops)
- ✅ Force completion after maximum turns

### Rate Limiting

- ✅ 5 conversations per user per hour
- ✅ Implemented via Upstash Redis (distributed, production-ready)
- ✅ Returns 429 status when exceeded
- ✅ Shows remaining attempts via headers

### Off-Topic Handling

- ✅ Detects off-topic input (politics, personal questions, etc.)
- ✅ AI responds: "I appreciate the question, but let's focus on your logo animation."
- ✅ Re-asks current question with options
- ✅ Counts as clarification, not new question

## Files Created

### Core Implementation

```
lib/validations/ai-schema.ts          # Zod schemas for API validation
lib/ai/prompts/creative-direction-system.ts  # System prompts & question templates
lib/ai/streaming.ts                   # Stream handling utilities
lib/ai/rate-limiter.ts                # Upstash Redis rate limiting
lib/ai/providers/anthropic.ts         # Claude SDK integration
lib/ai/validation.ts                  # Input validation & guardrails
app/api/ai/creative-direction/route.ts  # API endpoint
app/create-video/_components/CreativeDirectionAIDialog.tsx  # Dialog UI
```

### Modified Files

```
app/create-video/_components/StyleStep.tsx  # Added AI button & dialog
lib/env.ts                            # Added Anthropic & Upstash env vars
.env.example                          # Documented new env vars
```

## Monitoring & Metrics

### Track via Analytics

- AI conversations started
- AI conversations completed (reached phase 5)
- AI conversations abandoned (closed before completion)
- Average conversation duration
- Generated directions accepted vs. manually edited

### Monitor via Logs

- Error rates by type
- Rate limit hits
- Off-topic detection triggers
- Average cost per conversation

### Cost Monitoring

1. **Anthropic Dashboard**: https://console.anthropic.com/usage
   - View token usage, costs, request counts
   - Set up billing alerts

2. **Upstash Dashboard**: https://console.upstash.com
   - Monitor Redis usage (should stay in free tier)
   - View request patterns

## Troubleshooting

### TypeScript Errors

```bash
# Regenerate types
npx tsc --noEmit

# Common issues:
# - Missing shadcn components: npx shadcn@latest add scroll-area
# - Missing dependencies: npm install @anthropic-ai/sdk @upstash/redis
```

### API Errors

**401 Unauthorized**
- Check Supabase authentication
- Verify user is logged in

**429 Rate Limit Exceeded**
- User has exceeded 5 conversations per hour
- Check Upstash Redis connection
- Verify rate limiter configuration

**500 Internal Server Error**
- Check Anthropic API key is valid
- Verify Upstash Redis credentials
- Check server logs for detailed error

### Environment Variables

**Missing variables error on startup**
- Ensure all required env vars are in `.env.local`
- Run `npm run dev` to see validation errors
- Check `lib/env.ts` for required variables

### Streaming Issues

**Response not streaming**
- Ensure API route has `export const runtime = 'edge'`
- Check browser console for fetch errors
- Verify Anthropic API is responding

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables added to Vercel
- [ ] TypeScript build passing (`npx tsc --noEmit`)
- [ ] Upstash Redis database created
- [ ] Anthropic API key created and funded
- [ ] Rate limiting tested locally

### Post-Deployment

- [ ] Test end-to-end conversation in production
- [ ] Verify streaming works on Vercel edge functions
- [ ] Test rate limiting (make 6 requests, verify 6th is blocked)
- [ ] Check Upstash dashboard for rate limit entries
- [ ] Monitor error rates for first 24 hours
- [ ] Monitor costs in Anthropic dashboard

## Rollback Plan

If issues arise:

1. Set `AI_ASSISTANT_ENABLED=false` in Vercel environment variables
2. Deploy change (takes ~30 seconds)
3. AI Assistant button will be hidden
4. Users can still use manual textarea and existing example component
5. No data loss or breaking changes

## Support

- **Anthropic Documentation**: https://docs.anthropic.com
- **Upstash Documentation**: https://docs.upstash.com/redis
- **Internal Issues**: Check `/Users/chakaitos/AnimateLabs/AI_ASSISTANT_README.md`
