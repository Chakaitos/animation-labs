# Credit Balance Error Debugging

## Current Issue
Getting `Error fetching credits: {}` on /dashboard

## Diagnostic Steps

### 1. Check Console Output
With the improved error logging, restart your dev server and check the terminal/console for:
```
Error fetching credits: {
  error: ...,
  errorType: ...,
  errorKeys: [...],
  code: ...,
  message: ...,
  details: ...,
  hint: ...
}
```

### 2. Check Your Database

Run these queries in Supabase SQL Editor:

```sql
-- Check if you have a subscription
SELECT id, user_id, plan, status, credits_remaining, overage_credits
FROM subscriptions
WHERE user_id = auth.uid();

-- Check your profile role
SELECT id, email, role
FROM profiles
WHERE id = auth.uid();

-- List all RLS policies on subscriptions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'subscriptions';
```

### 3. Check if Admin Migration Was Applied

Look for these policies in the output above:
- "Admins can view all subscriptions"
- "Admins can view all profiles"
- "Admins can view all videos"

If you see these, the admin migration (00012) was already applied.

### 4. Potential Fixes

#### If you DON'T have a subscription:
The error might be expected. The query uses `.single()` which expects exactly one row.
Try creating a test subscription.

#### If the admin policies exist and are causing issues:
We might need to modify them. The subquery in the policy could be causing problems.

#### If you get a specific error code/message:
Share the full error output and we can fix it specifically.

## Quick Test

Try this in your Supabase SQL Editor:
```sql
-- Test if you can query subscriptions directly
SELECT credits_remaining, overage_credits, status
FROM subscriptions
WHERE user_id = auth.uid();
```

If this returns an error, it's an RLS policy issue.
If it returns empty, you don't have a subscription.
If it returns data, the issue is elsewhere in the code.
