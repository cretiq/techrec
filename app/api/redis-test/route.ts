import { NextResponse } from 'next/server';
import { setCache, getCache } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Use environment variable for cache prefix, fallback to default
const TEST_CACHE_PREFIX = process.env.REDIS_CACHE_PREFIX || 'redis_test:';
const DEFAULT_TEST_KEY = `${TEST_CACHE_PREFIX}my_test_key`;

// POST /api/redis-test
// Sets a value in Redis
export async function POST(request: Request) {
  console.log('[API /redis-test POST] Received request to set cache.');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('[API /redis-test POST] Unauthorized: No session.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const key = body.key ? `${TEST_CACHE_PREFIX}${body.key}` : DEFAULT_TEST_KEY;
    const value = body.value || `Test value set at ${new Date().toISOString()}`;
    const ttl = body.ttl || 60; // Default 60 seconds TTL for test keys

    console.log(`[API /redis-test POST] Attempting to set cache. Key: ${key}, Value: ${value}, TTL: ${ttl}s`);
    await setCache(key, value, ttl);
    console.log(`[API /redis-test POST] Successfully called setCache for key: ${key}`);
    
    return NextResponse.json({ message: 'Test value set in cache', key, value, ttl, cachePrefix: TEST_CACHE_PREFIX });

  } catch (error: any) {
    console.error(`[API /redis-test POST] Error setting cache:`, error);
    return NextResponse.json(
      { error: 'Failed to set test cache value', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/redis-test?key=<your_key>
// Gets a value from Redis
export async function GET(request: Request) {
  console.log('[API /redis-test GET] Received request to get cache.');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('[API /redis-test GET] Unauthorized: No session.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get('key');
    const keyToGet = keyParam ? `${TEST_CACHE_PREFIX}${keyParam}` : DEFAULT_TEST_KEY;

    console.log(`[API /redis-test GET] Attempting to get cache for key: ${keyToGet}`);
    const cachedValue = await getCache<any>(keyToGet);

    if (cachedValue !== null) {
      console.log(`[API /redis-test GET] Cache HIT for key: ${keyToGet}. Value:`, cachedValue);
      return NextResponse.json({ message: 'Test value retrieved from cache', key: keyToGet, value: cachedValue, fromCache: true, cachePrefix: TEST_CACHE_PREFIX });
    } else {
      console.log(`[API /redis-test GET] Cache MISS for key: ${keyToGet}.`);
      return NextResponse.json({ message: 'Test value not found in cache (miss)', key: keyToGet, value: null, fromCache: false, cachePrefix: TEST_CACHE_PREFIX });
    }

  } catch (error: any) {
    console.error(`[API /redis-test GET] Error getting cache:`, error);
    return NextResponse.json(
      { error: 'Failed to get test cache value', details: error.message },
      { status: 500 }
    );
  }
} 