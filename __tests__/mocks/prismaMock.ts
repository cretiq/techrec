import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Enhanced Prisma mock specifically for gamification and RapidAPI testing
export const prismaMock = mockDeep<PrismaClient>()

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Mock transaction function for atomic operations
export const mockTransaction = jest.fn()
prismaMock.$transaction.mockImplementation(mockTransaction)

// Helper to setup successful points deduction scenario
export const setupSuccessfulPointsDeduction = (
  userId: string,
  currentPoints: { monthly: number; used: number; earned: number },
  pointsToDeduct: number
) => {
  const available = Math.max(0, currentPoints.monthly + currentPoints.earned - currentPoints.used)
  const newUsed = currentPoints.used + pointsToDeduct
  
  prismaMock.developer.findUnique.mockResolvedValueOnce({
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
    subscriptionTier: 'FREE',
    monthlyPoints: currentPoints.monthly,
    pointsUsed: currentPoints.used,
    pointsEarned: currentPoints.earned,
  } as any)
  
  prismaMock.developer.update.mockResolvedValueOnce({
    id: userId,
    monthlyPoints: currentPoints.monthly,
    pointsUsed: newUsed,
    pointsEarned: currentPoints.earned,
  } as any)
  
  prismaMock.pointsTransaction.create.mockResolvedValueOnce({
    id: 'transaction-id',
    developerId: userId,
    amount: -pointsToDeduct,
    spendType: 'JOB_QUERY',
    source: 'SUBSCRIPTION_MONTHLY',
    description: 'job query action',
    createdAt: new Date(),
  } as any)
  
  return {
    available,
    newBalance: Math.max(0, currentPoints.monthly + currentPoints.earned - newUsed)
  }
}

// Helper to setup insufficient points scenario
export const setupInsufficientPoints = (
  userId: string,
  currentPoints: { monthly: number; used: number; earned: number },
  pointsToDeduct: number
) => {
  const available = Math.max(0, currentPoints.monthly + currentPoints.earned - currentPoints.used)
  
  prismaMock.developer.findUnique.mockResolvedValueOnce({
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
    subscriptionTier: 'FREE',
    monthlyPoints: currentPoints.monthly,
    pointsUsed: currentPoints.used,
    pointsEarned: currentPoints.earned,
  } as any)
  
  return { available, shortfall: pointsToDeduct - available }
}

// Helper to setup transaction callback for atomic operations
export const setupTransactionCallback = (
  mockImplementation: (callback: any) => Promise<any>
) => {
  mockTransaction.mockImplementation(async (callback: any) => {
    return await mockImplementation(callback)
  })
}

// Helper to setup complete transaction mock with all necessary methods
export const setupCompleteTransactionMock = (
  userId: string,
  currentPoints: { monthly: number; used: number; earned: number },
  pointsToDeduct: number
) => {
  const newUsed = currentPoints.used + pointsToDeduct
  const updatedUser = {
    id: userId,
    monthlyPoints: currentPoints.monthly,
    pointsUsed: newUsed,
    pointsEarned: currentPoints.earned,
  }

  const mockTx = {
    developer: {
      findUnique: jest.fn().mockResolvedValue({
        id: userId,
        subscriptionTier: 'FREE',
        ...currentPoints,
      }),
      update: jest.fn().mockResolvedValue(updatedUser),
    },
    pointsTransaction: {
      create: jest.fn().mockResolvedValue({
        id: 'transaction-123',
        developerId: userId,
        amount: -pointsToDeduct,
        spendType: 'JOB_QUERY',
        source: 'SUBSCRIPTION_MONTHLY',
        description: 'job query action',
        createdAt: new Date(),
        metadata: {},
      }),
    },
  }

  prismaMock.$transaction.mockImplementation(async (callback) => {
    return await callback(mockTx)
  })

  return {
    newBalance: Math.max(0, currentPoints.monthly + currentPoints.earned - newUsed),
    mockTx,
  }
}

export type PrismaMockType = typeof prismaMock