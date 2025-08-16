import { PointsManager } from '@/lib/gamification/pointsManager'
import { SubscriptionTier, PointsSpendType } from '@prisma/client'
import { mockUser, subscriptionTiers, errorScenarios } from '../fixtures/testData'
import { prismaMock, setupSuccessfulPointsDeduction, setupInsufficientPoints } from '../mocks/prismaMock'

// Mock configService
jest.mock('@/utils/configService', () => ({
  configService: {
    getPointsCost: jest.fn(),
    getSubscriptionTier: jest.fn(),
  }
}))

import { configService } from '@/utils/configService'

describe('PointsManager - Core Logic', () => {
  const mockConfigService = configService as jest.Mocked<typeof configService>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default config responses
    mockConfigService.getPointsCost.mockImplementation((action: PointsSpendType) => {
      const costs = {
        JOB_QUERY: 1,
        COVER_LETTER: 5,
        OUTREACH_MESSAGE: 3,
        CV_SUGGESTION: 2,
        BULK_APPLICATION: 10,
        PREMIUM_ANALYSIS: 15,
        ADVANCED_SEARCH: 2
      }
      return Promise.resolve(costs[action] || 1)
    })

    mockConfigService.getSubscriptionTier.mockImplementation((tier: SubscriptionTier) => {
      return Promise.resolve(subscriptionTiers[tier])
    })
  })

  describe('calculateAvailablePoints', () => {
    it('should calculate available points correctly', () => {
      expect(PointsManager.calculateAvailablePoints(100, 30, 10)).toBe(80)
    })

    it('should never return negative points', () => {
      expect(PointsManager.calculateAvailablePoints(100, 120, 5)).toBe(0)
    })

    it('should handle zero values', () => {
      expect(PointsManager.calculateAvailablePoints(0, 0, 0)).toBe(0)
    })

    it('should add earned points correctly', () => {
      expect(PointsManager.calculateAvailablePoints(100, 50, 25)).toBe(75)
    })
  })

  describe('getPointsCost', () => {
    it('should return correct cost for JOB_QUERY', async () => {
      const cost = await PointsManager.getPointsCost('JOB_QUERY')
      expect(cost).toBe(1)
      expect(mockConfigService.getPointsCost).toHaveBeenCalledWith('JOB_QUERY')
    })

    it('should return correct cost for COVER_LETTER', async () => {
      const cost = await PointsManager.getPointsCost('COVER_LETTER')
      expect(cost).toBe(5)
    })

    it('should handle unknown action types', async () => {
      mockConfigService.getPointsCost.mockResolvedValueOnce(1)
      const cost = await PointsManager.getPointsCost('UNKNOWN_ACTION' as PointsSpendType)
      expect(cost).toBe(1)
    })
  })

  describe('canAffordAction', () => {
    const mockBalance = {
      monthly: 100,
      used: 30,
      earned: 10,
      available: 80,
      resetDate: new Date(),
      tier: 'FREE' as SubscriptionTier
    }

    it('should return true when user can afford action', async () => {
      const result = await PointsManager.canAffordAction('JOB_QUERY', mockBalance)
      expect(result.canAfford).toBe(true)
      expect(result.cost).toBe(1)
      expect(result.shortfall).toBeUndefined()
    })

    it('should return false when user cannot afford action', async () => {
      const poorBalance = { ...mockBalance, available: 0 }
      const result = await PointsManager.canAffordAction('COVER_LETTER', poorBalance)
      expect(result.canAfford).toBe(false)
      expect(result.cost).toBe(5)
      expect(result.shortfall).toBe(5)
    })

    it('should calculate shortfall correctly', async () => {
      const limitedBalance = { ...mockBalance, available: 2 }
      const result = await PointsManager.canAffordAction('COVER_LETTER', limitedBalance)
      expect(result.canAfford).toBe(false)
      expect(result.shortfall).toBe(3) // Need 5, have 2
    })
  })

  describe('spendPointsAtomic', () => {
    const userId = 'test-user-123'

    it('should successfully deduct points in atomic transaction', async () => {
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      const pointsToDeduct = 1
      
      setupSuccessfulPointsDeduction(userId, currentPoints, pointsToDeduct)
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })

      const result = await PointsManager.spendPointsAtomic(
        prismaMock,
        userId,
        'JOB_QUERY',
        'search-123'
      )

      expect(result.success).toBe(true)
      expect(result.pointsSpent).toBe(1)
      expect(result.newBalance).toBe(79) // 100 + 10 - 31 = 79
      expect(prismaMock.developer.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { pointsUsed: { increment: 1 } }
      })
    })

    it('should fail when insufficient points', async () => {
      const currentPoints = { monthly: 100, used: 95, earned: 0 } // Only 5 available
      const pointsToDeduct = 10
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          developer: {
            findUnique: jest.fn().mockResolvedValue({
              id: userId,
              subscriptionTier: 'FREE',
              monthlyPoints: currentPoints.monthly,
              pointsUsed: currentPoints.used,
              pointsEarned: currentPoints.earned,
            })
          }
        }
        return await callback(mockTx)
      })

      const result = await PointsManager.spendPointsAtomic(
        prismaMock,
        userId,
        'BULK_APPLICATION'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient points')
    })

    it('should handle user not found', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          developer: {
            findUnique: jest.fn().mockResolvedValue(null)
          }
        }
        return await callback(mockTx)
      })

      const result = await PointsManager.spendPointsAtomic(
        prismaMock,
        'non-existent-user',
        'JOB_QUERY'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should handle transaction timeout', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction timeout'))

      const result = await PointsManager.spendPointsAtomic(
        prismaMock,
        userId,
        'JOB_QUERY'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Transaction timeout')
    })
  })

  describe('getEffectiveCost - Subscription Tier Efficiency', () => {
    it('should apply no discount for FREE tier', async () => {
      const cost = await PointsManager.getEffectiveCost('JOB_QUERY', 'FREE')
      expect(cost).toBe(1) // No discount: 1 * 1.0 = 1
    })

    it('should apply 5% discount for BASIC tier', async () => {
      const cost = await PointsManager.getEffectiveCost('JOB_QUERY', 'BASIC')
      expect(cost).toBe(1) // 5% discount: Math.ceil(1 * 0.95) = 1
    })

    it('should apply 10% discount for STARTER tier', async () => {
      const cost = await PointsManager.getEffectiveCost('COVER_LETTER', 'STARTER')
      expect(cost).toBe(5) // 10% discount: Math.ceil(5 * 0.90) = 5
    })

    it('should apply 15% discount for PRO tier', async () => {
      mockConfigService.getPointsCost.mockResolvedValueOnce(10)
      const cost = await PointsManager.getEffectiveCost('BULK_APPLICATION', 'PRO')
      expect(cost).toBe(9) // 15% discount: Math.ceil(10 * 0.85) = 9
    })

    it('should apply 20% discount for EXPERT tier', async () => {
      mockConfigService.getPointsCost.mockResolvedValueOnce(10)
      const cost = await PointsManager.getEffectiveCost('BULK_APPLICATION', 'EXPERT')
      expect(cost).toBe(8) // 20% discount: Math.ceil(10 * 0.80) = 8
    })

    it('should always round up to prevent fractional points', async () => {
      mockConfigService.getPointsCost.mockResolvedValueOnce(3)
      const cost = await PointsManager.getEffectiveCost('OUTREACH_MESSAGE', 'PRO')
      expect(cost).toBe(3) // Math.ceil(3 * 0.85) = Math.ceil(2.55) = 3
    })
  })

  describe('validatePointsSpend', () => {
    it('should accept valid spend request', async () => {
      const spend = {
        userId: 'user-123',
        amount: 1,
        spendType: 'JOB_QUERY' as PointsSpendType,
        description: 'job query action'
      }

      const result = await PointsManager.validatePointsSpend(spend)
      expect(result.isValid).toBe(true)
    })

    it('should reject negative amounts', async () => {
      const spend = {
        userId: 'user-123',
        amount: -1,
        spendType: 'JOB_QUERY' as PointsSpendType,
        description: 'job query action'
      }

      const result = await PointsManager.validatePointsSpend(spend)
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('cannot be negative')
    })

    it('should reject amount that does not match expected cost', async () => {
      const spend = {
        userId: 'user-123',
        amount: 5, // Expected is 1
        spendType: 'JOB_QUERY' as PointsSpendType,
        description: 'job query action'
      }

      const result = await PointsManager.validatePointsSpend(spend)
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('does not match expected cost')
    })

    it('should require sourceId for COVER_LETTER', async () => {
      const spend = {
        userId: 'user-123',
        amount: 5,
        spendType: 'COVER_LETTER' as PointsSpendType,
        description: 'cover letter generation'
        // Missing sourceId
      }

      const result = await PointsManager.validatePointsSpend(spend)
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('requires role ID')
    })

    it('should require sourceId for CV_SUGGESTION', async () => {
      const spend = {
        userId: 'user-123',
        amount: 2,
        spendType: 'CV_SUGGESTION' as PointsSpendType,
        description: 'cv suggestion'
        // Missing sourceId
      }

      const result = await PointsManager.validatePointsSpend(spend)
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('requires analysis or suggestion ID')
    })
  })

  describe('Edge Cases & Performance', () => {
    it('should handle very large point amounts', () => {
      const result = PointsManager.calculateAvailablePoints(1000000, 500000, 200000)
      expect(result).toBe(700000)
    })

    it('should handle zero monthly allocation', () => {
      const result = PointsManager.calculateAvailablePoints(0, 0, 50)
      expect(result).toBe(50) // Only earned points available
    })

    it('should handle concurrent calculations consistently', () => {
      const results = Array.from({ length: 100 }, () =>
        PointsManager.calculateAvailablePoints(100, 30, 10)
      )
      expect(results.every(r => r === 80)).toBe(true)
    })
  })
})