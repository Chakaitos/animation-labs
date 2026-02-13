import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Database Health Check Endpoint
 *
 * Verifies Supabase connection by performing a simple query.
 * Returns 200 OK if database is accessible, 503 if connection fails.
 *
 * Used for monitoring database availability and deployment validation.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase environment variables not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Create service role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // Perform a simple query to verify connection
    // Query the profiles table with a limit to minimize overhead
    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      console.error('Database health check failed:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unexpected error during health check',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
