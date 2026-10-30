import PocketBase from 'pocketbase';

function getPocketBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_PB_URL) {
    return process.env.NEXT_PUBLIC_PB_URL;
  }
  if (typeof window !== 'undefined') {
    return '/recruiter-pb';
  }
  return process.env.PB_INTERNAL_URL || 'http://127.0.0.1:8093';
}

export const pb = new PocketBase(getPocketBaseUrl());

export const isAdmin = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'admin') return true;
  if (typeof window !== 'undefined' && (localStorage.getItem('admin_auth') === 'true' || localStorage.getItem('demo_role') === 'admin')) return true;
  return false;
};

export const isEmployer = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'employer') return true;
  if (typeof window !== 'undefined' && localStorage.getItem('demo_role') === 'employer') return true;
  return false;
};

export const isCandidate = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'candidate') return true;
  if (typeof window !== 'undefined' && localStorage.getItem('demo_role') === 'candidate') return true;
  return false;
};

export const getUserRole = (): string | null => {
  if (pb.authStore.isValid && pb.authStore.record) return pb.authStore.record.role || null;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demo_role') || (localStorage.getItem('admin_auth') === 'true' ? 'admin' : null);
  }
  return null;
};

// ============================================================================
// IN-MEMORY TTL CACHE & REQUEST DEDUPLICATION (0ms Tab Switching & Stale-While-Revalidate)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Fetch a full list with automatic in-memory caching and request deduplication.
 * Default TTL: 30 seconds.
 */
export async function cachedPbGetFullList<T = RecordModel>(
  collectionName: string,
  options?: Record<string, any>,
  ttlMs = 30000
): Promise<T[]> {
  const cacheKey = `${collectionName}:${JSON.stringify(options || {})}`;
  const now = Date.now();

  // 1. Check valid cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.data as T[];
  }

  // 2. Deduplicate in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T[]>;
  }

  // 3. Execute and store
  const requestPromise = pb
    .collection(collectionName)
    .getFullList(options)
    .then((result) => {
      memoryCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + ttlMs,
      });
      inFlightRequests.delete(cacheKey);
      return result as T[];
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      // If we have stale data on error, return it as fallback
      if (cached) return cached.data as T[];
      throw err;
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Invalidate cache for a specific collection or all collections.
 */
export function invalidatePbCache(collectionName?: string): void {
  if (!collectionName) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`${collectionName}:`)) {
      memoryCache.delete(key);
    }
  }
}
