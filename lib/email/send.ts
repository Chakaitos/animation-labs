'use server'

import { backOff } from 'exponential-backoff'
import { resend } from './client'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import VideoReadyEmail from '@/emails/video-ready'
import PaymentFailedEmail from '@/emails/payment-failed'
import VerificationEmail from '@/emails/verification'
import PasswordResetEmail from '@/emails/password-reset'
import WelcomeEmail from '@/emails/welcome'

// Create admin client for auth.admin access
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Send video ready notification email with retry logic
 *
 * @param userId - User ID to send email to
 * @param videoUrl - Direct download URL for the video
 * @param brandName - Name of the brand/logo
 * @param thumbnailUrl - Optional thumbnail image URL
 */
export async function sendVideoReadyEmail(
  userId: string,
  videoUrl: string,
  brandName: string,
  thumbnailUrl?: string
) {
  console.log('sendVideoReadyEmail called:', { userId, brandName, hasVideoUrl: !!videoUrl, hasThumbnailUrl: !!thumbnailUrl })

  const supabase = await createClient()

  // Fetch user profile for email and first name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('id', userId)
    .single()

  // Fallback: If profile doesn't exist, fetch email from auth.users
  if (profileError || !profile) {
    console.error('Profile not found, attempting auth.users fallback:', {
      userId,
      error: profileError?.message,
      code: profileError?.code,
      details: profileError?.details,
    })

    // Use admin client to access auth.users
    const adminClient = getAdminClient()
    const { data: { user: authUser }, error: authError } = await adminClient.auth.admin.getUserById(userId)

    if (authError || !authUser?.email) {
      console.error('Failed to fetch user email from auth.users:', {
        userId,
        error: authError?.message,
      })
      throw new Error('Could not find user email for video notification')
    }

    console.log('Using email from auth.users (profile missing):', { userId, email: authUser.email })

    if (!authUser.email) {
      throw new Error('User has no email address')
    }

    // Send email without personalization
    try {
      const result = await backOff(
        async () => {
          const { data, error } = await resend.emails.send({
            from: 'Animation Labs <no-reply@animationlabs.ai>',
            to: authUser.email!,
            subject: `Your ${brandName} video is ready!`,
            react: VideoReadyEmail({
              firstName: undefined, // No first name - will use "there" fallback
              brandName,
              videoUrl,
              thumbnailUrl,
            }),
          })

          // CRITICAL: Resend doesn't throw on errors, check result.error explicitly
          if (error) {
            // Don't retry on validation errors
            if (
              error.message?.includes('invalid_email') ||
              error.message?.includes('domain_not_verified')
            ) {
              console.error('Permanent email error (not retrying):', {
                emailType: 'video-ready',
                userId,
                error: error.message,
              })
              throw new Error(`Permanent email error: ${error.message}`)
            }

            // Throw to trigger retry
            throw new Error(error.message || 'Unknown Resend error')
          }

          return data
        },
        {
          numOfAttempts: 3,
          startingDelay: 1000, // 1 second
          timeMultiple: 5, // 1s -> 5s -> 25s
          jitter: 'full',
        }
      )

      console.log('Video ready email sent successfully (no profile):', {
        emailType: 'video-ready',
        userId,
        brandName,
        emailId: result?.id,
        fallback: true,
      })

      return result
    } catch (error) {
      console.error('Failed to send video ready email after retries (fallback):', {
        emailType: 'video-ready',
        userId,
        brandName,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  console.log('Profile fetched successfully:', { userId, email: profile.email, hasFirstName: !!profile.first_name })

  try {
    // Use exponential backoff for retry logic
    const result = await backOff(
      async () => {
        const { data, error } = await resend.emails.send({
          from: 'Animation Labs <no-reply@animationlabs.ai>',
          to: profile.email,
          subject: `Your ${brandName} video is ready!`,
          react: VideoReadyEmail({
            firstName: profile.first_name || undefined,
            brandName,
            videoUrl,
            thumbnailUrl,
          }),
        })

        // CRITICAL: Resend doesn't throw on errors, check result.error explicitly
        if (error) {
          // Don't retry on validation errors
          if (
            error.message?.includes('invalid_email') ||
            error.message?.includes('domain_not_verified')
          ) {
            console.error('Permanent email error (not retrying):', {
              emailType: 'video-ready',
              userId,
              error: error.message,
            })
            throw new Error(`Permanent email error: ${error.message}`)
          }

          // Throw to trigger retry
          throw new Error(error.message || 'Unknown Resend error')
        }

        return data
      },
      {
        numOfAttempts: 3,
        startingDelay: 1000, // 1 second
        timeMultiple: 5, // 1s -> 5s -> 25s
        jitter: 'full',
      }
    )

    console.log('Video ready email sent successfully:', {
      emailType: 'video-ready',
      userId,
      brandName,
      emailId: result?.id,
    })

    return result
  } catch (error) {
    console.error('Failed to send video ready email after retries:', {
      emailType: 'video-ready',
      userId,
      brandName,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Send payment failed notification email with retry logic
 *
 * @param userId - User ID to send email to
 * @param planName - Name of the subscription plan
 * @param amountDue - Amount due in cents
 * @param retryUrl - URL to update payment method
 */
export async function sendPaymentFailedEmail(
  userId: string,
  planName: string,
  amountDue: number,
  retryUrl: string
) {
  const supabase = await createClient()

  // Fetch user profile for email and first name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('id', userId)
    .single()

  // Format amount as currency (dollars with 2 decimal places)
  const amountFormatted = `$${(amountDue / 100).toFixed(2)}`

  // Fallback: If profile doesn't exist, fetch email from auth.users
  if (profileError || !profile) {
    console.error('Profile not found, attempting auth.users fallback:', {
      userId,
      error: profileError?.message,
    })

    // Use admin client to access auth.users
    const adminClient = getAdminClient()
    const { data: { user: authUser }, error: authError } = await adminClient.auth.admin.getUserById(userId)

    if (authError || !authUser?.email) {
      console.error('Failed to fetch user email from auth.users:', {
        userId,
        error: authError?.message,
      })
      throw new Error('Could not find user email for payment notification')
    }

    console.log('Using email from auth.users (profile missing):', { userId, email: authUser.email })

    if (!authUser.email) {
      throw new Error('User has no email address')
    }

    try {
      const result = await backOff(
        async () => {
          const { data, error } = await resend.emails.send({
            from: 'Animation Labs <support@animationlabs.ai>',
            to: authUser.email!,
            subject: 'Action Required: Payment failed for your Animation Labs subscription',
            react: PaymentFailedEmail({
              firstName: undefined,
              planName,
              amountDue: amountFormatted,
              retryUrl,
            }),
          })

          if (error) {
            if (
              error.message?.includes('invalid_email') ||
              error.message?.includes('domain_not_verified')
            ) {
              console.error('Permanent email error (not retrying):', {
                emailType: 'payment-failed',
                userId,
                error: error.message,
              })
              throw new Error(`Permanent email error: ${error.message}`)
            }

            throw new Error(error.message || 'Unknown Resend error')
          }

          return data
        },
        {
          numOfAttempts: 3,
          startingDelay: 1000,
          timeMultiple: 5,
          jitter: 'full',
        }
      )

      console.log('Payment failed email sent successfully (no profile):', {
        emailType: 'payment-failed',
        userId,
        planName,
        emailId: result?.id,
        fallback: true,
      })

      return result
    } catch (error) {
      console.error('Failed to send payment failed email after retries (fallback):', {
        emailType: 'payment-failed',
        userId,
        planName,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  try {
    // Use exponential backoff for retry logic
    const result = await backOff(
      async () => {
        const { data, error } = await resend.emails.send({
          from: 'Animation Labs <support@animationlabs.ai>',
          to: profile.email,
          subject: 'Action Required: Payment failed for your Animation Labs subscription',
          react: PaymentFailedEmail({
            firstName: profile.first_name || undefined,
            planName,
            amountDue: amountFormatted,
            retryUrl,
          }),
        })

        // CRITICAL: Resend doesn't throw on errors, check result.error explicitly
        if (error) {
          // Don't retry on validation errors
          if (
            error.message?.includes('invalid_email') ||
            error.message?.includes('domain_not_verified')
          ) {
            console.error('Permanent email error (not retrying):', {
              emailType: 'payment-failed',
              userId,
              error: error.message,
            })
            throw new Error(`Permanent email error: ${error.message}`)
          }

          // Throw to trigger retry
          throw new Error(error.message || 'Unknown Resend error')
        }

        return data
      },
      {
        numOfAttempts: 3,
        startingDelay: 1000, // 1 second
        timeMultiple: 5, // 1s -> 5s -> 25s
        jitter: 'full',
      }
    )

    console.log('Payment failed email sent successfully:', {
      emailType: 'payment-failed',
      userId,
      planName,
      emailId: result?.id,
    })

    return result
  } catch (error) {
    console.error('Failed to send payment failed email after retries:', {
      emailType: 'payment-failed',
      userId,
      planName,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Send verification email with branded template
 * Called immediately after signup (not fire-and-forget - user needs to see this)
 *
 * @param email - User email address
 * @param firstName - User first name for personalization
 * @param verificationUrl - Magic link URL from Supabase
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Animation Labs <hello@animationlabs.ai>',
      to: email,
      subject: 'Welcome to Animation Labs - Verify your email',
      react: VerificationEmail({
        firstName,
        verificationUrl,
      }),
    })

    if (error) {
      console.error('Failed to send verification email:', {
        emailType: 'verification',
        email,
        error: error.message,
      })
      throw new Error(error.message || 'Failed to send verification email')
    }

    console.log('Verification email sent successfully:', {
      emailType: 'verification',
      email,
      emailId: data?.id,
    })

    return data
  } catch (error) {
    console.error('Verification email error:', {
      emailType: 'verification',
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Send password reset email with branded template
 * Called immediately after reset request (not fire-and-forget - user needs to see this)
 *
 * @param email - User email address
 * @param firstName - User first name for personalization
 * @param resetUrl - Password reset URL from Supabase
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Animation Labs <hello@animationlabs.ai>',
      to: email,
      subject: 'Reset your Animation Labs password',
      react: PasswordResetEmail({
        firstName,
        resetUrl,
      }),
    })

    if (error) {
      console.error('Failed to send password reset email:', {
        emailType: 'password-reset',
        email,
        error: error.message,
      })
      throw new Error(error.message || 'Failed to send password reset email')
    }

    console.log('Password reset email sent successfully:', {
      emailType: 'password-reset',
      email,
      emailId: data?.id,
    })

    return data
  } catch (error) {
    console.error('Password reset email error:', {
      emailType: 'password-reset',
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Send welcome email after successful email verification
 * Fire-and-forget pattern - should not block auth flow
 *
 * @param email - User email address
 * @param firstName - User first name for personalization
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string
) {
  try {
    // Use exponential backoff for retry logic
    const result = await backOff(
      async () => {
        const { data, error } = await resend.emails.send({
          from: 'Animation Labs <hello@animationlabs.ai>',
          to: email,
          subject: 'Welcome to Animation Labs! 🎬',
          react: WelcomeEmail({
            firstName,
          }),
        })

        // CRITICAL: Resend doesn't throw on errors, check result.error explicitly
        if (error) {
          // Don't retry on validation errors
          if (
            error.message?.includes('invalid_email') ||
            error.message?.includes('domain_not_verified')
          ) {
            console.error('Permanent email error (not retrying):', {
              emailType: 'welcome',
              email,
              error: error.message,
            })
            throw new Error(`Permanent email error: ${error.message}`)
          }

          // Throw to trigger retry
          throw new Error(error.message || 'Unknown Resend error')
        }

        return data
      },
      {
        numOfAttempts: 3,
        startingDelay: 1000, // 1 second
        timeMultiple: 5, // 1s -> 5s -> 25s
        jitter: 'full',
      }
    )

    console.log('Welcome email sent successfully:', {
      emailType: 'welcome',
      email,
      emailId: result?.id,
    })

    return result
  } catch (error) {
    console.error('Failed to send welcome email after retries:', {
      emailType: 'welcome',
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}
