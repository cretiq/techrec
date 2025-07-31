import { clearCachePattern, deleteCache } from '../redis';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis');

const mockRedisInstance = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  scanStream: jest.fn(),
  status: 'ready',
  quit: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
};

const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

describe('Redis Cache Clearing Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedRedis.mockImplementation(() => mockRedisInstance as any);
  });

  describe('deleteCache', () => {
    it('should delete a single cache key successfully', async () => {
      mockRedisInstance.del.mockResolvedValue(1); // 1 key deleted

      const result = await deleteCache('test-key');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisInstance.del.mockResolvedValue(0); // 0 keys deleted

      const result = await deleteCache('non-existent-key');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBe(false);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('Redis connection failed'));

      const result = await deleteCache('test-key');

      expect(result).toBe(false);
    });

    it('should handle client not ready state', async () => {
      mockRedisInstance.status = 'connecting';

      const result = await deleteCache('test-key');

      expect(result).toBe(false);
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });
  });

  describe('clearCachePattern', () => {
    it('should clear cache keys matching pattern successfully', async () => {
      // Mock SCAN stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield ['key1:test', 'key2:test'];
          yield ['key3:test'];
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);
      mockRedisInstance.del.mockResolvedValue(3); // 3 keys deleted

      const result = await clearCachePattern('*:test');

      expect(mockRedisInstance.scanStream).toHaveBeenCalledWith({ match: '*:test' });
      expect(mockRedisInstance.del).toHaveBeenCalledWith('key1:test', 'key2:test', 'key3:test');
      expect(result).toBe(3);
    });

    it('should return 0 when no keys match pattern', async () => {
      // Mock empty SCAN stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          // No keys yielded
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);

      const result = await clearCachePattern('non-existent:*');

      expect(mockRedisInstance.scanStream).toHaveBeenCalledWith({ match: 'non-existent:*' });
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle complex cache patterns correctly', async () => {
      const testPatterns = [
        'user_profile:user123*',
        'cv_count:user123*',
        'leaderboard:*',
        'cv-analysis:cv456*',
        'cover-letter:*user123*'
      ];

      for (const pattern of testPatterns) {
        // Mock different keys for each pattern
        const mockStream = {
          [Symbol.asyncIterator]: async function* () {
            yield [`match1:${pattern}`, `match2:${pattern}`];
          }
        };
        mockRedisInstance.scanStream.mockReturnValue(mockStream);
        mockRedisInstance.del.mockResolvedValue(2);

        const result = await clearCachePattern(pattern);

        expect(mockRedisInstance.scanStream).toHaveBeenCalledWith({ match: pattern });
        expect(result).toBe(2);
      }
    });

    it('should handle Redis SCAN errors gracefully', async () => {
      mockRedisInstance.scanStream.mockImplementation(() => {
        throw new Error('SCAN operation failed');
      });

      const result = await clearCachePattern('error:*');

      expect(result).toBe(0);
    });

    it('should handle Redis DEL errors after successful SCAN', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield ['key1', 'key2'];
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);
      mockRedisInstance.del.mockRejectedValue(new Error('DEL operation failed'));

      const result = await clearCachePattern('test:*');

      expect(mockRedisInstance.scanStream).toHaveBeenCalled();
      expect(mockRedisInstance.del).toHaveBeenCalledWith('key1', 'key2');
      expect(result).toBe(0);
    });

    it('should handle large numbers of keys efficiently', async () => {
      // Mock a large number of keys
      const largeKeySet = Array.from({ length: 1000 }, (_, i) => `large-key-${i}`);
      
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          // Yield in chunks like Redis SCAN would
          for (let i = 0; i < largeKeySet.length; i += 100) {
            yield largeKeySet.slice(i, i + 100);
          }
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);
      mockRedisInstance.del.mockResolvedValue(1000);

      const result = await clearCachePattern('large-key-*');

      expect(mockRedisInstance.del).toHaveBeenCalledWith(...largeKeySet);
      expect(result).toBe(1000);
    });

    it('should handle client not ready state during pattern clearing', async () => {
      mockRedisInstance.status = 'connecting';

      const result = await clearCachePattern('test:*');

      expect(result).toBe(0);
      expect(mockRedisInstance.scanStream).not.toHaveBeenCalled();
    });
  });

  describe('CV Deletion Cache Clearing Integration', () => {
    it('should clear all expected cache patterns for CV deletion', async () => {
      const cvId = 'cv-123';
      const developerId = 'user-456';
      
      const expectedPatterns = [
        `user_profile:${developerId}*`,
        `cv_count:${developerId}*`,
        `app_stats:${developerId}*`,
        `badge_eval_batch:${developerId}*`,
        `leaderboard:*`,
        `cv-analysis:${cvId}*`,
        `cv-improvement:${cvId}*`,
        `cover-letter:*${developerId}*`,
        `outreach-message:*${developerId}*`
      ];

      // Mock successful clearing for each pattern
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield ['test-key-1', 'test-key-2'];
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);
      mockRedisInstance.del.mockResolvedValue(2);

      // Clear each pattern
      let totalCleared = 0;
      for (const pattern of expectedPatterns) {
        const cleared = await clearCachePattern(pattern);
        totalCleared += cleared;
      }

      expect(totalCleared).toBe(expectedPatterns.length * 2); // 2 keys per pattern
      expect(mockRedisInstance.scanStream).toHaveBeenCalledTimes(expectedPatterns.length);
      
      // Verify each pattern was called
      expectedPatterns.forEach(pattern => {
        expect(mockRedisInstance.scanStream).toHaveBeenCalledWith({ match: pattern });
      });
    });

    it('should handle partial cache clearing failures gracefully', async () => {
      const patterns = ['pattern1:*', 'pattern2:*', 'pattern3:*'];
      
      // Mock first pattern succeeds, second fails, third succeeds
      mockRedisInstance.scanStream
        .mockReturnValueOnce({
          [Symbol.asyncIterator]: async function* () {
            yield ['key1'];
          }
        })
        .mockImplementationOnce(() => {
          throw new Error('SCAN failed');
        })
        .mockReturnValueOnce({
          [Symbol.asyncIterator]: async function* () {
            yield ['key3'];
          }
        });
      
      mockRedisInstance.del.mockResolvedValue(1);

      const results = [];
      for (const pattern of patterns) {
        const result = await clearCachePattern(pattern);
        results.push(result);
      }

      expect(results).toEqual([1, 0, 1]); // Success, failure, success
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle Redis client initialization failure', async () => {
      MockedRedis.mockImplementation(() => {
        throw new Error('Redis client creation failed');
      });

      const result = await deleteCache('test-key');
      expect(result).toBe(false);
    });

    it('should handle undefined or null keys gracefully', async () => {
      const result1 = await deleteCache(undefined as any);
      const result2 = await deleteCache(null as any);
      const result3 = await clearCachePattern(undefined as any);
      const result4 = await clearCachePattern(null as any);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(0);
      expect(result4).toBe(0);
    });

    it('should handle empty string patterns', async () => {
      const result1 = await deleteCache('');
      const result2 = await clearCachePattern('');

      expect(result1).toBe(false);
      expect(result2).toBe(0);
    });

    it('should handle very long cache keys and patterns', async () => {
      const longKey = 'a'.repeat(1000);
      const longPattern = 'b'.repeat(1000) + '*';

      mockRedisInstance.del.mockResolvedValue(1);
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield [longKey];
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);

      const result1 = await deleteCache(longKey);
      const result2 = await clearCachePattern(longPattern);

      expect(result1).toBe(true);
      expect(result2).toBe(1);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle memory-efficient stream processing', async () => {
      // Simulate processing large number of keys in batches
      const batchSize = 100;
      const totalKeys = 10000;
      const batches = Math.ceil(totalKeys / batchSize);

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (let i = 0; i < batches; i++) {
            const batch = Array.from(
              { length: Math.min(batchSize, totalKeys - i * batchSize) },
              (_, j) => `batch-${i}-key-${j}`
            );
            yield batch;
          }
        }
      };
      mockRedisInstance.scanStream.mockReturnValue(mockStream);
      mockRedisInstance.del.mockResolvedValue(totalKeys);

      const result = await clearCachePattern('batch-*');

      expect(result).toBe(totalKeys);
      expect(mockRedisInstance.del).toHaveBeenCalledTimes(1);
    });
  });
});