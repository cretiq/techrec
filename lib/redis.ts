import Redis, { RedisOptions } from 'ioredis';

// Define RedisError interface if not globally available or from ioredis types
interface RedisError extends Error {
    code?: string;
}

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  maxConsecutiveFailures: 1, // Fast-fail: trip after first failure
  resetTimeoutMs: 30000, // 30 seconds
  healthCheckIntervalMs: 10000, // 10 seconds
};

// Circuit breaker state
let circuitBreakerState = {
  failures: 0,
  isOpen: false,
  lastFailureTime: 0,
  nextHealthCheck: 0,
};

// Logging helper - only log in development or when debug is enabled
const log = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development' || process.env.REDIS_DEBUG === 'true') {
    console.log(message, ...args);
  }
};

const logError = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development' || process.env.REDIS_DEBUG === 'true') {
    console.error(message, ...args);
  }
};

// Centralized Redis Client Initialization
// Uses environment variables for configuration.
// Ensure these are set in your .env file:
// REDIS_URL=rediss://:[password]@[host]:[port] (for TLS)
// OR
// REDIS_URL=redis://:[password]@[host]:[port] (for non-TLS)
// OR
// REDIS_HOST=your_redis_host
// REDIS_PORT=your_redis_port
// REDIS_PASSWORD=your_redis_password (optional)
// REDIS_USE_TLS=true (force TLS)
// REDIS_TLS_STRICT=false (allow self-signed certs)
// DISABLE_REDIS_CACHE=true (bypass cache entirely)

let redisClient: Redis | null = null;
let clientReadyPromise: Promise<Redis> | null = null;

// Reset circuit breaker on successful connection
const resetCircuitBreaker = () => {
  circuitBreakerState.failures = 0;
  circuitBreakerState.isOpen = false;
  circuitBreakerState.lastFailureTime = 0;
  log('[Redis] Circuit breaker reset - Redis is healthy');
};

// Trip circuit breaker on failure
const tripCircuitBreaker = () => {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_CONFIG.maxConsecutiveFailures) {
    circuitBreakerState.isOpen = true;
    circuitBreakerState.nextHealthCheck = Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeoutMs;
    log(`[Redis] Circuit breaker OPEN - Redis marked as unhealthy for ${CIRCUIT_BREAKER_CONFIG.resetTimeoutMs}ms`);
  } else {
    log(`[Redis] Circuit breaker failure ${circuitBreakerState.failures}/${CIRCUIT_BREAKER_CONFIG.maxConsecutiveFailures}`);
  }
};

// Check if circuit breaker allows connection attempts
const isCircuitBreakerOpen = (): boolean => {
  if (!circuitBreakerState.isOpen) return false;
  
  const now = Date.now();
  if (now >= circuitBreakerState.nextHealthCheck) {
    log('[Redis] Circuit breaker attempting health check');
    return false; // Allow one connection attempt
  }
  
  return true; // Circuit is still open
};

// Enhanced TLS detection logic
const detectTLSUsage = (redisUrl?: string): boolean => {
  // 1. Check if URL scheme is "rediss://"
  if (redisUrl?.startsWith('rediss://')) {
    return true;
  }
  
  // 2. Check if REDIS_USE_TLS environment variable is set
  if (process.env.REDIS_USE_TLS === 'true') {
    return true;
  }
  
  // 3. Check if port is 6380 (common TLS Redis port)
  if (redisUrl) {
    const url = new URL(redisUrl.replace('redis://', 'http://').replace('rediss://', 'https://'));
    if (url.port === '6380') {
      return true;
    }
  } else if (process.env.REDIS_PORT === '6380') {
    return true;
  }
  
  return false;
};

// Get TLS configuration based on environment settings
const getTLSConfig = () => {
  const tlsConfig: any = {};
  
  // Allow self-signed certificates in development or when explicitly configured
  if (process.env.REDIS_TLS_STRICT === 'false') {
    tlsConfig.rejectUnauthorized = false;
  }
  
  return { tls: tlsConfig };
};

