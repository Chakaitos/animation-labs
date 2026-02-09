import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminRevisionRequests } from '@/lib/actions/revision'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevisionRequestCard } from '@/components/admin/RevisionRequestCard'
import { Badge } from '@/components/ui/badge'

export default async function AdminRevisionRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch all requests
  const result = await getAdminRevisionRequests()

  if (result.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">Failed to load revision requests</p>
      </div>
    )
  }

  const allRequests = result.data || []
  const pendingRequests = allRequests.filter((r: any) => r.status === 'pending')
  const approvedRequests = allRequests.filter((r: any) => r.status === 'approved')
  const deniedRequests = allRequests.filter((r: any) => r.status === 'denied')

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Revision Credit Requests</h1>
        <p className="text-muted-foreground">
          Review and manage user requests for revision credits
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Approved
            {approvedRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {approvedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="denied" className="gap-2">
            Denied
            {deniedRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {deniedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request: any) => (
              <RevisionRequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No approved requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedRequests.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{request.videos?.title || 'Video Request'}</p>
                        <p className="text-sm text-muted-foreground">
                          User: {request.profiles?.first_name || request.profiles?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Approved: {new Date(request.reviewed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-emerald-500">Approved</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="denied" className="space-y-4">
          {deniedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No denied requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {deniedRequests.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{request.videos?.title || 'Video Request'}</p>
                        <p className="text-sm text-muted-foreground">
                          User: {request.profiles?.first_name || request.profiles?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Denied: {new Date(request.reviewed_at).toLocaleDateString()}
                        </p>
                        {request.admin_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {request.admin_notes}
                          </p>
                        )}
                      </div>
                      <Badge variant="destructive">Denied</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
