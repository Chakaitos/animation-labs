# Email & Profile Requirements

## Profile Records

All email personalization in Animation Labs depends on the `profiles` table having a record for each user.

### Automatic Profile Creation

Profiles are automatically created via the `handle_new_user()` trigger when a user signs up:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

The trigger extracts data from `auth.users.raw_user_meta_data`:
- `email` - User's email address
- `full_name` - Full name (if provided during signup)
- `first_name` - First name for email personalization
- `last_name` - Last name (optional)

### Missing Profiles

**Causes:**
1. User created before migration `00006_add_first_name.sql` was applied
2. Trigger failed or was disabled during user creation
3. Manual user creation via Supabase dashboard without trigger

**Symptoms:**
- Email sending fails with: `"User profile not found"`
- Logs show: `"The result contains 0 rows"` from profiles query

### Fallback Behavior

Email functions (`sendVideoReadyEmail`, `sendPaymentFailedEmail`) automatically fall back to `auth.users` when profile missing:

1. Attempts to fetch from `profiles` table
2. If fails, fetches email from `auth.admin.getUserById()`
3. Sends email without personalization (`firstName: undefined`)
4. Logs include `fallback: true` flag for monitoring

**Example log:**
```json
{
  "emailType": "video-ready",
  "userId": "8117cb68-3de7-4835-a2d4-c14b0155aab0",
  "brandName": "MyBrand",
  "emailId": "re_abc123",
  "fallback": true
}
```

### Backfilling Missing Profiles

Run migration `00007_backfill_missing_profiles.sql` to create profiles for existing users:

```bash
# Local development (Supabase CLI)
npx supabase db reset

# Production (Supabase dashboard)
# Go to SQL Editor → Run migration 00007
```

The migration:
- Finds `auth.users` without corresponding `profiles` records
- Creates profiles with email and metadata
- Logs count of profiles created

### Preventing Missing Profiles

1. **Never disable triggers** - Ensure `on_auth_user_created` is always active
2. **Test signup flow** - Verify profile creation after every migration
3. **Monitor logs** - Watch for `fallback: true` in email sending logs
4. **Run backfill** - Execute migration 00007 after any migration affecting auth

### Email Templates Without Personalization

When `firstName` is `undefined`, email templates use generic greetings:

- VideoReadyEmail: `"Hi there"` instead of `"Hi {firstName}"`
- PaymentFailedEmail: `"Hello"` instead of `"Hi {firstName}"`
- WelcomeEmail: `"Welcome"` instead of `"Welcome {firstName}"`

This ensures emails send successfully even when profiles are missing.

## Testing Profile Creation

**Check if profile was created:**
```sql
SELECT id, email, first_name, last_name
FROM public.profiles
WHERE id = 'user-uuid-here';
```

**Check for missing profiles:**
```sql
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
```

**Manual profile creation:**
```sql
INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name'
FROM auth.users
WHERE id = 'user-uuid-here';
```
