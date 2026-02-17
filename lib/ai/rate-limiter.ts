import { Redis } from '@upstash/redis'

// Initialize Redis client only if credentials are provided
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for AI creative direction requests
 * Uses sliding window with Upstash Redis
 *
 * @param userId - User ID to rate limit
 * @param maxRequests - Maximum requests per window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 */
export async function checkRateLimit(
  userId: string,
  maxRequests = 5,
  windowMs = 60 * 60 * 1000 // 1 hour
): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!redis) {
    console.warn('Redis not configured - rate limiting disabled')
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs,
    }
  }

  const key = `ai_rate_limit:${userId}`
  const now = Date.now()

  // Get current count
  const current = await redis.get<number>(key)

  if (!current) {
    // First request in window
    await redis.set(key, 1, { px: windowMs })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (current >= maxRequests) {
    // Rate limit exceeded
    const ttl = await redis.pttl(key)
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + (ttl || windowMs),
    }
  }

  // Increment count
  await redis.incr(key)

  return {
    allowed: true,
    remaining: maxRequests - current - 1,
    resetTime: now + windowMs,
  }
}
