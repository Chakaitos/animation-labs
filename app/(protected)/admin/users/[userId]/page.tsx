import { createClient } from '@/lib/supabase/server'
import { UserProfileCard } from '@/components/admin/user-profile-card'
import { UserSubscriptionCard } from '@/components/admin/user-subscription-card'
import { UserVideosCard } from '@/components/admin/user-videos-card'
import { CreditHistoryCard } from '@/components/admin/credit-history-card'
import { CreditAdjustmentButton } from '@/components/admin/credit-adjustment-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface UserDetailPageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function UserDetailPage(props: UserDetailPageProps) {
  const params = await props.params
  const supabase = await createClient()

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, email, full_name, first_name, role, created_at')
    .eq('id', params.userId)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Fetch user's active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', params.userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch recent videos (last 10)
  const { data: videos } = await supabase
    .from('videos')
    .select('id, brand_name, status, created_at, credits_used')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch credit transaction history (last 20)
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('id, amount, type, description, created_at')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{user.full_name || user.email}</h1>
        <p className="text-muted-foreground mt-2">User details and activity</p>
      </div>

      {/* User Profile & Subscription */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfileCard user={user} />
        <UserSubscriptionCard subscription={subscription} />
      </div>

      {/* Credit Adjustment Buttons */}
      <div className="flex gap-3">
        <CreditAdjustmentButton userId={params.userId} type="add" />
        {subscription && (
          <CreditAdjustmentButton userId={params.userId} type="deduct" />
        )}
      </div>
      {!subscription && (
        <p className="text-sm text-muted-foreground">
          💡 This user has no subscription. Adding credits will automatically create a trial subscription.
        </p>
      )}

      {/* Recent Videos */}
      <UserVideosCard videos={videos || []} />

      {/* Credit History */}
      <CreditHistoryCard transactions={transactions || []} />
    </div>
  )
}
