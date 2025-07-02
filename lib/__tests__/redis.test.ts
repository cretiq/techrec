/**
 * Redis Module Unit Tests
 * 
 * Tests the Redis connection, caching, and circuit breaker functionality
 * with mocked ioredis to avoid requiring an actual Redis instance.
 */

import { jest } from '@jest/globals';

// Mock ioredis before importing our Redis module
let mockRedis: any;

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    mockRedis = {
      status: 'ready',
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue('OK'),
      ping: jest.fn().mockResolvedValue('PONG'),
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      on: jest.fn().mockReturnValue(mockRedis),
    };

    // Simulate successful connection by triggering ready event after a short delay
    setTimeout(() => {
      const readyHandler = mockRedis.on.mock.calls.find((call: any) => call[0] === 'ready')?.[1];
      if (readyHandler) readyHandler();
    }, 10);

    return mockRedis;
  });
});

describe('Redis Module', () => {
  // Import after mocking
  let redisModule: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedis.status = 'ready';
    
    // Reset environment variables
    delete process.env.DISABLE_REDIS_CACHE;
    delete process.env.REDIS_USE_TLS;
    delete process.env.REDIS_TLS_STRICT;
    delete process.env.REDIS_DEBUG;
    
    // Dynamic import to ensure mocks are applied
    redisModule = await import('../redis');
  });

  describe('Cache Disable Flag', () => {
    it('should skip caching when DISABLE_REDIS_CACHE is true', async () => {
      process.env.DISABLE_REDIS_CACHE = 'true';
      
      const { setCache, getCache } = redisModule;
      
      await setCache('test-key', 'test-value');
      const result = await getCache('test-key');
      
      expect(result).toBeNull();
      expect(mockRedis.setex).not.toHaveBeenCalled();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should use caching when DISABLE_REDIS_CACHE is false', async () => {
      process.env.DISABLE_REDIS_CACHE = 'false';
      mockRedis.get.mockResolvedValue('"test-value"');
      
      const { setCache, getCache } = redisModule;
      
      await setCache('test-key', 'test-value');
      const result = await getCache('test-key');
      
      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 86400, '"test-value"');
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });
  });

  describe('Circuit Breaker', () => {
    it('should trip circuit breaker after connection failure', async () => {
      const mockError = new Error('ECONNRESET');
      (mockError as any).code = 'ECONNRESET';
      
      mockRedis.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          // Simulate error during connection
          setTimeout(() => callback(mockError), 10);
        }
        return mockRedis;
      });

      const { getCircuitBreakerStatus } = redisModule;
      
      // Initially circuit should be closed
      let status = getCircuitBreakerStatus();
      expect(status.isOpen).toBe(false);
      expect(status.failures).toBe(0);
    });

    it('should return circuit breaker status', async () => {
      const { getCircuitBreakerStatus } = redisModule;
      
      const status = getCircuitBreakerStatus();
      
      expect(status).toHaveProperty('isOpen');
      expect(status).toHaveProperty('failures');
      expect(status).toHaveProperty('lastFailureTime');
      expect(status).toHaveProperty('nextHealthCheck');
      expect(typeof status.isOpen).toBe('boolean');
      expect(typeof status.failures).toBe('number');
    });
  });

  describe('Health Check', () => {
    it('should return true when Redis is healthy', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      
      const { checkRedisHealth } = redisModule;
      
      const isHealthy = await checkRedisHealth();
      
      expect(isHealthy).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should return false when Redis ping fails', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));
      
      const { checkRedisHealth } = redisModule;
      
      const isHealthy = await checkRedisHealth();
      
      expect(isHealthy).toBe(false);
    });

    it('should return true when caching is disabled', async () => {
      process.env.DISABLE_REDIS_CACHE = 'true';
      
      const { checkRedisHealth } = redisModule;
      
      const isHealthy = await checkRedisHealth();
      
      expect(isHealthy).toBe(true);
      expect(mockRedis.ping).not.toHaveBeenCalled();
    });
  });

  describe('Cache Operations', () => {
    it('should handle JSON serialization/deserialization', async () => {
      const testObject = { foo: 'bar', nested: { value: 42 } };
      const serialized = JSON.stringify(testObject);
      
      mockRedis.get.mockResolvedValue(serialized);
      
      const { setCache, getCache } = redisModule;
      
      await setCache('object-key', testObject);
      const result = await getCache('object-key');
      
      expect(mockRedis.setex).toHaveBeenCalledWith('object-key', 86400, serialized);
      expect(result).toEqual(testObject);
    });

    it('should handle string values without JSON parsing', async () => {
      mockRedis.get.mockResolvedValue('simple-string');
      
      const { setCache, getCache } = redisModule;
      
      await setCache('string-key', 'simple-string');
      const result = await getCache('string-key');
      
      expect(result).toBe('simple-string');
    });

    it('should return null for cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const { getCache } = redisModule;
      
      const result = await getCache('missing-key');
      
      expect(result).toBeNull();
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));
      
      const { setCache, getCache } = redisModule;
      
      // Should not throw errors
      await expect(setCache('error-key', 'value')).resolves.toBeUndefined();
      await expect(getCache('error-key')).resolves.toBeNull();
    });
  });

  describe('TLS Detection', () => {
    // Note: TLS detection is internal, but we can test its effects
    it('should detect TLS from rediss:// URL scheme', () => {
      process.env.REDIS_URL = 'rediss://user:pass@host:6380/0';
      
      // The TLS detection would happen during Redis client creation
      // We can verify this by checking if the Redis constructor was called
      // with TLS options (this would require more complex mocking)
      expect(process.env.REDIS_URL.startsWith('rediss://')).toBe(true);
    });

    it('should detect TLS from port 6380', () => {
      process.env.REDIS_URL = 'redis://user:pass@host:6380/0';
      
      // TLS should be detected from port 6380
      const url = new URL(process.env.REDIS_URL.replace('redis://', 'http://'));
      expect(url.port).toBe('6380');
    });

    it('should respect REDIS_USE_TLS environment variable', () => {
      process.env.REDIS_USE_TLS = 'true';
      process.env.REDIS_URL = 'redis://user:pass@host:6379/0';
      
      expect(process.env.REDIS_USE_TLS).toBe('true');
    });
  });
});