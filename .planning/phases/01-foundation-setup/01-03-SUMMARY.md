---
phase: 01-foundation-setup
plan: 03
subsystem: database
tags: [supabase, postgres, schema, rls, migrations, documentation]

dependency-graph:
  requires: [01-01]
  provides:
    - database-schema
    - rls-policies
    - credit-system
    - profile-automation
  affects: [01-04, 02-01]

tech-stack:
  added: []
  patterns:
    - Row-Level Security (RLS) for multi-tenant data isolation
    - SECURITY DEFINER functions for controlled privilege escalation
    - Audit trail pattern for credit transactions
    - Auto-creation trigger for user profiles

decisions:
  - id: D-01-03-001
    decision: Use SECURITY DEFINER functions for credit operations
    rationale: Ensures users can't bypass credit checks or manipulate balances directly
    alternatives: [Client-side credit checks, Server-only API endpoints]
  - id: D-01-03-002
    decision: Separate credit_transactions table for audit trail
    rationale: Immutable history of all credit movements, supports compliance and debugging
    alternatives: [Store in subscriptions table, Event sourcing pattern]
  - id: D-01-03-003
    decision: Store video metadata as JSONB
    rationale: Flexible schema for n8n workflow outputs, queryable when needed
    alternatives: [Separate metadata table, JSON string column]

key-files:
  created:
    - supabase/migrations/00001_initial_schema.sql
  modified:
    - CLAUDE.md

metrics:
  duration: 2m
  completed: 2026-01-26
---

# Phase 1 Plan 3: Database Schema & Documentation Summary

**One-liner:** Complete Postgres schema with RLS policies, credit management functions, and profile auto-creation.

## What Was Built

Created the foundational database schema with four core tables and comprehensive security policies:

### Tables Created
1. **profiles** - User profile data extending auth.users
   - Auto-created on signup via trigger
   - Links to auth.users with cascading delete

2. **subscriptions** - Credit-based subscription plans
   - Tracks plan type (starter/professional)
   - Current credit balance and total allocation
   - Stripe integration fields (customer_id, subscription_id)
   - Period tracking for credit renewal

3. **credit_transactions** - Audit trail for all credit movements
   - Immutable log of credit additions and deductions
   - Links to subscription and video
   - Supports multiple transaction types (subscription, purchase, usage, refund, bonus, expiry)

4. **videos** - Logo animation videos
   - Full video metadata (brand, status, URLs, quality)
   - Creative direction parameters (style, colors, direction)
   - n8n workflow integration (execution_id, metadata JSONB)
   - Processing status tracking

### Security Implementation
- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data via `auth.uid() = user_id` pattern
- Read-only policies on sensitive tables (subscriptions, credit_transactions)
- SECURITY DEFINER functions control privileged operations

### Automation & Helpers
- **handle_new_user()** - Auto-creates profile on user signup
- **check_credits()** - Validates user has sufficient credits
- **deduct_credits()** - Atomically deducts credits with transaction log
- **grant_credits()** - Adds credits with transaction log
- **handle_updated_at()** - Auto-updates timestamps on row changes

### Documentation
Updated CLAUDE.md with:
- Complete project structure with directory layout
- Development commands and workflows
- File naming conventions
- Supabase usage patterns (client vs server)
- Database schema reference
- External services configuration

## Decisions Made

**D-01-03-001: SECURITY DEFINER functions for credit operations**
- Users can query credits but can't modify directly
- All credit operations go through controlled functions
- Prevents manipulation of balances or transaction history

**D-01-03-002: Separate credit_transactions table**
- Immutable audit trail of all credit movements
- Supports debugging, refunds, and compliance
- Separate from subscriptions for clear separation of concerns

**D-01-03-003: JSONB for video metadata**
- Flexible schema for n8n workflow outputs
- Can evolve without migrations
- Still queryable when needed (Postgres JSONB operators)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Schema Design Patterns

**Credit System Architecture:**
- Subscriptions track current state (credits_remaining)
- Transactions provide immutable history
- Helper functions ensure atomicity (FOR UPDATE locks)
- No direct user writes to sensitive tables

**RLS Security Model:**
- Every table has `auth.uid() = user_id` check
- Subscriptions/credits are read-only for users
- Videos table has full CRUD for user's own records
- Server uses service role key to bypass RLS when needed

**Profile Auto-Creation:**
- Trigger on auth.users insert
- Copies email and metadata to profiles table
- Prevents orphan users (can't have auth without profile)

### Important Constraints

1. **credits_remaining >= 0** - Can't go negative
2. **status checks** - Only valid status values allowed
3. **stripe_subscription_id UNIQUE** - One subscription per Stripe sub
4. **Foreign key cascades** - Delete user → cascades to all their data

### Index Strategy

Indexes on:
- User lookups (user_id on all tables)
- Status filtering (subscriptions.status, videos.status)
- Time-ordered queries (created_at DESC on transactions and videos)
- Stripe lookups (stripe_customer_id)

## Files Changed

**Created:**
- `/supabase/migrations/00001_initial_schema.sql` (317 lines)
  - 4 tables with complete schema
  - 9 indexes for query performance
  - 11 RLS policies for security
  - 3 triggers for automation
  - 3 helper functions for credit management

**Modified:**
- `/CLAUDE.md` (81 lines added)
  - Project structure documentation
  - Development conventions
  - Database schema reference
  - External services guide

## Next Phase Readiness

**Ready to proceed with:**
- Phase 1 Plan 4 (Supabase configuration) - Schema ready to run
- Phase 2 (Auth) - Profile auto-creation is in place
- Phase 3 (Subscription) - Credit system fully designed

**Provides:**
- Complete data model for all core features
- Security policies enforcing data isolation
- Credit management system with audit trail
- Profile automation reducing manual work

**No blockers.**

## Task Execution Log

| Task | Description | Commit | Duration |
|------|-------------|--------|----------|
| 1 | Create database migration file | 18e7939 | ~1m |
| 2 | Update CLAUDE.md with conventions | d2bd764 | ~1m |

**Total Duration:** 2 minutes
**Success Criteria:** ✓ All met
