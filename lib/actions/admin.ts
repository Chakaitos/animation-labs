'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Verifies that the current user has admin access.
 * Redirects to /login if not authenticated.
 * Redirects to /dashboard if authenticated but not admin.
 * Returns the authenticated user if admin.
 */
export async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

/**
 * Gets the current admin user with profile data.
 * Returns null if not authenticated or not an admin.
 * Use this for conditional rendering of admin features.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, full_name, first_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null

  return { ...user, ...profile }
}

/**
 * Checks if the current user is an admin.
 * Returns a boolean, does not redirect.
 * Use this for conditional UI rendering.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}