const initializeRedisClient = (): Promise<Redis> => {
    // Check circuit breaker first
    if (isCircuitBreakerOpen()) {
        log('[Redis] Circuit breaker is OPEN - rejecting connection attempt');
        return Promise.reject(new Error('Redis circuit breaker is open - service temporarily unavailable'));
    }

    // If a client instance exists and is connected/ready, return it immediately.
    if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')) {
        log('[Redis] initializeRedisClient: Returning existing ready client.');
        return Promise.resolve(redisClient);
    }

    // If a connection promise already exists, return it to avoid creating multiple instances simultaneously.
    if (clientReadyPromise) {
        log('[Redis] initializeRedisClient: Returning existing connection promise.');
        return clientReadyPromise;
    }

    log('[Redis] initializeRedisClient: Creating new connection promise.');
    clientReadyPromise = new Promise((resolve, reject) => {
        const redisUrl = process.env.REDIS_URL;
        
        // Enhanced TLS detection logic
        const useTLS = detectTLSUsage(redisUrl);
        
        const redisOptions: RedisOptions = {
            // Fast-fail configuration 
            maxRetriesPerRequest: 1, // Minimal retries
            enableReadyCheck: true,
            connectTimeout: 3000, // Reduced timeout
            commandTimeout: 3000, // Reduced command timeout
            // Remove lazyConnect - use ioredis default auto-connect
            showFriendlyErrorStack: process.env.NODE_ENV === 'development',
            enableOfflineQueue: false, // Disable offline queue to fail fast
            // Simplified retry strategy - let circuit breaker handle failures
            retryStrategy: (times: number) => {
                if (isCircuitBreakerOpen()) {
                    log('[Redis] Retry blocked by circuit breaker');
                    return null; // Stop retrying
                }
                
                // Only allow 1 retry, then fail
                if (times > 1) {
                    log('[Redis] Max retries reached, stopping');
                    return null;
                }
                
                return 50; // Short delay for single retry
            },
            ...(useTLS ? getTLSConfig() : {}),
        };

        let tempClient: Redis; // Temporary client instance for this initialization attempt
        let isResolved = false; // Track if promise is already resolved/rejected

        const cleanup = () => {
            if (clientReadyPromise) {
                clientReadyPromise = null;
            }
        };

        const handleSuccess = () => {
            if (isResolved) return;
            isResolved = true;
            
            log('[Redis] Connection successful');
            redisClient = tempClient;
            resetCircuitBreaker();
            resolve(redisClient);
        };

        const handleFailure = (error: Error) => {
            if (isResolved) return;
            isResolved = true;
            
            logError('[Redis] Connection failed:', error.message);
            tripCircuitBreaker();
            cleanup();
            
            // Clean up the failed client
            if (tempClient && tempClient.status !== 'end') {
                tempClient.disconnect();
            }
            
            reject(error);
        };

        try {
            if (redisUrl) {
                log("[Redis] initializeRedisClient: Attempting to connect using REDIS_URL...");
                tempClient = new Redis(redisUrl, redisOptions);
            } else {
                log("[Redis] initializeRedisClient: Attempting to connect using host/port: ", process.env.REDIS_HOST, process.env.REDIS_PORT);
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

            // Set up event handlers with fast-fail behavior
            tempClient.on('ready', () => {
                log('[Redis] Client ready');
                handleSuccess();
            });

            tempClient.on('connect', () => {
                log('[Redis] Client connected');
            });

            tempClient.on('reconnecting', (delay: number) => {
                log(`[Redis] Client reconnecting in ${delay}ms...`);
            });

            tempClient.on('close', () => {
                log('[Redis] Client connection closed');
                if (!isResolved) {
                    handleFailure(new Error('Redis connection closed before ready'));
                }
            });

            tempClient.on('end', () => {
                log('[Redis] Client connection ended');
                if (!isResolved) {
                    handleFailure(new Error('Redis connection ended'));
                }
                // Clear global client if it's this one
                if (redisClient === tempClient) {
                    redisClient = null;
                }
            });

            // Handle all errors to prevent unhandled error events
            tempClient.on('error', (err: RedisError) => {
                logError('[Redis] Client error:', err.message);
                
                // Fast-fail on ECONNRESET during initial connection
                if (err.code === 'ECONNRESET' && !isResolved) {
                    logError('[Redis] Connection reset during handshake - fast-failing');
                    handleFailure(err);
                    return;
                }
                
                // Don't fail on connection reset errors during normal operation
                if (err.code === 'ECONNRESET' && isResolved) {
                    log('[Redis] Connection reset during operation - will attempt reconnect');
                    return;
                }
                
                if (!isResolved) {
                    handleFailure(err);
                }
            });

            // Reduced timeout for faster failure detection
            setTimeout(() => {
                if (!isResolved) {
                    logError('[Redis] Connection timeout');
                    handleFailure(new Error('Redis connection timeout'));
                }
            }, 5000); // 5 second timeout (reduced from 10)

        } catch (err) {
            // Handle synchronous errors from Redis constructor
            const error = err instanceof Error ? err : new Error(String(err));
            logError('[Redis] Redis client creation failed:', error.message);
            handleFailure(error);
        }
    });

    return clientReadyPromise;
};

