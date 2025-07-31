import Redis, { RedisOptions } from 'ioredis';

// Define RedisError interface if not globally available or from ioredis types
interface RedisError extends Error {
    code?: string;
  }

// Centralized Redis Client Initialization
// Uses environment variables for configuration.
// Ensure these are set in your .env file:
// REDIS_URL=redis://:[password]@[host]:[port]
// OR
// REDIS_HOST=your_redis_host
// REDIS_PORT=your_redis_port
// REDIS_PASSWORD=your_redis_password (optional)

let redisClient: Redis | null = null;
let clientReadyPromise: Promise<Redis> | null = null;

const initializeRedisClient = (): Promise<Redis> => {
    // If a client instance exists and is connected/ready, return it immediately.
    if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')) {
        console.log('[Redis] initializeRedisClient: Returning existing ready client.');
        return Promise.resolve(redisClient);
    }

    // If a connection promise already exists, return it to avoid creating multiple instances simultaneously.
    if (clientReadyPromise) {
        console.log('[Redis] initializeRedisClient: Returning existing connection promise.');
        return clientReadyPromise;
    }

    console.log('[Redis] initializeRedisClient: Creating new connection promise.');
    clientReadyPromise = new Promise((resolve, reject) => {
        const redisUrl = process.env.REDIS_URL;
        const redisOptions: RedisOptions = {
            // Using ioredis default retryStrategy by removing the custom one.
            // Default is exponential backoff, typically up to 10 times or ~12.8 seconds.
            maxRetriesPerRequest: 10, // Increased from 3. Default ioredis is 20.
            enableReadyCheck: true,
            connectTimeout: 10000, // Added: 10 seconds for initial connection
            showFriendlyErrorStack: process.env.NODE_ENV === 'development', // For better debugging
            enableOfflineQueue: true, // Explicitly set, though it's the default
            tls: {}, // <<< --- ADD THIS LINE TO ENABLE TLS
        };

        let tempClient: Redis; // Temporary client instance for this initialization attempt

        if (redisUrl) {
            console.log("[Redis] initializeRedisClient: Attempting to connect using REDIS_URL...");
            tempClient = new Redis(redisUrl, redisOptions);
        } else {
            console.log("[Redis] initializeRedisClient: Attempting to connect using host/port: ", process.env.REDIS_HOST, process.env.REDIS_PORT);
            const host = process.env.REDIS_HOST || '127.0.0.1';
            const port = parseInt(process.env.REDIS_PORT || '6379', 10);
            const password = process.env.REDIS_PASSWORD;
            tempClient = new Redis({
                ...redisOptions,
                host: host,
                port: port,
                password: password,
            });
        }

        // --- Event Handlers for tempClient --- 
        tempClient.on('connecting', () => console.log('[Redis] initializeRedisClient: Client connecting...'));
        
        tempClient.on('connect', () => {
            console.log('[Redis] initializeRedisClient: Client \'connect\' event fired.');
            // 'connect' means TCP connection is up, but client might not be 'ready' for commands yet if enableReadyCheck is true
        });
        
        tempClient.on('ready', () => {
            console.log('[Redis] initializeRedisClient: Client \'ready\' event fired. Connection established.');
            redisClient = tempClient; // Assign the successfully connected client to the module-level variable
            resolve(redisClient); // Resolve the promise with the ready client
        });

        tempClient.on('error', (err: RedisError) => {
            if (err.code === 'ECONNRESET') {
                console.error('[Redis] initializeRedisClient: Connection to Redis was reset. This is often due to server-side timeout or network issues.');
            } else if (err.code === 'ECONNREFUSED') {
                console.error('[Redis] initializeRedisClient: Connection to Redis was refused. Check if Redis server is running and accessible.');
            } else {
                const errorMessage = `[Redis] initializeRedisClient: Client error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
                console.error(errorMessage);
            }
            
            // If an error occurs before the 'ready' event, and it's a connection error,
            // reject the promise and clear it to allow a new attempt.
            if (!redisClient || (redisClient && redisClient.status !== 'ready' && redisClient.status !== 'connect')) {
                 console.error('[Redis] initializeRedisClient: Error before client was ready. Rejecting promise.');
                 // Only reject the current promise if it hasn't been resolved or rejected yet.
                 // Check if 'tempClient' is the one this promise is about.
                 // The 'end' event is the ultimate decider for ioredis stopping retries.
                 // However, for critical initial errors, we can reject earlier.
                 // For now, let 'end' event handle final rejection of the current clientReadyPromise.
                 // If specific errors (like auth errors) should immediately reject, that logic could be added here.
            }
        });

        tempClient.on('close', () => {
            console.log('[Redis] initializeRedisClient: Client connection closed.');
            // If the client that was part of the current promise closes before being ready,
            // reset the promise to allow a new connection attempt.
            // This check ensures we only nullify if this 'tempClient' is the one the *current* promise is for.
            if (clientReadyPromise && !redisClient) { // If promise exists but client never became globally ready
                 // Check if the promise is still pending for THIS tempClient.
                 // This is tricky because clientReadyPromise might be for an older, failed attempt.
                 // For safety, the 'end' event is a more definitive place to nullify clientReadyPromise.
                 // However, if we're sure this 'close' is for the *current* attempt before 'ready':
                 console.log('[Redis] initializeRedisClient: Connection closed before ready. Nullifying clientReadyPromise if it was for this client.');
                 // To be safer, we rely on 'end' to reject and nullify the promise.
            }
        });
        
        tempClient.on('reconnecting', (delay: number) => {
            console.log(`[Redis] initializeRedisClient: Client reconnecting in ${delay}ms...`);
        });
        
        tempClient.on('end', () => {
            console.log('[Redis] initializeRedisClient: Client connection ended (retries exhausted or .quit()).');
            // If this specific initialization attempt ends, reject its promise and clear it.
            // This ensures that a new attempt to get a client will try to re-initialize.
            // Check if the clientReadyPromise is the one associated with this tempClient ending.
            // This logic assumes that 'end' means this specific tempClient's lifecycle is over.
            if (clientReadyPromise) {
                console.log('[Redis] initializeRedisClient: \'end\' event. Rejecting current clientReadyPromise.');
                reject(new Error('Redis client connection ended. Failed to connect, retries exhausted, or .quit() called.'));
                clientReadyPromise = null; 
            }
            // Ensure the global/module-level client is also cleared if it was this one.
            if (redisClient === tempClient) {
                redisClient = null;
            }
        });
    });

    return clientReadyPromise;
};

// Export a function that always returns a promise resolving to a ready client
export const getReadyRedisClient = async (): Promise<Redis> => {
    // This function now consistently calls initializeRedisClient,
    // which handles returning existing ready clients or promises.
    return initializeRedisClient();
};

// Optional: Function to gracefully disconnect
export const disconnectRedis = async () => {
    console.log('[Redis] disconnectRedis: Attempting to disconnect...');
    // Try to get the client instance from the promise first, as it might be in the process of connecting.
    let clientToDisconnect: Redis | null = null;
    if (clientReadyPromise) {
        try {
            clientToDisconnect = await clientReadyPromise;
        } catch (e) {
            console.warn('[Redis] disconnectRedis: Error awaiting clientReadyPromise during disconnect, client might not have connected:', e);
            // If clientReadyPromise rejects, it means connection failed.
            // redisClient might be null or an older instance.
        }
    }
    
    // If clientReadyPromise didn't resolve or redisClient is more current (e.g. after a successful connection)
    if (!clientToDisconnect && redisClient) {
        clientToDisconnect = redisClient;
    }

    if (clientToDisconnect) {
        console.log(`[Redis] disconnectRedis: Client status before quit: ${clientToDisconnect.status}`);
        try {
            // ioredis quit() returns a promise that resolves when all pending commands are sent and connection is closed.
            await clientToDisconnect.quit();
            console.log("[Redis] disconnectRedis: Client disconnected gracefully via quit().");
        } catch (e) {
            const error = e as RedisError;
            console.error("[Redis] disconnectRedis: Error during quit():", error.message);
            // If quit fails (e.g., client already disconnected or in a bad state), force disconnect.
            clientToDisconnect.disconnect(); 
            console.log("[Redis] disconnectRedis: Client forcefully disconnected via disconnect().");
        }
    } else {
        console.log("[Redis] disconnectRedis: No active client or connection promise to disconnect.");
    }

    // Reset global state
    if (redisClient === clientToDisconnect) {
        redisClient = null;
    }
    // Nullify clientReadyPromise only if it was for the client we just disconnected
    // or if it failed to resolve.
    // If clientToDisconnect came from clientReadyPromise, it's implicitly handled when the promise resolves/rejects.
    // However, if disconnect is called while a promise is pending, we should clear it to allow new connections.
    clientReadyPromise = null; 
    console.log("[Redis] disconnectRedis: Cleared redisClient and clientReadyPromise.");
};

const CACHE_TTL_SECONDS = 24 * 60 * 60; // Default 24 hours

export const setCache = async (key: string, value: any, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<void> => {
  let client: Redis;
  try {
    client = await getReadyRedisClient(); // Await the ready client
    console.log(`[Redis] setCache: Attempting to set key: ${key}, TTL: ${ttlSeconds}s. Client status: ${client.status}`);
    
    // With getReadyRedisClient, status should be 'ready' or 'connect' if promise resolved.
    // However, a quick final check can be useful before a command.
    if (client.status !== 'ready' && client.status !== 'connect') {
         console.error(`[Redis] setCache: Client unexpectedly not ready (status: ${client.status}) for key: ${key}. Aborting setex.`);
         // This case should ideally be handled by getReadyRedisClient rejecting.
         return; 
    }

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    console.log(`[Redis] setCache: Executing SETEX for key: ${key}. Value (first 100 chars): ${stringValue.substring(0, 100)}...`);
    await client.setex(key, ttlSeconds, stringValue);
    console.log(`[Redis] setCache: Successfully set key: ${key}`);
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    console.error(`[Redis] setCache: Failed to set cache for key ${key}. Error:`, errorDetails);
    // If error is due to connection, getReadyRedisClient should ideally handle/reject on next call.
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  let client: Redis;
  try {
    client = await getReadyRedisClient(); // Await the ready client
    console.log(`[Redis] getCache: Attempting to get key: ${key}. Client status: ${client.status}`);

    if (client.status !== 'ready' && client.status !== 'connect') {
        console.error(`[Redis] getCache: Client unexpectedly not ready (status: ${client.status}) for key: ${key}. Aborting get.`);
        return null; 
    }

    console.log(`[Redis] getCache: Executing GET for key: ${key}`);
    const value = await client.get(key);

    if (value) {
      console.log(`[Redis] getCache: Cache HIT for key: ${key}. Value (first 100 chars): ${String(value).substring(0,100)}...`);
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as any as T; // Return as string if not JSON
      }
    }
    console.log(`[Redis] getCache: Cache MISS for key: ${key}`);
    return null;
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    console.error(`[Redis] getCache: Failed to get cache for key ${key}. Error:`, errorDetails);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  let client: Redis;
  try {
    client = await getReadyRedisClient();
    console.log(`[Redis] deleteCache: Attempting to delete key: ${key}. Client status: ${client.status}`);

    if (client.status !== 'ready' && client.status !== 'connect') {
        console.error(`[Redis] deleteCache: Client unexpectedly not ready (status: ${client.status}) for key: ${key}. Aborting del.`);
        return false; 
    }

    console.log(`[Redis] deleteCache: Executing DEL for key: ${key}`);
    const result = await client.del(key);
    
    if (result > 0) {
      console.log(`[Redis] deleteCache: Successfully deleted key: ${key}`);
      return true;
    } else {
      console.log(`[Redis] deleteCache: Key not found or already deleted: ${key}`);
      return false;
    }
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    console.error(`[Redis] deleteCache: Failed to delete cache for key ${key}. Error:`, errorDetails);
    return false;
  }
};

export const clearCachePattern = async (pattern: string): Promise<number> => {
  let client: Redis;
  try {
    client = await getReadyRedisClient();
    console.log(`[Redis] clearCachePattern: Attempting to clear pattern: ${pattern}. Client status: ${client.status}`);

    if (client.status !== 'ready' && client.status !== 'connect') {
        console.error(`[Redis] clearCachePattern: Client unexpectedly not ready (status: ${client.status}) for pattern: ${pattern}. Aborting.`);
        return 0; 
    }

    console.log(`[Redis] clearCachePattern: Executing SCAN for pattern: ${pattern}`);
    const keys: string[] = [];
    const stream = client.scanStream({ match: pattern });

    for await (const chunk of stream) {
      keys.push(...chunk);
    }

    if (keys.length > 0) {
      console.log(`[Redis] clearCachePattern: Found ${keys.length} keys matching pattern: ${pattern}`);
      console.log(`[Redis] clearCachePattern: Keys to delete: ${keys.join(', ')}`);
      
      const result = await client.del(...keys);
      console.log(`[Redis] clearCachePattern: Successfully deleted ${result} keys for pattern: ${pattern}`);
      return result;
    } else {
      console.log(`[Redis] clearCachePattern: No keys found matching pattern: ${pattern}`);
      return 0;
    }
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    console.error(`[Redis] clearCachePattern: Failed to clear cache for pattern ${pattern}. Error:`, errorDetails);
    return 0;
  }
}; 