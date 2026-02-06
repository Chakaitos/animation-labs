# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Animation Labs — Professional logo animation SaaS delivering videos in 10-15 minutes at $3-5 per video.

**Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase, Stripe, n8n, Resend

## Required Skills

Use these skills at the appropriate times:

| Skill | When to Use |
|-------|-------------|
| `frontend-design` | When building ANY UI components, pages, or visual elements |
| `llm-application-dev:prompt-engineer` | When generating/optimizing prompts for n8n workflows |
| `backend-development:api-design-principles` | When designing ANY API endpoints or routes |
| `n8n-mcp-skills:*` | When fixing, troubleshooting, or updating n8n workflows |

## Project Structure

```
animationlabs/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles + Tailwind
│   └── (routes)/          # Route groups (to be added)
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts      # Browser client (use in 'use client')
│   │   └── server.ts      # Server client (use in Server Components)
│   └── utils.ts           # shadcn/ui utilities (cn function)
├── supabase/              # Database
│   └── migrations/        # SQL migrations
├── proxy.ts               # Auth token refresh (Next.js 16 convention)
├── .env.example           # Env var template (committed)
└── .env.local             # Local secrets (gitignored)
```

## Branding Assets

**Logo:** `/public/logo.svg` (transparent SVG, 127KB)
- Use in navigation, marketing pages, and any branded UI elements
- Access in components: `/logo.svg` (Next.js serves from public root)
- Example: `<Image src="/logo.svg" alt="Animation Labs" width={150} height={40} />`

## Commands

```bash
# Development
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# shadcn/ui
npx shadcn@latest add [component]  # Add component

# Type checking
npx tsc --noEmit     # Check types without emitting
```

## Conventions

### File Naming
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Routes: kebab-case folders (`app/create-video/page.tsx`)

### Supabase Usage
- **Client Components:** Import from `@/lib/supabase/client`
- **Server Components:** Import from `@/lib/supabase/server` (async)
- **Never** mix client types — causes hydration errors

### Database
- All tables have RLS enabled
- User data access: `auth.uid() = user_id` pattern
- Credit operations: Use `deduct_credits()` and `grant_credits()` functions
- Schema changes: Add to `supabase/migrations/` (versioned)

### Components
- Use shadcn/ui components from `@/components/ui/`
- Custom components go in `@/components/`
- Prefer Server Components; use `'use client'` only when needed

### Environment Variables
- `NEXT_PUBLIC_*`: Safe for client (browser accessible)
- Without prefix: Server-only (never exposed)
- Add new vars to both `.env.example` and `.env.local`

## Database Schema

### Tables
- `profiles`: User profile (auto-created on signup)
- `subscriptions`: Credit-based plans, Stripe integration
- `credit_transactions`: Audit trail for credits
- `videos`: Logo animation videos

### Key Functions
- `check_credits(user_id, required)`: Check if user has enough credits
- `deduct_credits(user_id, video_id, credits)`: Deduct credits for video
- `grant_credits(user_id, subscription_id, credits)`: Add credits

## External Services

| Service | Purpose | Env Vars |
|---------|---------|----------|
| Supabase | DB, Auth, Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Stripe | Payments | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| n8n | Video workflow | `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` |
| Resend | Email | `RESEND_API_KEY` |