// Export a function that always returns a promise resolving to a ready client
export const getReadyRedisClient = async (): Promise<Redis> => {
    return initializeRedisClient();
};

// Optional: Function to gracefully disconnect
export const disconnectRedis = async () => {
    log('[Redis] disconnectRedis: Attempting to disconnect...');
    
    // Clear circuit breaker state
    resetCircuitBreaker();
    
    let clientToDisconnect: Redis | null = null;
    
    if (clientReadyPromise) {
        try {
            clientToDisconnect = await Promise.race([
                clientReadyPromise,
                new Promise<Redis>((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout waiting for client')), 1000)
                )
            ]);
        } catch (e) {
            logError('[Redis] disconnectRedis: Error awaiting clientReadyPromise:', e);
        }
    }
    
    if (!clientToDisconnect && redisClient) {
        clientToDisconnect = redisClient;
    }

    if (clientToDisconnect) {
        log(`[Redis] disconnectRedis: Client status before quit: ${clientToDisconnect.status}`);
        try {
            await Promise.race([
                clientToDisconnect.quit(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Quit timeout')), 2000)
                )
            ]);
            log("[Redis] disconnectRedis: Client disconnected gracefully via quit().");
        } catch (e) {
            logError("[Redis] disconnectRedis: Error during quit():", e);
            clientToDisconnect.disconnect(); 
            log("[Redis] disconnectRedis: Client forcefully disconnected via disconnect().");
        }
    } else {
        log("[Redis] disconnectRedis: No active client to disconnect.");
    }

    // Reset global state
    redisClient = null;
    clientReadyPromise = null;
    log("[Redis] disconnectRedis: Cleared redisClient and clientReadyPromise.");
};

const CACHE_TTL_SECONDS = 24 * 60 * 60; // Default 24 hours

export const setCache = async (key: string, value: any, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<void> => {
  // Check if caching is disabled
  if (process.env.DISABLE_REDIS_CACHE === 'true') {
    log(`[Redis] setCache: Caching disabled, skipping key: ${key}`);
    return;
  }

  try {
    const client = await getReadyRedisClient();
    log(`[Redis] setCache: Setting key: ${key}, TTL: ${ttlSeconds}s`);
    
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await client.setex(key, ttlSeconds, stringValue);
    log(`[Redis] setCache: Successfully set key: ${key}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`[Redis] setCache: Failed to set cache for key ${key}. Error: ${errorMessage}`);
    // Gracefully degrade - don't throw error, just log warning
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  // Check if caching is disabled
  if (process.env.DISABLE_REDIS_CACHE === 'true') {
    log(`[Redis] getCache: Caching disabled, returning null for key: ${key}`);
    return null;
  }

  try {
    const client = await getReadyRedisClient();
    log(`[Redis] getCache: Getting key: ${key}`);

    const value = await client.get(key);

    if (value) {
      log(`[Redis] getCache: Cache HIT for key: ${key}`);
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as any as T; // Return as string if not JSON
      }
    }
    log(`[Redis] getCache: Cache MISS for key: ${key}`);
    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`[Redis] getCache: Failed to get cache for key ${key}. Error: ${errorMessage}`);
    return null; // Gracefully degrade - return null instead of throwing
  }
};

// Health check function
export const checkRedisHealth = async (): Promise<boolean> => {
  // If caching is disabled, consider it "healthy" but note it
  if (process.env.DISABLE_REDIS_CACHE === 'true') {
    log('[Redis] Health check: Caching disabled, skipping health check');
    return true;
  }

  try {
    const client = await getReadyRedisClient();
    await client.ping();
    log('[Redis] Health check: OK');
    return true;
  } catch (error) {
    logError('[Redis] Health check: FAILED');
    return false;
  }
};

// Get circuit breaker status (useful for monitoring)
export const getCircuitBreakerStatus = () => {
  return {
    isOpen: circuitBreakerState.isOpen,
    failures: circuitBreakerState.failures,
    lastFailureTime: circuitBreakerState.lastFailureTime,
    nextHealthCheck: circuitBreakerState.nextHealthCheck,
  };
};