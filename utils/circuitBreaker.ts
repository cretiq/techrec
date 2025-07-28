// Circuit Breaker Pattern Implementation
// Provides protection against cascade failures for external API calls (GitHub, Gemini)

// Cache interface - implementation provided by environment (server vs client)
interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
}

// In-memory cache for client-side fallback
class MemoryCache implements CacheProvider {
  private cache = new Map<string, { value: any; expiry: number }>();
  
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: any, ttl = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }
}

// Environment-safe cache provider
const getCacheProvider = (): CacheProvider => {
  // Server-side: use Redis (through dynamic import to avoid client-side bundling)
  if (typeof window === 'undefined') {
    // This will be dynamically loaded on server-side only
    return {
      async get<T>(key: string): Promise<T | null> {
        try {
          const { getCache } = await import('@/lib/redis');
          return await getCache<T>(key);
        } catch (error) {
          // Graceful fallback if Redis unavailable
          return null;
        }
      },
      async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
          const { setCache } = await import('@/lib/redis');
          await setCache(key, value, ttl);
        } catch (error) {
          // Graceful fallback if Redis unavailable - no-op
        }
      }
    };
  }
  
  // Client-side: use memory cache
  return new MemoryCache();
};

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service is back
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  recoveryTimeout: number;       // Time to wait before attempting recovery (ms)
  monitoringWindow: number;      // Time window for failure tracking (ms)
  halfOpenMaxCalls: number;      // Max calls to test in half-open state
  successThreshold: number;      // Consecutive successes needed to close circuit
}

// Default configurations for different services
export const DEFAULT_CONFIGS: Record<string, CircuitBreakerConfig> = {
  github: {
    failureThreshold: 5,
    recoveryTimeout: 30000,      // 30 seconds
    monitoringWindow: 60000,     // 1 minute
    halfOpenMaxCalls: 3,
    successThreshold: 2
  },
  gemini: {
    failureThreshold: 3,
    recoveryTimeout: 60000,      // 1 minute
    monitoringWindow: 120000,    // 2 minutes
    halfOpenMaxCalls: 2,
    successThreshold: 2
  },
  default: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    monitoringWindow: 60000,
    halfOpenMaxCalls: 3,
    successThreshold: 2
  }
};

// Circuit breaker state data
interface CircuitBreakerData {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  halfOpenAttempts: number;
  consecutiveSuccesses: number;
  totalCalls: number;
  totalFailures: number;
  updatedAt: number;
}

// Circuit breaker result
export interface CircuitBreakerResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  circuitState: CircuitBreakerState;
  fromCache?: boolean;
  executionTime?: number;
}

// Debug logging
const DEBUG_CIRCUIT_BREAKER = process.env.NODE_ENV === 'development' || process.env.DEBUG_CIRCUIT_BREAKER === 'true';

