import Redis from 'ioredis';

// Initialize Redis client
let redis: Redis | null = null;

interface RedisError extends Error {
  code?: string;
}

const getRedisClient = (): Redis => {
  if (!redis) {
    // Check for URL-based configuration first
    const redisUrl = process.env.REDIS_URL;
    
    // If no URL, check for component-based configuration
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisUsername = process.env.REDIS_USERNAME;
    const redisDb = process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0;
    const redisTls = process.env.REDIS_TLS === 'true';

    if (!redisUrl && !redisHost) {
      throw new Error('Redis configuration missing. Please provide either REDIS_URL or REDIS_HOST environment variable.');
    }

    console.log('Initializing Redis client...');
    
    const config = {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      // Better connection handling
      connectTimeout: 10000, // 10 seconds
      commandTimeout: 5000,  // 5 seconds
      keepAlive: 10000,     // 10 seconds
      noDelay: true,        // Disable Nagle's algorithm
      enableAutoPipelining: true,
      maxLoadingRetryTime: 2000, // 2 seconds
      enableOfflineQueue: true,
      lazyConnect: true, // Connect only when needed
      tls: redisTls ? {} : undefined,
    };

    // Create client based on available configuration
    if (redisUrl) {
      console.log('Using URL-based configuration:', redisUrl);
      redis = new Redis(redisUrl, config);
    } else {
      console.log('Using component-based configuration:', {
        host: redisHost,
        port: redisPort,
        username: redisUsername,
        password: redisPassword,
        db: redisDb,
        tls: redisTls ? {} : undefined,
      });
      redis = new Redis({
        ...config,
        host: redisHost,
        port: redisPort,
        username: redisUsername || undefined,
        password: redisPassword,
        db: redisDb,
        tls: redisTls ? {} : undefined, // Enable TLS if specified
      });
    }

    // Enhanced error handling and logging
    redis.on('error', (err: RedisError) => {
      console.error('Redis Client Error:', err);
      if (err.code === 'ECONNRESET') {
        console.log('Connection reset, attempting to reconnect...');
        // The client will automatically attempt to reconnect
      }
    });

    redis.on('connect', () => {
      console.log('Redis client connected successfully.');
    });

    redis.on('ready', () => {
      console.log('Redis client is ready to receive commands.');
    });

    redis.on('reconnecting', (delay: number) => {
      console.log(`Redis client reconnecting in ${delay}ms...`);
    });

    redis.on('end', () => {
      console.log('Redis client connection closed.');
      // Optionally null the client to force new connection on next use
      redis = null;
    });
    
    // Attempt initial connection with better error handling
    redis.connect().catch(err => {
      console.error('Initial Redis connection failed:', err);
      console.log('Please ensure Redis server is running and accessible.');
      if (redisUrl) {
        console.log(`Attempted connection to: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
      } else {
        console.log(`Attempted connection to: ${redisHost}:${redisPort}`);
      }
    });
  }
  return redis;
};

// Export the function to get the client instance
export const redisClient = getRedisClient;

// Optional: Export specific cache functions for convenience
const CACHE_TTL_SECONDS = 24 * 60 * 60; // Default 24 hours

export const setCache = async (key: string, value: any, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<void> => {
  try {
    const client = redisClient();
    if (!client.status || client.status === 'end') {
      await client.connect();
    }
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await client.setex(key, ttlSeconds, stringValue);
    console.log(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
  } catch (error: unknown) {
    console.error(`Failed to set cache for key ${key}:`, error);
    // Optionally reset client on serious errors
    if (error instanceof Error && (error as RedisError).code && 
        ['ECONNRESET', 'ENOTFOUND'].includes((error as RedisError).code!)) {
      redis = null;
    }
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = redisClient();
    if (!client.status || client.status === 'end') {
      await client.connect();
    }
    const value = await client.get(key);
    if (value) {
      console.log(`Cache hit for key: ${key}`);
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as any as T;
      }
    }
    console.log(`Cache miss for key: ${key}`);
    return null;
  } catch (error: unknown) {
    console.error(`Failed to get cache for key ${key}:`, error);
    // Optionally reset client on serious errors
    if (error instanceof Error && (error as RedisError).code && 
        ['ECONNRESET', 'ENOTFOUND'].includes((error as RedisError).code!)) {
      redis = null;
    }
    return null;
  }
}; 