'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitRevisionRequest(
  videoId: string,
  reason: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate reason length
  if (!reason || reason.trim().length < 20) {
    return { error: 'Reason must be at least 20 characters' }
  }

  // Check if request already exists for this video
  const { data: existing } = await supabase
    .from('revision_requests')
    .select('id, status')
    .eq('video_id', videoId)
    .single()

  if (existing) {
    return { error: `Request already ${existing.status}` }
  }

  // Check if user has an active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('revision_credits_remaining, revision_credits_total')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!sub) {
    return { error: 'No active subscription found' }
  }

  // Check if user has already used all their monthly allocation
  if (sub.revision_credits_remaining >= sub.revision_credits_total) {
    return { error: 'No revision credits available in your monthly allocation' }
  }

  // Create request
  const { error } = await supabase
    .from('revision_requests')
    .insert({
      user_id: user.id,
      video_id: videoId,
      reason: reason.trim(),
    })

  if (error) {
    console.error('Failed to submit revision request:', error)
    return { error: 'Failed to submit request' }
  }

  return { success: true }
}

export async function approveRevisionRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { data, error } = await supabase.rpc('grant_revision_credit', {
    p_request_id: requestId,
    p_admin_id: user.id,
  })

  if (error) {
    console.error('Failed to approve revision request:', error)
    return { error: 'Failed to approve request' }
  }

  if (!data) {
    return { error: 'Failed to approve request. User may have no remaining allocation or request already processed.' }
  }

  // TODO: Send email notification to user about approval

  return { success: true }
}

export async function denyRevisionRequest(requestId: string, adminNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  // Validate admin notes
  if (!adminNotes || adminNotes.trim().length < 10) {
    return { error: 'Admin notes must be at least 10 characters' }
  }

  const { data, error } = await supabase.rpc('deny_revision_request', {
    p_request_id: requestId,
    p_admin_id: user.id,
    p_admin_notes: adminNotes.trim(),
  })

  if (error) {
    console.error('Failed to deny revision request:', error)
    return { error: 'Failed to deny request' }
  }

  if (!data) {
    return { error: 'Failed to deny request. Request may have already been processed.' }
  }

  // TODO: Send email notification to user about denial with admin notes

  return { success: true }
}

export async function getUserRevisionRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('revision_requests')
    .select(`
      *,
      videos (
        id,
        title,
        thumbnail_url,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch user revision requests:', error)
    return { error: 'Failed to load requests' }
  }

  return { data }
}

export async function getAdminRevisionRequests(status?: 'pending' | 'approved' | 'denied') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  let query = supabase
    .from('revision_requests')
    .select(`
      *,
      videos (
        id,
        title,
        thumbnail_url,
        video_url,
        status
      ),
      profiles!revision_requests_user_id_fkey (
        id,
        email,
        first_name
      )
    `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('requested_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch admin revision requests:', error)
    return { error: 'Failed to load requests' }
  }

  return { data }
}