const debugLog = (service: string, message: string, data?: any) => {
  if (DEBUG_CIRCUIT_BREAKER) {
    console.log(`[CircuitBreaker:${service}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker {
  private service: string;
  private config: CircuitBreakerConfig;
  private cacheKey: string;
  private cacheProvider: CacheProvider;

  constructor(service: string, config?: Partial<CircuitBreakerConfig>) {
    this.service = service;
    this.config = { ...DEFAULT_CONFIGS[service] || DEFAULT_CONFIGS.default, ...config };
    this.cacheKey = `circuit-breaker:${service}`;
    this.cacheProvider = getCacheProvider();
    
    debugLog(service, 'Circuit breaker initialized', this.config);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();
    
    try {
      // Get current circuit state
      const circuitData = await this.getCircuitData();
      
      // Check if circuit is open
      if (circuitData.state === CircuitBreakerState.OPEN) {
        debugLog(this.service, 'Circuit is OPEN, failing fast');
        
        // Check if recovery timeout has passed
        if (Date.now() - circuitData.lastFailureTime > this.config.recoveryTimeout) {
          debugLog(this.service, 'Recovery timeout passed, transitioning to HALF_OPEN');
          await this.transitionToHalfOpen(circuitData);
        } else {
          // Fail fast
          const error = new Error(`Circuit breaker is OPEN for ${this.service}`);
          return {
            success: false,
            error,
            circuitState: CircuitBreakerState.OPEN,
            executionTime: Date.now() - startTime
          };
        }
      }

      // Check if circuit is half-open and we've exceeded max calls
      if (circuitData.state === CircuitBreakerState.HALF_OPEN && 
          circuitData.halfOpenAttempts >= this.config.halfOpenMaxCalls) {
        debugLog(this.service, 'HALF_OPEN max calls exceeded, failing fast');
        const error = new Error(`Circuit breaker is HALF_OPEN with max calls exceeded for ${this.service}`);
        return {
          success: false,
          error,
          circuitState: CircuitBreakerState.HALF_OPEN,
          executionTime: Date.now() - startTime
        };
      }

      // Execute the function
      debugLog(this.service, `Executing function (state: ${circuitData.state})`);
      
      // Update call count
      if (circuitData.state === CircuitBreakerState.HALF_OPEN) {
        circuitData.halfOpenAttempts++;
        await this.updateCircuitData(circuitData);
      }

      const result = await fn();
      
      // Record success
      await this.recordSuccess(circuitData);
      
      debugLog(this.service, 'Function executed successfully');
      return {
        success: true,
        data: result,
        circuitState: circuitData.state,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      debugLog(this.service, 'Function execution failed', error);
      
      // Record failure
      const circuitData = await this.getCircuitData();
      await this.recordFailure(circuitData, error as Error);
      
      // Try fallback if available
      if (fallback) {
        try {
          debugLog(this.service, 'Attempting fallback');
          const fallbackResult = await fallback();
          return {
            success: true,
            data: fallbackResult,
            circuitState: circuitData.state,
            fromCache: true,
            executionTime: Date.now() - startTime
          };
        } catch (fallbackError) {
          debugLog(this.service, 'Fallback also failed', fallbackError);
        }
      }

      return {
        success: false,
        error: error as Error,
        circuitState: circuitData.state,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get current circuit breaker data
   */
  private async getCircuitData(): Promise<CircuitBreakerData> {
    try {
      const cached = await this.cacheProvider.get<CircuitBreakerData>(this.cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      debugLog(this.service, 'Error getting circuit data from cache', error);
    }

    // Return default state
    return {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
      lastFailureTime: 0,
      lastSuccessTime: Date.now(),
      halfOpenAttempts: 0,
      consecutiveSuccesses: 0,
      totalCalls: 0,
      totalFailures: 0,
      updatedAt: Date.now()
    };
  }

  /**
   * Update circuit breaker data
   */
  private async updateCircuitData(data: CircuitBreakerData): Promise<void> {
    try {
      data.updatedAt = Date.now();
      await this.cacheProvider.set(this.cacheKey, data, this.config.monitoringWindow / 1000);
    } catch (error) {
      debugLog(this.service, 'Error updating circuit data', error);
    }
  }

  /**
   * Record a successful execution
   */
  private async recordSuccess(circuitData: CircuitBreakerData): Promise<void> {
    circuitData.lastSuccessTime = Date.now();
    circuitData.consecutiveSuccesses++;
    circuitData.totalCalls++;

    if (circuitData.state === CircuitBreakerState.HALF_OPEN) {
      if (circuitData.consecutiveSuccesses >= this.config.successThreshold) {
        debugLog(this.service, 'Success threshold reached, closing circuit');
        circuitData.state = CircuitBreakerState.CLOSED;
        circuitData.failureCount = 0;
        circuitData.halfOpenAttempts = 0;
      }
    }

    await this.updateCircuitData(circuitData);
  }

  /**
   * Record a failed execution
   */
  private async recordFailure(circuitData: CircuitBreakerData, error: Error): Promise<void> {
    circuitData.lastFailureTime = Date.now();
    circuitData.failureCount++;
    circuitData.totalFailures++;
    circuitData.totalCalls++;
    circuitData.consecutiveSuccesses = 0;

    // Check if we should open the circuit
    if (circuitData.state === CircuitBreakerState.CLOSED && 
        circuitData.failureCount >= this.config.failureThreshold) {
      debugLog(this.service, 'Failure threshold reached, opening circuit');
      circuitData.state = CircuitBreakerState.OPEN;
    } else if (circuitData.state === CircuitBreakerState.HALF_OPEN) {
      debugLog(this.service, 'Failure in HALF_OPEN state, reopening circuit');
      circuitData.state = CircuitBreakerState.OPEN;
      circuitData.halfOpenAttempts = 0;
    }

    await this.updateCircuitData(circuitData);
  }

  /**
   * Transition to half-open state
   */
  private async transitionToHalfOpen(circuitData: CircuitBreakerData): Promise<void> {
    circuitData.state = CircuitBreakerState.HALF_OPEN;
    circuitData.halfOpenAttempts = 0;
    circuitData.consecutiveSuccesses = 0;
    await this.updateCircuitData(circuitData);
  }

  /**
   * Get circuit breaker status
   */
  async getStatus(): Promise<{
    state: CircuitBreakerState;
    failureCount: number;
    totalCalls: number;
    totalFailures: number;
    successRate: number;
    lastFailureTime: number;
    lastSuccessTime: number;
  }> {
    const data = await this.getCircuitData();
    const successRate = data.totalCalls > 0 ? 
      ((data.totalCalls - data.totalFailures) / data.totalCalls) * 100 : 100;

    return {
      state: data.state,
      failureCount: data.failureCount,
      totalCalls: data.totalCalls,
      totalFailures: data.totalFailures,
      successRate,
      lastFailureTime: data.lastFailureTime,
      lastSuccessTime: data.lastSuccessTime
    };
  }

  /**
   * Reset circuit breaker (for admin use)
   */
  async reset(): Promise<void> {
    debugLog(this.service, 'Resetting circuit breaker');
    const data: CircuitBreakerData = {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
      lastFailureTime: 0,
      lastSuccessTime: Date.now(),
      halfOpenAttempts: 0,
      consecutiveSuccesses: 0,
      totalCalls: 0,
      totalFailures: 0,
      updatedAt: Date.now()
    };
    await this.updateCircuitData(data);
  }
}

// Pre-configured circuit breakers
export const githubCircuitBreaker = new CircuitBreaker('github');
export const geminiCircuitBreaker = new CircuitBreaker('gemini');

// Utility function to create service-specific circuit breakers
export const createCircuitBreaker = (
  service: string, 
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker => {
  return new CircuitBreaker(service, config);
};

// Circuit breaker health check
export const getCircuitBreakerHealth = async (): Promise<{
  github: any;
  gemini: any;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}> => {
  const [githubStatus, geminiStatus] = await Promise.all([
    githubCircuitBreaker.getStatus(),
    geminiCircuitBreaker.getStatus()
  ]);

  const isHealthy = (status: any) => 
    status.state === CircuitBreakerState.CLOSED && status.successRate > 80;

  const githubHealthy = isHealthy(githubStatus);
  const geminiHealthy = isHealthy(geminiStatus);

  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (!githubHealthy && !geminiHealthy) {
    overall = 'unhealthy';
  } else if (!githubHealthy || !geminiHealthy) {
    overall = 'degraded';
  }

  return {
    github: githubStatus,
    gemini: geminiStatus,
    overall
  };
};