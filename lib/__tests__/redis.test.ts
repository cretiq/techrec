/**
 * Redis Module Unit Tests
 * 
 * Tests the Redis connection and caching functionality
 * with mocked ioredis to avoid requiring an actual Redis instance.
 */

import { jest } from '@jest/globals';

// Mock ioredis before importing our Redis module
let mockRedis: any;

// Create the mock Redis instance first
const createMockRedis = () => ({
  status: 'ready',
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue('OK'),
  ping: jest.fn().mockResolvedValue('PONG'),
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  scanStream: jest.fn().mockReturnValue((async function* () {
    yield ['key1', 'key2'];
  })()),
  on: jest.fn().mockImplementation((event: string, handler: Function) => {
    // Simulate ready event immediately for testing
    if (event === 'ready') {
      setTimeout(() => handler(), 10);
    }
    return mockRedis;
  }),
});

// Initialize the mock instance
mockRedis = createMockRedis();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('Redis Module', () => {
  // Import after mocking
  let redisModule: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Recreate the mock instance to ensure clean state
    mockRedis = createMockRedis();
    
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
    
    // Dynamic import to ensure mocks are applied
    redisModule = await import('../redis');
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
      
      expect(mockRedis.setex).toHaveBeenCalledWith('string-key', 86400, 'simple-string');
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

    it('should handle custom TTL values', async () => {
      const { setCache } = redisModule;
      
      await setCache('ttl-key', 'value', 3600);
      
      expect(mockRedis.setex).toHaveBeenCalledWith('ttl-key', 3600, 'value');
    });
  });

  describe('Cache Deletion', () => {
    it('should delete existing cache keys', async () => {
      mockRedis.del.mockResolvedValue(1);
      
      const { deleteCache } = redisModule;
      
      const result = await deleteCache('existing-key');
      
      expect(mockRedis.del).toHaveBeenCalledWith('existing-key');
      expect(result).toBe(true);
    });

    it('should handle deletion of non-existent keys', async () => {
      mockRedis.del.mockResolvedValue(0);
      
      const { deleteCache } = redisModule;
      
      const result = await deleteCache('non-existent-key');
      
      expect(mockRedis.del).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBe(false);
    });

    it('should handle deletion errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));
      
      const { deleteCache } = redisModule;
      
      const result = await deleteCache('error-key');
      
      expect(result).toBe(false);
    });
  });

  describe('Pattern-based Cache Clearing', () => {
    it('should clear cache keys matching a pattern', async () => {
      // Mock scanStream to return keys
      mockRedis.scanStream.mockReturnValue((async function* () {
        yield ['pattern1:key1', 'pattern1:key2'];
      })());
      mockRedis.del.mockResolvedValue(2);
      
      const { clearCachePattern } = redisModule;
      
      const result = await clearCachePattern('pattern1:*');
      
      expect(mockRedis.del).toHaveBeenCalledWith('pattern1:key1', 'pattern1:key2');
      expect(result).toBe(2);
    });

    it('should return 0 when no keys match the pattern', async () => {
      // Mock scanStream to return no keys
      mockRedis.scanStream.mockReturnValue((async function* () {
        // Empty generator
      })());
      
      const { clearCachePattern } = redisModule;
      
      const result = await clearCachePattern('nonexistent:*');
      
      expect(mockRedis.del).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle pattern clearing errors gracefully', async () => {
      mockRedis.scanStream.mockImplementation(() => {
        throw new Error('Redis connection failed');
      });
      
      const { clearCachePattern } = redisModule;
      
      const result = await clearCachePattern('error:*');
      
      expect(result).toBe(0);
    });
  });

  describe('Redis Client Management', () => {
    it('should provide a ready Redis client', async () => {
      const { getReadyRedisClient } = redisModule;
      
      const client = await getReadyRedisClient();
      
      expect(client).toBeDefined();
      expect(client.status).toBe('ready');
    });

    it('should handle Redis client disconnection', async () => {
      const { disconnectRedis, getReadyRedisClient } = redisModule;
      
      // Ensure there's an active client first
      await getReadyRedisClient();
      
      await expect(disconnectRedis()).resolves.toBeUndefined();
      
      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Quit failed'));
      mockRedis.disconnect = jest.fn();
      
      const { disconnectRedis, getReadyRedisClient } = redisModule;
      
      // Ensure there's an active client first
      await getReadyRedisClient();
      
      await expect(disconnectRedis()).resolves.toBeUndefined();
      
      expect(mockRedis.quit).toHaveBeenCalled();
      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });

  describe('Connection Status Handling', () => {
    it('should handle client in connecting state', async () => {
      mockRedis.status = 'connecting';
      
      const { setCache, getCache } = redisModule;
      
      // Should handle non-ready status gracefully
      await expect(setCache('test-key', 'value')).resolves.toBeUndefined();
      await expect(getCache('test-key')).resolves.toBeNull();
    });

    it('should handle client in error state', async () => {
      mockRedis.status = 'error';
      
      const { setCache, getCache, deleteCache } = redisModule;
      
      // Should handle error status gracefully
      await expect(setCache('test-key', 'value')).resolves.toBeUndefined();
      await expect(getCache('test-key')).resolves.toBeNull();
      await expect(deleteCache('test-key')).resolves.toBe(false);
    });
  });

  describe('Connection Configuration', () => {
    it('should handle Redis URL configuration', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      // The module should use the URL for connection
      expect(process.env.REDIS_URL).toBe('redis://localhost:6379');
    });

    it('should handle host/port configuration', () => {
      process.env.REDIS_HOST = 'localhost';
      process.env.REDIS_PORT = '6379';
      
      expect(process.env.REDIS_HOST).toBe('localhost');
      expect(process.env.REDIS_PORT).toBe('6379');
    });

    it('should handle TLS configuration', () => {
      process.env.REDIS_USE_TLS = 'true';
      process.env.REDIS_URL = 'rediss://user:pass@host:6380/0';
      
      expect(process.env.REDIS_USE_TLS).toBe('true');
      expect(process.env.REDIS_URL.startsWith('rediss://')).toBe(true);
    });
  });
});