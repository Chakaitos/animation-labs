'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const creditAdjustmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  credits: z.number().int().min(-1000).max(1000),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

export async function adjustUserCredits(formData: FormData) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  // Validate input
  const validated = creditAdjustmentSchema.safeParse({
    userId: formData.get('userId'),
    credits: parseInt(formData.get('credits') as string),
    reason: formData.get('reason'),
  })

  if (!validated.success) {
    return {
      error: 'Invalid input',
      details: validated.error.flatten().fieldErrors,
    }
  }

  const { userId, credits, reason } = validated.data

  // Execute credit adjustment via RPC function
  const { data: success, error } = await supabase.rpc('admin_adjust_credits', {
    p_admin_id: user.id,
    p_user_id: userId,
    p_credits: credits,
    p_description: reason,
  })

  if (error) {
    console.error('Credit adjustment error:', error)
    return { error: error.message }
  }

  // Revalidate user detail page
  revalidatePath(`/admin/users/${userId}`)

  return {
    success: true,
    message: `${credits > 0 ? 'Added' : 'Deducted'} ${Math.abs(credits)} credits`,
  }
}
