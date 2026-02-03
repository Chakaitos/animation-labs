'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email/send'

// Helper to get site URL for redirects
async function getSiteUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  // Split full name into first and last
  const fullName = (formData.get('fullName') as string).trim()
  const nameParts = fullName.split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null
  const email = formData.get('email') as string

  // Check for required environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set - custom verification emails will not be sent')
  }

  // Use admin client to generate verification link
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Generate verification link using admin API
  if (data.user && !data.user.email_confirmed_at) {
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password: formData.get('password') as string,
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (linkError) {
        console.error('Failed to generate verification link:', {
          error: linkError.message,
          code: linkError.code,
          email,
        })
        // Continue anyway - user can request new link
      } else if (linkData.properties?.action_link) {
        console.log('Sending custom verification email:', {
          email,
          firstName,
          hasActionLink: !!linkData.properties.action_link,
        })
        // Send custom branded verification email
        await sendVerificationEmail(email, firstName, linkData.properties.action_link)
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue anyway - user can request new link
    }
  }

  redirect('/verify-email')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const siteUrl = await getSiteUrl()
  const email = formData.get('email') as string

  // Use admin client to check if user exists and generate reset link
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Generate password reset link using admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
      },
    })

    if (!linkError && linkData.properties?.action_link) {
      // Fetch user's first name for personalization
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('email', email)
        .single()

      const firstName = profile?.first_name || 'there'

      // Send custom branded password reset email
      await sendPasswordResetEmail(email, firstName, linkData.properties.action_link)
    }
  } catch (error) {
    // Silently fail to prevent email enumeration
    console.error('Password reset error:', error)
  }

  // Always return success to prevent email enumeration (security best practice)
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=password-updated')
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  // First verify current password by attempting sign in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: 'Not authenticated' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  // Sign out all sessions (forces re-login on all devices per CONTEXT.md)
  await supabase.auth.signOut({ scope: 'global' })

  redirect('/login?message=password-changed')
}
