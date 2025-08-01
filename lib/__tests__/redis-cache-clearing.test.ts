/**
 * Redis Cache Clearing Functions Unit Tests
 * 
 * Tests the Redis cache clearing functionality with proper mocking
 */

import { jest } from '@jest/globals';

// Mock ioredis before importing our Redis module
let mockRedis: any;

// Create the mock Redis instance
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

describe('Redis Cache Clearing Functions', () => {
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

  describe('deleteCache', () => {
    it('should delete a single cache key successfully', async () => {
      mockRedis.del.mockResolvedValue(1); // 1 key deleted

      const { deleteCache } = redisModule;
      const result = await deleteCache('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0); // 0 keys deleted

      const { deleteCache } = redisModule;
      const result = await deleteCache('non-existent-key');

      expect(mockRedis.del).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBe(false);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      const { deleteCache } = redisModule;
      const result = await deleteCache('test-key');

      expect(result).toBe(false);
    });

    it('should handle client not ready status', async () => {
      mockRedis.status = 'connecting';

      const { deleteCache } = redisModule;
      const result = await deleteCache('test-key');

      expect(result).toBe(false);
    });
  });

  describe('clearCachePattern', () => {
    it('should clear multiple cache keys matching pattern', async () => {
      const mockKeys = ['user:123', 'user:456', 'user:789'];
      
      // Mock scanStream to return keys
      mockRedis.scanStream.mockReturnValue((async function* () {
        yield mockKeys;
      })());
      mockRedis.del.mockResolvedValue(3);

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('user:*');

      expect(mockRedis.del).toHaveBeenCalledWith(...mockKeys);
      expect(result).toBe(3);
    });

    it('should return 0 when no keys match pattern', async () => {
      // Mock scanStream to return no keys
      mockRedis.scanStream.mockReturnValue((async function* () {
        // Empty generator
      })());

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('nonexistent:*');

      expect(mockRedis.del).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle scanStream errors gracefully', async () => {
      mockRedis.scanStream.mockImplementation(() => {
        throw new Error('Scan failed');
      });

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('error:*');

      expect(result).toBe(0);
    });

    it('should handle del operation errors gracefully', async () => {
      mockRedis.scanStream.mockReturnValue((async function* () {
        yield ['key1', 'key2'];
      })());
      mockRedis.del.mockRejectedValue(new Error('Delete failed'));

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('test:*');

      expect(result).toBe(0);
    });

    it('should handle client not ready status', async () => {
      mockRedis.status = 'error';

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('test:*');

      expect(result).toBe(0);
    });

    it('should handle large batch of keys efficiently', async () => {
      // Generate a large batch of keys
      const largeBatch = Array.from({ length: 1000 }, (_, i) => `batch:${i}`);
      
      mockRedis.scanStream.mockReturnValue((async function* () {
        // Yield keys in chunks to simulate real scanStream behavior
        for (let i = 0; i < largeBatch.length; i += 100) {
          yield largeBatch.slice(i, i + 100);
        }
      })());
      mockRedis.del.mockResolvedValue(1000);

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('batch:*');

      expect(mockRedis.del).toHaveBeenCalledWith(...largeBatch);
      expect(result).toBe(1000);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle mixed success/failure scenarios', async () => {
      // First pattern succeeds
      mockRedis.scanStream
        .mockReturnValueOnce((async function* () {
          yield ['success:1', 'success:2'];
        })())
        .mockReturnValueOnce((async function* () {
          yield ['partial:1', 'partial:2'];
        })());
      
      mockRedis.del
        .mockResolvedValueOnce(2) // First call succeeds
        .mockRejectedValueOnce(new Error('Partial failure')); // Second call fails

      const { clearCachePattern } = redisModule;
      
      const result1 = await clearCachePattern('success:*');
      const result2 = await clearCachePattern('partial:*');

      expect(result1).toBe(2);
      expect(result2).toBe(0);
    });

    it('should handle async iterator edge cases', async () => {
      // Mock empty async iterator
      mockRedis.scanStream.mockReturnValue((async function* () {
        // Async iterator that yields nothing
        return;
      })());

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('empty:*');

      expect(result).toBe(0);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should handle special pattern characters', async () => {
      const specialKeys = ['user[123]', 'user{456}', 'user*789'];
      
      mockRedis.scanStream.mockReturnValue((async function* () {
        yield specialKeys;
      })());
      mockRedis.del.mockResolvedValue(3);

      const { clearCachePattern } = redisModule;
      const result = await clearCachePattern('user*');

      expect(result).toBe(3);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle temporary network failures', async () => {
      // Simulate network failure then recovery
      mockRedis.scanStream
        .mockImplementationOnce(() => {
          throw new Error('Network timeout');
        })
        .mockReturnValueOnce((async function* () {
          yield ['recovered:1', 'recovered:2'];
        })());
      
      mockRedis.del.mockResolvedValue(2);

      const { clearCachePattern } = redisModule;
      
      // First call should fail
      const result1 = await clearCachePattern('network:*');
      expect(result1).toBe(0);
      
      // Second call should succeed
      const result2 = await clearCachePattern('recovered:*');
      expect(result2).toBe(2);
    });

    it('should handle input parameters as provided to Redis', async () => {
      const { deleteCache, clearCachePattern } = redisModule;

      // Reset mocks for this test
      mockRedis.del.mockResolvedValue(1);
      mockRedis.scanStream
        .mockReturnValueOnce((async function* () {
          yield ['key1', 'key2'];
        })())
        .mockReturnValueOnce((async function* () {
          yield ['key3', 'key4'];
        })());
      
      const result1 = await deleteCache(undefined as any);
      const result2 = await deleteCache(null as any);
      const result3 = await clearCachePattern(undefined as any);
      const result4 = await clearCachePattern(null as any);

      // Redis operations succeed - deleteCache returns true, clearCachePattern returns count
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(1); // Returns del result
      expect(result4).toBe(1); // Returns del result
    });

    it('should handle empty string inputs', async () => {
      const { deleteCache, clearCachePattern } = redisModule;

      // Reset mocks for this test
      mockRedis.del.mockResolvedValue(1);
      mockRedis.scanStream.mockReturnValue((async function* () {
        yield ['empty1', 'empty2'];
      })());

      const result1 = await deleteCache('');
      const result2 = await clearCachePattern('');

      expect(result1).toBe(true);
      expect(result2).toBe(1); // Returns del result, not count of yielded keys
    });
  });
});