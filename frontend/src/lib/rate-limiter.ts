export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  totalLimit: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
}

interface Bucket {
  timestamps: number[];
}

const memoryStore = new Map<string, Bucket>();

// Max memory bucket entries to prevent unbounded RAM growth
const MAX_TRACKED_KEYS = 5000;

/**
 * Clean up expired timestamps from a bucket.
 */
function cleanupBucket(bucket: Bucket, now: number, windowMs: number): void {
  const threshold = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > threshold);
}

/**
 * Periodically purge dead buckets (no events within last 10 minutes)
 */
function pruneStaleKeys(now: number): void {
  if (memoryStore.size <= MAX_TRACKED_KEYS) return;

  for (const [key, bucket] of memoryStore.entries()) {
    if (bucket.timestamps.length === 0 || bucket.timestamps[bucket.timestamps.length - 1] < now - 600000) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Sliding window in-memory rate limiter.
 * 
 * @param key Unique identifier (e.g. IP address, user_id, or token)
 * @param limit Maximum allowed requests in the time window
 * @param windowMs Duration of the sliding window in milliseconds (default: 60,000ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();

  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    memoryStore.set(key, bucket);
  }

  // Remove timestamps outside current window
  cleanupBucket(bucket, now, windowMs);
  pruneStaleKeys(now);

  const count = bucket.timestamps.length;
  const oldestTimestamp = count > 0 ? bucket.timestamps[0] : now;
  const resetTimeMs = oldestTimestamp + windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      totalLimit: limit,
      resetTimeMs,
      retryAfterSeconds,
    };
  }

  // Record this request
  bucket.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - (count + 1),
    totalLimit: limit,
    resetTimeMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Helper to extract client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
