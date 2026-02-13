import { createClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/user-table'
import { UserSearchBar } from '@/components/admin/user-search-bar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const USERS_PER_PAGE = 20

interface UsersPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

export default async function UsersPage(props: UsersPageProps) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const search = searchParams.search || ''
  const currentPage = parseInt(searchParams.page || '1')
  const offset = (currentPage - 1) * USERS_PER_PAGE

  // Build query
  let query = supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      role,
      subscription:subscriptions!user_id(
        plan,
        status,
        credits_remaining
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + USERS_PER_PAGE - 1)

  // Apply search filter if provided
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data: users, count, error } = await query

  // Log error for debugging
  if (error) {
    console.error('Error fetching users:', error)
  }

  // Get active subscription for each user (Supabase returns array, we want the active one)
  const usersWithSubscription = users?.map((user: any) => ({
    ...user,
    subscription: Array.isArray(user.subscription)
      ? user.subscription.find((s: any) => s.status === 'active') || null
      : user.subscription,
  })) || []

  const totalPages = Math.ceil((count || 0) / USERS_PER_PAGE)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts and subscriptions
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <UserSearchBar />
        {search && (
          <p className="text-sm text-muted-foreground mt-2">
            Searching for: "{search}" - Found {count || 0} users
          </p>
        )}
        {!search && count !== null && (
          <p className="text-sm text-muted-foreground mt-2">
            Total users: {count || 0}
          </p>
        )}
      </div>

      {/* Users Table */}
      <UserTable users={usersWithSubscription} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + USERS_PER_PAGE, count || 0)} of{' '}
            {count || 0} users
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link
                  href={`/admin/users?${new URLSearchParams({
                    ...(search && { search }),
                    page: String(currentPage - 1),
                  })}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link
                  href={`/admin/users?${new URLSearchParams({
                    ...(search && { search }),
                    page: String(currentPage + 1),
                  })}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
