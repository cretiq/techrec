import { POST } from '../route'
import { jest } from '@jest/globals'
import { prisma } from '@/lib/prisma'

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    role: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe('POST /api/roles', () => {
  const mockRole = {
    title: 'Test Role',
    description: 'Test Description',
    companyId: '65f0123456789a0b1c2d3e4f', // Valid MongoDB ObjectId format
    requirements: ['React', 'TypeScript'],
    location: 'Remote',
    salary: '$100k-$150k',
    type: 'full-time'
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should create a new role successfully', async () => {
    // Mock successful role creation
    const mockCreatedRole = {
      id: '65f0123456789a0b1c2d3e4f',
      title: mockRole.title,
      description: mockRole.description,
      requirements: mockRole.requirements,
      location: mockRole.location,
      salary: mockRole.salary,
      type: mockRole.type,
      company: {
        id: mockRole.companyId,
        name: 'Test Company'
      }
    }
    ;(prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole)

    const request = new Request('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRole),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data).toHaveProperty('_id')
    expect(data.title).toBe(mockRole.title)
    expect(data.description).toBe(mockRole.description)
    expect(data.requirements).toEqual(mockRole.requirements)
    expect(data.company.name).toBe('Test Company')

    // Verify Prisma was called correctly
    expect(prisma.role.create).toHaveBeenCalledWith({
      data: {
        title: mockRole.title,
        description: mockRole.description,
        requirements: mockRole.requirements,
        companyId: mockRole.companyId,
        location: mockRole.location,
        salary: mockRole.salary,
        type: mockRole.type
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  })

  it('should return 400 if required fields are missing', async () => {
    const invalidRole = {
      title: 'Test Role',
      // Missing description and companyId
    }

    const request = new Request('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRole),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Title, description, and company ID are required')

    // Verify Prisma was not called
    expect(prisma.role.create).not.toHaveBeenCalled()
  })

  it('should return 500 if database operation fails', async () => {
    // Mock database error
    ;(prisma.role.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRole),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('Failed to create role')
  })
}) 