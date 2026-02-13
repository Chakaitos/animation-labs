# Admin Panel Setup Guide

The admin panel has been successfully implemented! Follow these steps to set it up in your environment.

## 1. Apply Database Migration

The migration adds the role system and admin functions to your database:

```bash
# Push the new migration to Supabase
npx supabase db push

# Or if you prefer to apply it remotely
npx supabase db remote commit
```

## 2. Grant Admin Access to Your Account

After the migration is applied, grant yourself admin privileges:

```bash
# Option 1: Using Supabase CLI
npx supabase db remote --sql "UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';"

# Option 2: Via Supabase Dashboard
# Navigate to: Database > Table Editor > profiles
# Find your profile row and set role = 'admin'
```

**Important:** Replace `your-email@example.com` with your actual email address.

## 3. Install Required Dependencies

The admin panel uses recharts for the subscription breakdown chart:

```bash
npm install recharts date-fns
```

## 4. Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in with your admin account

3. You should now see an "Admin Panel" link in the header navigation

4. Click it to access the admin dashboard at `/admin/dashboard`

## Admin Panel Features

### Dashboard (`/admin/dashboard`)
- Total users and active subscriptions
- Estimated MRR/ARR
- Videos created and processing queue
- Failed videos in last 24h
- Recent activity feed

### Users (`/admin/users`)
- Paginated user list (20 per page)
- Search by email or name
- View user details, subscriptions, and activity
- Manual credit adjustments with audit logging

### Videos (`/admin/videos`)
- Monitor all video production
- Filter by status (all/processing/failed/completed)
- View error messages for failed videos
- 50 videos per page

### Revenue (`/admin/billing`)
- MRR/ARR calculations
- Subscription breakdown (Starter vs Professional)
- Credit pack revenue (last 30 days)
- ARPU and retention metrics

## Security Features

✅ Database-backed roles (not hardcoded)
✅ Server-side route protection
✅ Row-Level Security (RLS) policies
✅ Admin verification in server actions
✅ Audit logging for credit adjustments
✅ Multiple security layers (route + RLS + RPC)

## Manual Credit Adjustments

Admins can add or deduct credits from user accounts:

1. Navigate to a user's detail page
2. Click "Add Credits" or "Deduct Credits"
3. Enter the amount and provide a reason (required)
4. The adjustment is logged with your admin email for audit trail

**Limits:**
- Minimum reason length: 10 characters
- Maximum adjustment: ±1000 credits per operation

## Troubleshooting

### "Admin Panel" link not showing
- Verify your role is set to 'admin' in the profiles table
- Clear your browser cache and reload
- Check browser console for errors

### Migration fails
- Ensure you're connected to the correct Supabase project
- Check if the role column already exists
- Review migration SQL for syntax errors

### RLS policies not working
- Verify the admin role is set correctly
- Check Supabase logs for RLS policy errors
- Ensure you're using the server client for admin queries

### Credit adjustment fails
- User must have an active subscription
- Check credit amount is within ±1000 range
- Verify reason is at least 10 characters
- Review Supabase function logs for errors

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Send email when credits are adjusted
   - Notify admins of failed videos

2. **Advanced Analytics**
   - Time-series revenue charts
   - Cohort analysis
   - Churn prediction

3. **Bulk Operations**
   - Bulk credit adjustments
   - Export user data to CSV
   - Batch video retry

4. **Role-Based Permissions**
   - Add 'support' role with limited access
   - Create granular permission system
   - Audit log viewer for compliance

5. **Video Management**
   - Retry failed videos from admin panel
   - Delete videos
   - Re-process videos with different settings

## Support

For issues or questions:
- Check the Supabase dashboard logs
- Review browser console errors
- Examine server logs in your deployment platform
- Consult the implementation plan in this repo

---

**Migration File:** `supabase/migrations/00012_add_admin_role.sql`
**Implementation Date:** 2026-02-12
