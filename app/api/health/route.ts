import { NextResponse } from 'next/server'

/**
 * Basic Health Check Endpoint
 *
 * Returns 200 OK if the application is running.
 * Used by load balancers, monitoring systems, and deployment validation.
 *
 * @returns {Object} JSON response with health status
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'Animation Labs API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  )
}
