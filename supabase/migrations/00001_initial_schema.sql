-- Animation Labs Initial Schema
-- Created: Phase 1 - Foundation & Setup
--
-- This migration creates the core tables for Animation Labs:
-- - profiles: User profile data (extends auth.users)
-- - subscriptions: Credit-based subscription plans
-- - credit_transactions: Audit trail for credit usage
-- - videos: Generated logo animation videos
--
-- All tables have Row-Level Security (RLS) enabled.
-- Users can only access their own data.

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with application-specific fields

create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  primary key (id)
);

comment on table public.profiles is 'User profile information extending auth.users';

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Tracks user subscriptions and credit balances

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  plan text not null check (plan in ('starter', 'professional')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due', 'expired')),
  credits_remaining int not null default 0 check (credits_remaining >= 0),
  credits_total int not null check (credits_total >= 0),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.subscriptions is 'User subscription plans with credit tracking';
comment on column public.subscriptions.plan is 'Subscription tier: starter or professional';
comment on column public.subscriptions.credits_remaining is 'Credits available in current period';
comment on column public.subscriptions.credits_total is 'Total credits allocated for this period';

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================
-- Audit trail for all credit movements

create table public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  subscription_id uuid references public.subscriptions on delete set null,
  video_id uuid, -- Will reference videos table after it's created
  amount int not null, -- positive = credit added, negative = credit used
  type text not null check (type in ('subscription', 'purchase', 'usage', 'refund', 'bonus', 'expiry')),
  description text,
  created_at timestamptz default now() not null
);

comment on table public.credit_transactions is 'Audit log of all credit additions and deductions';
comment on column public.credit_transactions.amount is 'Positive for credits added, negative for credits used';
comment on column public.credit_transactions.type is 'Transaction type: subscription (monthly grant), purchase (credit pack), usage (video created), refund, bonus, expiry';

-- ============================================
-- VIDEOS TABLE
-- ============================================
-- Generated logo animation videos

create table public.videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  brand_name text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  logo_url text,
  video_url text,
  thumbnail_url text,
  credits_used int not null default 1 check (credits_used >= 0),
  duration_seconds int check (duration_seconds > 0),
  quality text check (quality in ('720p', '1080p', '4k')),
  style text,
  primary_color text,
  secondary_color text,
  creative_direction text,
  error_message text,
  n8n_execution_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.videos is 'Logo animation videos created by users';
comment on column public.videos.status is 'Video processing status: pending (queued), processing (in n8n), completed, failed';
comment on column public.videos.metadata is 'Additional metadata from n8n workflow (JSON)';

-- Add foreign key from credit_transactions to videos
alter table public.credit_transactions
  add constraint credit_transactions_video_id_fkey
  foreign key (video_id) references public.videos(id) on delete set null;

-- ============================================
-- INDEXES
-- ============================================

create index profiles_email_idx on public.profiles(email);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);
create index credit_transactions_user_id_idx on public.credit_transactions(user_id);
create index credit_transactions_created_at_idx on public.credit_transactions(created_at desc);
create index videos_user_id_idx on public.videos(user_id);
create index videos_status_idx on public.videos(status);
create index videos_created_at_idx on public.videos(created_at desc);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.videos enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Subscriptions policies (read-only for users - writes via server/webhook)
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Credit transactions policies (read-only for users - writes via server)
create policy "Users can view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Videos policies
create policy "Users can view own videos"
  on public.videos for select
  using (auth.uid() = user_id);

create policy "Users can insert own videos"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own videos"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "Users can delete own videos"
  on public.videos for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-populate profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger videos_updated_at
  before update on public.videos
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has sufficient credits
create or replace function public.check_credits(p_user_id uuid, p_required int default 1)
returns boolean
language plpgsql
security definer
as $$
declare
  v_credits_remaining int;
begin
  select credits_remaining into v_credits_remaining
  from public.subscriptions
  where user_id = p_user_id
    and status = 'active'
    and (current_period_end is null or current_period_end > now())
  order by created_at desc
  limit 1;

  return coalesce(v_credits_remaining, 0) >= p_required;
end;
$$;

-- Deduct credits (used by server when creating video)
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_video_id uuid,
  p_credits int default 1,
  p_description text default 'Video creation'
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_subscription_id uuid;
  v_credits_remaining int;
begin
  -- Get active subscription with sufficient credits
  select id, credits_remaining into v_subscription_id, v_credits_remaining
  from public.subscriptions
  where user_id = p_user_id
    and status = 'active'
    and (current_period_end is null or current_period_end > now())
    and credits_remaining >= p_credits
  order by created_at desc
  limit 1
  for update; -- Lock the row

  if v_subscription_id is null then
    return false;
  end if;

  -- Deduct credits
  update public.subscriptions
  set credits_remaining = credits_remaining - p_credits
  where id = v_subscription_id;

  -- Record transaction
  insert into public.credit_transactions (user_id, subscription_id, video_id, amount, type, description)
  values (p_user_id, v_subscription_id, p_video_id, -p_credits, 'usage', p_description);

  return true;
end;
$$;

-- Grant credits (used by server when subscription renews)
create or replace function public.grant_credits(
  p_user_id uuid,
  p_subscription_id uuid,
  p_credits int,
  p_type text default 'subscription',
  p_description text default 'Subscription credits'
)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Update subscription credits
  update public.subscriptions
  set credits_remaining = credits_remaining + p_credits,
      credits_total = credits_total + p_credits
  where id = p_subscription_id
    and user_id = p_user_id;

  if not found then
    return false;
  end if;

  -- Record transaction
  insert into public.credit_transactions (user_id, subscription_id, amount, type, description)
  values (p_user_id, p_subscription_id, p_credits, p_type, p_description);

  return true;
end;
$$;
